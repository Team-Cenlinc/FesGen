import type { FontId } from "@/fonts/stacks";
import type { Lighting, ModuleTweak } from "./types";

/**
 * 排版结果：只含几何图形的渲染树。文字已转成路径，所以序列化出的 SVG
 * 不引用任何字体，画到 canvas、导出 PNG 或换成地图画时在哪台电脑上都一样。
 */
export type RenderNode =
  | {
      kind: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
      rx?: number;
      fill?: string;
      stroke?: string;
      strokeWidth?: number;
    }
  | {
      kind: "line";
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      stroke: string;
      strokeWidth: number;
    }
  | { kind: "path"; d: string; fill?: string; stroke?: string; strokeWidth?: number }
  | { kind: "polygon"; points: string; fill: string }
  | { kind: "group"; transform?: string; children: RenderNode[] };

export interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RenderTree {
  width: number;
  height: number;
  /** 牌子的底色：地图画等比留边时用它填充。 */
  backdrop: string;
  /** 背景层：画在灯光效果下面。 */
  background: RenderNode[];
  /** 内容层：文字、色带、图标，画在灯光效果上面，保持清晰。 */
  content: RenderNode[];
  /** 每个模块在输出像素坐标里的范围，用于点选和选中框。 */
  modules: Record<string, BBox>;
  /** 每个模块里最小的实际字号（像素），用于地图画小字提示。 */
  minTextSize: Record<string, number>;
  /** 每个模块里字体缺字的字符。 */
  missingGlyphs: Record<string, string[]>;
  /** 按主字体汇总的缺字，编辑器据此决定要补哪款补字字体。 */
  missingByPrimary: Partial<Record<FontId, string[]>>;
}

const IDENTITY_TWEAK: ModuleTweak = { dx: 0, dy: 0, scale: 1, hidden: false };

export function tweakOf(tweaks: Readonly<Record<string, ModuleTweak>>, id: string): ModuleTweak {
  return tweaks[id] ?? IDENTITY_TWEAK;
}

export function isIdentityTweak(tweak: ModuleTweak): boolean {
  return tweak.dx === 0 && tweak.dy === 0 && tweak.scale === 1 && !tweak.hidden;
}

/**
 * 给模块套上用户微调：先平移，再以模块中心缩放。返回套好变换的节点和变换后的范围。
 * 隐藏的模块返回 null。
 */
export function applyTweak(
  children: RenderNode[],
  bbox: BBox,
  tweak: ModuleTweak,
): { node: RenderNode; bbox: BBox } | null {
  if (tweak.hidden) return null;
  if (tweak.dx === 0 && tweak.dy === 0 && tweak.scale === 1) {
    return { node: { kind: "group", children }, bbox };
  }
  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;
  const s = tweak.scale;
  return {
    node: {
      kind: "group",
      transform: `translate(${fmt(tweak.dx + cx)} ${fmt(tweak.dy + cy)}) scale(${fmt(s)}) translate(${fmt(-cx)} ${fmt(-cy)})`,
      children,
    },
    bbox: {
      x: cx + tweak.dx - (bbox.width * s) / 2,
      y: cy + tweak.dy - (bbox.height * s) / 2,
      width: bbox.width * s,
      height: bbox.height * s,
    },
  };
}

export function unionBBox(boxes: readonly (BBox | null | undefined)[]): BBox {
  const present = boxes.filter((box): box is BBox => !!box && box.width >= 0 && box.height >= 0);
  if (present.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  const x1 = Math.min(...present.map((box) => box.x));
  const y1 = Math.min(...present.map((box) => box.y));
  const x2 = Math.max(...present.map((box) => box.x + box.width));
  const y2 = Math.max(...present.map((box) => box.y + box.height));
  return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
}

export function scaleBBox(box: BBox, scale: number): BBox {
  return {
    x: box.x * scale,
    y: box.y * scale,
    width: box.width * scale,
    height: box.height * scale,
  };
}

export function fmt(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/\.?0+$/, "");
}

function attrs(entries: Record<string, string | number | undefined>): string {
  return Object.entries(entries)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => ` ${key}="${typeof value === "number" ? fmt(value) : value}"`)
    .join("");
}

function nodeToSvg(node: RenderNode): string {
  switch (node.kind) {
    case "rect":
      return `<rect${attrs({
        x: node.x,
        y: node.y,
        width: node.width,
        height: node.height,
        rx: node.rx,
        fill: node.fill ?? "none",
        stroke: node.stroke,
        "stroke-width": node.stroke ? node.strokeWidth : undefined,
      })}/>`;
    case "line":
      return `<line${attrs({
        x1: node.x1,
        y1: node.y1,
        x2: node.x2,
        y2: node.y2,
        stroke: node.stroke,
        "stroke-width": node.strokeWidth,
      })}/>`;
    case "path":
      return node.d
        ? `<path${attrs({
            d: node.d,
            fill: node.fill ?? "none",
            stroke: node.stroke,
            "stroke-width": node.stroke ? node.strokeWidth : undefined,
          })}/>`
        : "";
    case "polygon":
      return `<polygon${attrs({ points: node.points, fill: node.fill })}/>`;
    case "group":
      return `<g${attrs({ transform: node.transform })}>${node.children.map(nodeToSvg).join("")}</g>`;
  }
}

/**
 * 灯光效果：在背景上叠一层渐变，模拟灯箱透光。
 * 荧光灯是偏暖的柔和上亮下暗；LED 更亮、更冷，中间亮带更明显。
 */
function lightingSvg(lighting: Lighting, width: number, height: number): string {
  if (lighting === "none") return "";
  const stops =
    lighting === "fluore"
      ? [
          [0, "#FFFFFF", 0.22],
          [0.45, "#FFFFFF", 0.06],
          [1, "#000000", 0.08],
        ]
      : [
          [0, "#F2F8FF", 0.36],
          [0.5, "#FFFFFF", 0.18],
          [1, "#0A1A33", 0.06],
        ];
  const gradient = stops
    .map(
      ([offset, color, opacity]) =>
        `<stop offset="${offset}" stop-color="${color}" stop-opacity="${opacity}"/>`,
    )
    .join("");
  return (
    `<defs><linearGradient id="fesgen-lighting" x1="0" y1="0" x2="0" y2="1">${gradient}</linearGradient></defs>` +
    `<rect x="0" y="0" width="${fmt(width)}" height="${fmt(height)}" fill="url(#fesgen-lighting)"/>`
  );
}

export interface SvgOptions {
  lighting: Lighting;
  /** 只画某一层，地图画分层量化时用。 */
  layers?: "all" | "background" | "content";
}

/** 序列化成独立的 SVG 文档字符串（导出、预览、光栅化共用）。 */
export function renderTreeToSvg(tree: RenderTree, options: SvgOptions): string {
  const layers = options.layers ?? "all";
  const parts: string[] = [];
  if (layers !== "content") {
    parts.push(...tree.background.map(nodeToSvg));
    parts.push(lightingSvg(options.lighting, tree.width, tree.height));
  }
  if (layers !== "background") {
    parts.push(...tree.content.map(nodeToSvg));
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${fmt(tree.width)}" height="${fmt(tree.height)}" ` +
    `viewBox="0 0 ${fmt(tree.width)} ${fmt(tree.height)}">${parts.join("")}</svg>`
  );
}
