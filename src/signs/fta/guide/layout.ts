import type { FontId } from "@/fonts/stacks";
import { hexToRgb, labDistanceSquared, rgbToLab } from "@/mapart/colors";
import {
  applyTweak,
  fmt,
  tweakOf,
  unionBBox,
  type BBox,
  type RenderNode,
  type RenderTree,
} from "../../render";
import type { LayoutInput } from "../../types";
import { FTA_BACKGROUNDS, FTA_MARK_HEIGHT, FTA_MARK_WIDTH } from "../assets";
import { FTA_FONT } from "../fonts";
import { contrast, FtaCanvas, ftaMark, INK_DARK, inkOn, polygon } from "../kit";
import {
  FTA_GUIDE_ICONS,
  splitCodes,
  type FtaGuideArrow,
  type FtaGuideContent,
  type FtaGuideIcon,
  type FtaGuideLine,
  type FtaGuideLineMark,
  type FtaGuidePanel,
} from "./content";

/**
 * FTA 导视牌排版，参考 JR 东日本的导视：
 *
 * - 牌子分一到两行，每行由面板首尾相接铺满。面板满行高、自带底色：主色（站台、换乘、设施）、
 *   出口黄、几种固定色或自定义色。打开分隔线时，相邻同色面板之间留 2 px 分隔线，不同色直接相接。
 * - 面板里箭头贴在它指的那一侧（→ ↗ ↘ 在右，其余在左）。其余内容按面板的水平、竖直对齐摆放：
 *   出口编号、设施图标、线路标，然后是中文、英文，去向再小一级；“对调”时文字在前。
 * - 面板底色画在背景层，开灯光时和底色一起受渐变影响；设施图标的字形挖空露出背景层。
 * - 站名面板的站名和线路标归“车站与线路”模块，其余内容归“面板”模块，两者分别微调。
 * - 所有尺寸由行高推出。一行放不下时整行一起按比例缩小，缩到下限仍放不下就提示。
 *
 * 坐标就是输出像素（缩放比 1），小行高时字号有下限，不能简单等比缩放。
 */

export const FTA_GUIDE_MODULES = {
  panels: "panels",
  station: "station",
} as const;

export const ADD_PANEL_ACTION = "add-panel";

const M = FTA_GUIDE_MODULES;

/** 出口黄：地图色板里的 GOLD，深字。 */
export const FTA_GUIDE_EXIT = "#FAEE4D";
const SEPARATOR = 2;
const OUTLINE = 2;
const OUTLINE_CONTRAST = 1.6;
/** 一行放不下时依次试的缩小比例。 */
const SHRINK = [1, 0.92, 0.84, 0.76, 0.68] as const;

interface Theme {
  bg: string;
  ink: string;
  rule: string;
  /** 底色本身就是出口黄这一类黄色：出口编号在上面反色成深底黄字。 */
  exitLike: boolean;
  /** 这块内容的文字记在哪个模块下（最小字号、缺字）。 */
  module: string;
}

/** 和出口黄的色差（CIELAB ΔE）在这以内算“黄色底”。白色和出口黄亮度接近，但色差约 66。 */
const EXIT_LIKE_DELTA_E = 25;
const EXIT_LAB = rgbToLab(hexToRgb(FTA_GUIDE_EXIT)!);

function themeOf(bg: string, module: string = M.panels): Theme {
  const ink = inkOn(bg);
  const rgb = hexToRgb(bg);
  const exitLike =
    rgb !== null && labDistanceSquared(rgbToLab(rgb), EXIT_LAB) < EXIT_LIKE_DELTA_E ** 2;
  return { bg, ink, rule: ink === INK_DARK ? "#A7A7A7" : "#707070", exitLike, module };
}

/** 排好尺寸、还没定位置的一块内容；draw 给出左上角。 */
interface Piece {
  w: number;
  h: number;
  draw(x: number, top: number): RenderNode[];
}

/** 由行高推出的尺寸。k 是放不下时的缩小比例。 */
interface Sizes {
  zh: number;
  en: number;
  toZh: number;
  toEn: number;
  arrow: number;
  tile: number;
  gap: number;
  pad: number;
  arrowGap: number;
  rowMark: number;
  rowZh: number;
  rowEn: number;
  stationZh: number;
  stationEn: number;
  logo: number;
  stationMark: number;
}

function sizesFor(R: number, k: number): Sizes {
  const base = Math.min(R, 128);
  const zh = Math.max(14, Math.round(R * 0.27 * k));
  const en = Math.max(10, Math.round(R * 0.12 * k));
  return {
    zh,
    en,
    toZh: Math.max(12, Math.round(zh * 0.62)),
    toEn: Math.max(10, Math.round(en * 0.85)),
    arrow: Math.round(R * 0.44 * k),
    tile: Math.round(R * 0.36 * k),
    gap: Math.max(4, Math.round(R * 0.07 * k)),
    pad: Math.round(base * 0.11),
    arrowGap: Math.round(base * 0.1),
    rowMark: Math.max(14, Math.round(R * 0.22 * k)),
    rowZh: Math.max(12, Math.round(R * 0.117 * k)),
    rowEn: 10,
    stationZh: Math.max(16, Math.round(R * 0.32 * k)),
    stationEn: Math.max(10, Math.round(R * 0.12 * k)),
    logo: Math.round(R * 0.56 * k),
    stationMark: Math.max(16, Math.round(R * 0.23 * k)),
  };
}

// ————————————————————————— 组合 —————————————————————————

function inline(pieces: readonly Piece[], gap: number): Piece {
  const w = pieces.reduce((sum, p) => sum + p.w, 0) + gap * Math.max(0, pieces.length - 1);
  const h = Math.max(0, ...pieces.map((p) => p.h));
  return {
    w,
    h,
    draw(x, top) {
      const nodes: RenderNode[] = [];
      for (const p of pieces) {
        nodes.push(...p.draw(Math.round(x), Math.round(top + (h - p.h) / 2)));
        x += p.w + gap;
      }
      return nodes;
    },
  };
}

type Align = "start" | "center" | "end";

/** 在 w 宽里放一块 width 宽的内容时的左偏移。 */
function alignOffset(align: Align, w: number, width: number): number {
  return align === "center" ? (w - width) / 2 : align === "end" ? w - width : 0;
}

function stack(pieces: readonly Piece[], gap: number, align: Align = "start"): Piece {
  const w = Math.max(0, ...pieces.map((p) => p.w));
  const h = pieces.reduce((sum, p) => sum + p.h, 0) + gap * Math.max(0, pieces.length - 1);
  return {
    w,
    h,
    draw(x, top) {
      const nodes: RenderNode[] = [];
      for (const p of pieces) {
        nodes.push(...p.draw(Math.round(x + alignOffset(align, w, p.w)), top));
        top += p.h + gap;
      }
      return nodes;
    },
  };
}

// ————————————————————————— 组件 —————————————————————————

/**
 * 双语文字：中文在上、英文在下，都按字形墨迹左对齐。
 * 行高按“国”和“H”的墨迹算，不按这串字自己的，几块面板的文字因此在同一高度。
 */
function bilingual(
  canvas: FtaCanvas,
  theme: Theme,
  main: string,
  second: string,
  mainSize: number,
  secondSize: number,
  font: FontId = FTA_FONT.strong,
  align: Align = "start",
): Piece | null {
  if (!main && !second) return null;
  const ref = canvas.ink(font, "国", mainSize);
  const cap = canvas.ink(FTA_FONT.regular, "H", secondSize);
  const mainInk = main ? canvas.ink(font, main, mainSize) : null;
  const secondInk = second ? canvas.ink(FTA_FONT.regular, second, secondSize) : null;
  const mainW = mainInk ? mainInk.x2 - mainInk.x1 : 0;
  const secondW = secondInk ? secondInk.x2 - secondInk.x1 : 0;
  const gap = Math.max(3, Math.round(mainSize * 0.2));
  const mainH = main ? ref.y2 - ref.y1 : 0;
  const secondH = second ? -cap.y1 : 0;
  const w = Math.ceil(Math.max(mainW, secondW));
  const h = Math.round(mainH + (main && second ? gap : 0) + secondH);
  return {
    w,
    h,
    draw(x, top) {
      const nodes: RenderNode[] = [];
      const offset = (width: number) => alignOffset(align, w, width);
      if (mainInk) {
        nodes.push(
          canvas.text(
            theme.module,
            font,
            main,
            mainSize,
            x + offset(mainW) - mainInk.x1,
            top - ref.y1,
            theme.ink,
          ).node,
        );
      }
      if (secondInk) {
        const baseline = top + (main ? mainH + gap : 0) + secondH;
        nodes.push(
          canvas.text(
            theme.module,
            FTA_FONT.regular,
            second,
            secondSize,
            x + offset(secondW) - secondInk.x1,
            baseline,
            theme.ink,
          ).node,
        );
      }
      return nodes;
    },
  };
}

const RIGHTWARD = new Set<FtaGuideArrow>(["right", "up-right", "down-right"]);
const ANGLE: Readonly<Record<Exclude<FtaGuideArrow, "none">, number>> = {
  right: 0,
  "down-right": 45,
  down: 90,
  "down-left": 135,
  left: 180,
  "up-left": 225,
  up: 270,
  "up-right": 315,
};

/** 箭杆和箭头的粗细相对方框边长；八个方向都一样，斜箭头只是更长。 */
const SHAFT = 0.13;
const HEAD_WIDTH = 0.45;
const HEAD_LENGTH = 0.5;

function arrowShape(length: number, size: number): [number, number][] {
  const t = SHAFT * size;
  const hw = HEAD_WIDTH * size;
  const neck = length - HEAD_LENGTH * size;
  return [
    [0, -t],
    [neck, -t],
    [neck, -hw],
    [length, 0],
    [neck, hw],
    [neck, t],
    [0, t],
  ];
}

function rotate(points: [number, number][], degrees: number): [number, number][] {
  const r = (degrees * Math.PI) / 180;
  const [c, s] = [Math.cos(r), Math.sin(r)];
  return points.map(([x, y]) => [x * c - y * s, x * s + y * c]);
}

function extent(points: readonly [number, number][]) {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    w: Math.max(...xs) - Math.min(...xs),
    h: Math.max(...ys) - Math.min(...ys),
  };
}

/**
 * 箭头的多边形，放进 size × size 的方框里居中。
 * 八个方向的箭杆粗细和箭头大小都相同：斜箭头拉长，直到转 45° 后正好撑满方框。
 */
export function arrowPolygon(
  dir: Exclude<FtaGuideArrow, "none">,
  size: number,
): [number, number][] {
  const angle = ANGLE[dir];
  let length = size;
  if (angle % 90 !== 0) {
    let lo = size;
    let hi = size * 2;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      const box = extent(rotate(arrowShape(mid, size), angle));
      if (Math.max(box.w, box.h) > size) hi = mid;
      else lo = mid;
    }
    length = lo;
  }
  const points = rotate(arrowShape(length, size), angle);
  const box = extent(points);
  return points.map(([x, y]) => [x - box.x + (size - box.w) / 2, y - box.y + (size - box.h) / 2]);
}

function arrow(theme: Theme, dir: Exclude<FtaGuideArrow, "none">, size: number): Piece {
  return {
    w: size,
    h: size,
    draw(x, top) {
      return [
        polygon(
          arrowPolygon(dir, size).map(([px, py]) => [x + px, top + py]),
          theme.ink,
        ),
      ];
    },
  };
}

/** 方块和底色太接近时，外面描一圈字色。 */
function outlined(
  theme: Theme,
  fill: string,
  x: number,
  y: number,
  w: number,
  h: number,
): RenderNode[] {
  return contrast(fill, theme.bg) < OUTLINE_CONTRAST
    ? [
        {
          kind: "rect",
          x: x - OUTLINE,
          y: y - OUTLINE,
          width: w + 2 * OUTLINE,
          height: h + 2 * OUTLINE,
          fill: theme.ink,
        },
      ]
    : [];
}

/**
 * 轮廓的面积重心的横坐标。路径是 opentype.js 输出的绝对坐标（M L Q C Z），曲线按控制点折线近似；
 * 外轮廓和字怀的走向相反，带符号的面积相加时字怀自然被减掉。
 */
export function centroidX(d: string): number | null {
  let area = 0;
  let moment = 0;
  let start: [number, number] | null = null;
  let prev: [number, number] | null = null;
  const edge = (a: [number, number], b: [number, number]) => {
    const cross = a[0] * b[1] - b[0] * a[1];
    area += cross;
    moment += (a[0] + b[0]) * cross;
  };
  for (const [, cmd, args] of d.matchAll(/([MLQCZ])([^MLQCZ]*)/gi)) {
    const nums = (args!.match(/-?\d*\.?\d+(?:e-?\d+)?/gi) ?? []).map(Number);
    const points: [number, number][] = [];
    for (let i = 0; i + 1 < nums.length; i += 2) points.push([nums[i]!, nums[i + 1]!]);
    if (cmd === "M") {
      if (start && prev) edge(prev, start);
      start = prev = points[0] ?? null;
    } else if (cmd === "Z") {
      if (start && prev) edge(prev, start);
      prev = start;
    } else {
      for (const point of points) {
        if (prev) edge(prev, point);
        prev = point;
      }
    }
  }
  if (start && prev) edge(prev, start);
  return Math.abs(area) < 1e-6 ? null : moment / (3 * area);
}

/**
 * 方块里居中放一串字。竖向按墨迹居中；横向按字形的面积重心居中，
 * 这样“1”这种墨迹偏一边的字（旗子在左、笔画在右）看起来也在正中。
 */
function centeredLabel(
  canvas: FtaCanvas,
  module: string,
  value: string,
  size: number,
  box: number,
  x: number,
  top: number,
  fill: string,
): RenderNode {
  const ink = canvas.ink(FTA_FONT.name, value, size);
  const baseline = top + (box - (ink.y2 - ink.y1)) / 2 - ink.y1;
  const inkLeft = x + (box - (ink.x2 - ink.x1)) / 2 - ink.x1;
  const probe = canvas.text(module, FTA_FONT.name, value, size, 0, baseline, fill).node;
  const cx = probe.kind === "path" ? centroidX(probe.d) : null;
  const left = cx === null ? inkLeft : x + box / 2 - cx;
  return canvas.text(module, FTA_FONT.name, value, size, left, baseline, fill).node;
}

/**
 * 出口编号：黄底深字方块。放在黄色底（出口黄面板、自定义的黄色）上时反色成深底黄字；
 * 白底等别的浅色底上仍是黄底，和底色太接近时描一圈字色。
 */
function exitBadge(canvas: FtaCanvas, theme: Theme, label: string, size: number): Piece {
  const onExit = theme.exitLike;
  const fill = onExit ? INK_DARK : FTA_GUIDE_EXIT;
  const ink = onExit ? FTA_GUIDE_EXIT : INK_DARK;
  const fontSize = size * (label.length > 1 ? 0.56 : 0.74);
  return {
    w: size,
    h: size,
    draw(x, top) {
      return [
        ...(onExit ? [] : outlined(theme, fill, x, top, size, size)),
        { kind: "rect", x, y: top, width: size, height: size, fill },
        centeredLabel(canvas, theme.module, label, fontSize, size, x, top, ink),
      ];
    },
  };
}

/** 线路标：只表示哪条线，不带站序号。三种画法：实心方块、色框方块、色条。 */
function lineMark(
  canvas: FtaCanvas,
  theme: Theme,
  line: FtaGuideLine,
  size: number,
  variant: FtaGuideLineMark,
): Piece {
  if (variant === "bar") {
    const w = Math.max(4, Math.round(size * 0.2));
    return {
      w,
      h: size,
      draw: (x, top) => [
        ...outlined(theme, line.color, x, top, w, size),
        { kind: "rect", x, y: top, width: w, height: size, fill: line.color },
      ],
    };
  }
  const code = line.code || "?";
  const fontSize = size * (code.length > 2 ? 0.36 : 0.48);
  return {
    w: size,
    h: size,
    draw(x, top) {
      if (variant === "frame") {
        const b = Math.max(3, Math.round(size * 0.13));
        return [
          { kind: "rect", x, y: top, width: size, height: size, fill: line.color },
          {
            kind: "rect",
            x: x + b,
            y: top + b,
            width: size - 2 * b,
            height: size - 2 * b,
            fill: "#FFFFFF",
          },
          centeredLabel(canvas, theme.module, code, fontSize, size, x, top, INK_DARK),
        ];
      }
      return [
        ...outlined(theme, line.color, x, top, size, size),
        { kind: "rect", x, y: top, width: size, height: size, fill: line.color },
        centeredLabel(canvas, theme.module, code, fontSize, size, x, top, inkOn(line.color)),
      ];
    },
  };
}

/**
 * 线路标单独出现时用的样子。色条本身看不出是哪条线，所以色条后面总跟着线路名；
 * 方块里有线路代号，单独放就够了。
 */
function lineTag(
  canvas: FtaCanvas,
  theme: Theme,
  line: FtaGuideLine,
  size: number,
  variant: FtaGuideLineMark,
): Piece {
  const mark = lineMark(canvas, theme, line, size, variant);
  if (variant !== "bar") return mark;
  const name = bilingual(canvas, theme, line.name || line.code, "", Math.round(size * 0.62), 10);
  return name ? inline([mark, name], Math.max(3, Math.round(size * 0.22))) : mark;
}

const circle = (cx: number, cy: number, r: number) =>
  `M${fmt(cx - r)} ${fmt(cy)}a${fmt(r)} ${fmt(r)} 0 1 0 ${fmt(2 * r)} 0a${fmt(r)} ${fmt(r)} 0 1 0 ${fmt(-2 * r)} 0Z`;

/** 圆弧上的点，从 a0 到 a1（弧度）取 steps 段。 */
function arcPoints(
  cx: number,
  cy: number,
  r: number,
  a0: number,
  a1: number,
  steps = 16,
): [number, number][] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / steps;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
}

/**
 * 设施图标的字形，坐标在 0–1 的方框里。全部是填充形状（没有描边），因为它们用作挖空：
 * 蒙版里描边路径也会被填满。暂用几何简画，正式图标之后单独设计。
 */
function iconGlyph(icon: FtaGuideIcon): RenderNode[] {
  const fill = "#000";
  const rect = (x: number, y: number, width: number, height: number): RenderNode => ({
    kind: "rect",
    x,
    y,
    width,
    height,
    fill,
  });
  switch (icon) {
    case "info":
      return [{ kind: "path", d: circle(0.5, 0.26, 0.1), fill }, rect(0.41, 0.42, 0.18, 0.4)];
    case "elevator":
      return [
        polygon(
          [
            [0.28, 0.44],
            [0.5, 0.14],
            [0.72, 0.44],
          ],
          fill,
        ),
        polygon(
          [
            [0.28, 0.56],
            [0.72, 0.56],
            [0.5, 0.86],
          ],
          fill,
        ),
      ];
    case "stairs":
      return [
        polygon(
          [
            [0.14, 0.86],
            [0.14, 0.7],
            [0.32, 0.7],
            [0.32, 0.52],
            [0.5, 0.52],
            [0.5, 0.34],
            [0.68, 0.34],
            [0.68, 0.16],
            [0.86, 0.16],
            [0.86, 0.86],
          ],
          fill,
        ),
      ];
    case "toilet":
      return [
        { kind: "path", d: circle(0.3, 0.24, 0.085) + circle(0.7, 0.24, 0.085), fill },
        rect(0.21, 0.37, 0.18, 0.47),
        polygon(
          [
            [0.7, 0.36],
            [0.85, 0.66],
            [0.55, 0.66],
          ],
          fill,
        ),
        rect(0.62, 0.64, 0.16, 0.2),
        rect(0.485, 0.16, 0.03, 0.7),
      ];
    case "accessible": {
      // 轮子是一段圆环：外圈顺着走、内圈倒回来，围成一个填充形状。
      const [a0, a1] = [-0.3, Math.PI * 1.55];
      const ring = [
        ...arcPoints(0.42, 0.63, 0.245, a0, a1),
        ...arcPoints(0.42, 0.63, 0.175, a1, a0),
      ];
      return [
        { kind: "path", d: circle(0.42, 0.17, 0.085), fill },
        rect(0.375, 0.3, 0.09, 0.305),
        rect(0.375, 0.515, 0.3, 0.09),
        polygon(
          [
            [0.61, 0.515],
            [0.7, 0.515],
            [0.805, 0.84],
            [0.715, 0.84],
          ],
          fill,
        ),
        polygon(ring, fill),
      ];
    }
    case "ticket": {
      // 两侧各一个半圆缺口。
      const notch = 0.07;
      return [
        polygon(
          [
            [0.16, 0.3],
            [0.84, 0.3],
            ...arcPoints(0.84, 0.5, notch, -Math.PI / 2, -Math.PI * 1.5, 8),
            [0.84, 0.7],
            [0.16, 0.7],
            ...arcPoints(0.16, 0.5, notch, Math.PI / 2, -Math.PI / 2, 8),
          ],
          fill,
        ),
      ];
    }
  }
}

/** 设施图标：字色方块，字形挖空，露出下面背景层里的面板底色（开灯光时也一致）。 */
function icon(theme: Theme, name: FtaGuideIcon, size: number): Piece {
  return {
    w: size,
    h: size,
    draw: (x, top) => [
      {
        kind: "group",
        transform: `translate(${fmt(x)} ${fmt(top)}) scale(${fmt(size)})`,
        children: [{ kind: "rect", x: 0, y: 0, width: 1, height: 1, fill: theme.ink }],
        holes: iconGlyph(name),
      },
    ],
  };
}

function logo(theme: Theme, height: number): Piece {
  return {
    w: Math.round((height * FTA_MARK_WIDTH) / FTA_MARK_HEIGHT),
    h: height,
    draw: (x, top) => [ftaMark(x, top, height, theme.ink !== INK_DARK)],
  };
}

// ————————————————————————— 面板 —————————————————————————

interface PanelContext {
  canvas: FtaCanvas;
  content: FtaGuideContent;
  lines: ReadonlyMap<string, FtaGuideLine>;
}

/** 整块牌子的主色。 */
export function mainColor(c: FtaGuideContent): string {
  return c.background === "custom" ? c.backgroundColor : FTA_BACKGROUNDS[c.background];
}

function panelBackground(c: FtaGuideContent, panel: FtaGuidePanel): string {
  switch (panel.tone) {
    case "main":
      return mainColor(c);
    case "exit":
      return FTA_GUIDE_EXIT;
    case "custom":
      return panel.color;
    default:
      return FTA_BACKGROUNDS[panel.tone];
  }
}

function panelLines(ctx: PanelContext, panel: FtaGuidePanel): FtaGuideLine[] {
  return splitCodes(panel.lines)
    .map((code) => ctx.lines.get(code.toUpperCase()))
    .filter((line): line is FtaGuideLine => line !== undefined);
}

function stationContent(
  ctx: PanelContext,
  theme: Theme,
  panel: FtaGuidePanel,
  z: Sizes,
  align: Align,
): Piece | null {
  const { canvas, content: c } = ctx;
  // 面板填了站名覆盖就用它，否则用“车站与线路”里的站名；中英文各自覆盖。
  const name = bilingual(
    canvas,
    theme,
    panel.stationName || c.station.name,
    panel.stationSecondary || c.station.secondary,
    z.stationZh,
    z.stationEn,
    FTA_FONT.name,
    align,
  );
  const marks = c.lines.map((line) => lineTag(canvas, theme, line, z.stationMark, c.lineMark));
  const spacing = c.lineMark === "bar" ? z.gap * 2 : Math.round(z.gap * 0.7);
  const parts = [name, marks.length ? inline(marks, spacing) : null].filter(
    (p): p is Piece => p !== null,
  );
  return parts.length ? stack(parts, z.gap, align) : null;
}

function destContent(
  ctx: PanelContext,
  theme: Theme,
  panel: FtaGuidePanel,
  z: Sizes,
): Piece | null {
  const { canvas, content: c } = ctx;
  const lines = panelLines(ctx, panel);
  const head: Piece[] = [
    ...splitCodes(panel.exits).map((label) => exitBadge(canvas, theme, label, z.tile)),
    ...FTA_GUIDE_ICONS.filter((name) => panel.icons[name]).map((name) => icon(theme, name, z.tile)),
  ];
  const align = panel.align;
  const main = bilingual(
    canvas,
    theme,
    panel.name,
    panel.secondary,
    z.zh,
    z.en,
    FTA_FONT.strong,
    align,
  );
  // 有主文字时线路标排在它前面；没有主文字时每条线一行：线路标 + 线名。
  if (main) head.push(...lines.map((line) => lineTag(canvas, theme, line, z.tile, c.lineMark)));
  const rows: Piece[] = [];
  if (head.length || main) {
    const items = !main ? head : panel.flip ? [main, ...head] : [...head, main];
    rows.push(inline(items, main && head.length ? Math.round(z.gap * 1.5) : z.gap));
  }
  if (!main) {
    for (const line of lines) {
      // 色条看不出是哪条线，没填线路名时退回写线路代号；方块里本来就有代号。
      const label = line.name || (c.lineMark === "bar" ? line.code : "");
      const name = bilingual(canvas, theme, label, line.secondary, z.rowZh, z.rowEn);
      const mark = lineMark(canvas, theme, line, z.rowMark, c.lineMark);
      const pair = !name ? [mark] : panel.flip ? [name, mark] : [mark, name];
      rows.push(inline(pair, Math.max(4, Math.round(z.rowMark * 0.3))));
    }
  }
  const to = bilingual(
    canvas,
    theme,
    panel.to,
    panel.toSecondary,
    z.toZh,
    z.toEn,
    FTA_FONT.strong,
    align,
  );
  if (to) rows.push(to);
  return rows.length ? stack(rows, Math.round(z.gap * 1.2), align) : null;
}

interface PlacedPanel {
  index: number;
  panel: FtaGuidePanel;
  theme: Theme;
  arrow: Piece | null;
  body: Piece | null;
  natural: number;
}

function buildRow(
  ctx: PanelContext,
  entries: readonly { panel: FtaGuidePanel; index: number }[],
  R: number,
  k: number,
): { panels: PlacedPanel[]; width: number; z: Sizes } {
  const z = sizesFor(R, k);
  const panels = entries.map(({ panel, index }) => {
    const module = panel.kind === "station" ? M.station : M.panels;
    const theme = themeOf(panelBackground(ctx.content, panel), module);
    const arrowPiece = panel.arrow === "none" ? null : arrow(theme, panel.arrow, z.arrow);
    const body =
      panel.kind === "station" && panel.logo
        ? inline(
            (panel.flip
              ? [stationContent(ctx, theme, panel, z, panel.align), logo(theme, z.logo)]
              : [logo(theme, z.logo), stationContent(ctx, theme, panel, z, panel.align)]
            ).filter((p): p is Piece => p !== null),
            z.gap * 2,
          )
        : panel.kind === "station"
          ? stationContent(ctx, theme, panel, z, panel.align)
          : destContent(ctx, theme, panel, z);
    const natural =
      2 * z.pad + (body?.w ?? 0) + (arrowPiece ? arrowPiece.w + (body ? z.arrowGap : 0) : 0);
    return { index, panel, theme, arrow: arrowPiece, body, natural };
  });
  const sep = ctx.content.dividers ? SEPARATOR : 0;
  const width = panels.reduce((sum, p) => sum + p.natural, 0) + sep * (panels.length - 1);
  return { panels, width, z };
}

export function layoutFtaGuide({
  content: c,
  size,
  shaper,
  tweaks,
}: LayoutInput<FtaGuideContent>): RenderTree {
  const canvas = new FtaCanvas(shaper, tweaks, 1, size.width, size.height);
  const W = size.width;
  const lines = new Map(c.lines.filter((l) => l.code).map((l) => [l.code.toUpperCase(), l]));
  const ctx: PanelContext = { canvas, content: c, lines };

  for (const [index, panel] of c.panels.entries()) {
    const missing = splitCodes(panel.lines).filter((code) => !lines.has(code.toUpperCase()));
    if (panel.kind === "dest" && missing.length) {
      canvas.warn(
        M.panels,
        `面板 ${index + 1} 的线路代号 ${missing.join("、")} 在“车站”的线路里找不到。`,
      );
    }
  }

  const rowCount = c.panels.some((p) => p.row === "2") ? 2 : 1;
  const fills: RenderNode[] = [];
  const nodes: RenderNode[] = [];
  // 站名面板的站名和线路标单独成“车站与线路”模块，可以单独微调。
  const stationNodes: RenderNode[] = [];
  const stationBoxes: BBox[] = [];
  const items: Record<string, BBox> = {};
  let y = 0;
  for (let r = 0; r < rowCount; r++) {
    const R = r === rowCount - 1 ? size.height - y : Math.round(size.height / rowCount);
    const entries = c.panels
      .map((panel, index) => ({ panel, index }))
      .filter(({ panel }) => Number(panel.row) - 1 === r);
    if (entries.length === 0) {
      fills.push({
        kind: "rect",
        x: 0,
        y,
        width: W,
        height: R,
        fill: mainColor(c),
      });
      y += R;
      continue;
    }
    let row = buildRow(ctx, entries, R, SHRINK[0]);
    for (const k of SHRINK.slice(1)) {
      if (row.width <= W) break;
      row = buildRow(ctx, entries, R, k);
    }
    if (row.width > W) {
      canvas.warn(
        M.panels,
        `第 ${r + 1} 行放不下，缩到最小仍超出 ${Math.ceil(row.width - W)} px。`,
      );
    }
    // 剩下的宽度分给“撑满”的面板；都不撑满时平分给每一块。
    const spare = Math.max(0, W - row.width);
    const growers = row.panels.filter((p) => p.panel.fill);
    const share = growers.length ? growers : row.panels;
    let given = 0;
    let x = 0;
    row.panels.forEach((p, i) => {
      const last = i === row.panels.length - 1;
      let extra = 0;
      if (share.includes(p)) {
        const isLastShare = p === share[share.length - 1];
        extra = isLastShare ? spare - given : Math.floor(spare / share.length);
        given += extra;
      }
      const width = last ? Math.max(p.natural, W - x) : p.natural + extra;
      fills.push({ kind: "rect", x, y, width, height: R, fill: p.theme.bg });
      items[`${M.panels}#${p.index}`] = { x, y, width, height: R };
      // 竖直对齐：靠上、靠下时离边一个内边距；箭头和内容一起对齐。
      const pad = row.z.pad;
      const mid = (h: number) =>
        p.panel.valign === "top"
          ? y + pad
          : p.panel.valign === "bottom"
            ? y + R - pad - h
            : y + Math.round((R - h) / 2);
      let left = x + pad;
      let right = x + width - pad;
      if (p.arrow) {
        if (RIGHTWARD.has(p.panel.arrow)) {
          nodes.push(...p.arrow.draw(right - p.arrow.w, mid(p.arrow.h)));
          right -= p.arrow.w + row.z.arrowGap;
        } else {
          nodes.push(...p.arrow.draw(left, mid(p.arrow.h)));
          left += p.arrow.w + row.z.arrowGap;
        }
      }
      if (p.body) {
        const bx = Math.round(left + alignOffset(p.panel.align, right - left, p.body.w));
        const by = mid(p.body.h);
        if (p.panel.kind === "station") {
          stationNodes.push(...p.body.draw(bx, by));
          stationBoxes.push({ x: bx, y: by, width: p.body.w, height: p.body.h });
        } else {
          nodes.push(...p.body.draw(bx, by));
        }
      }
      x += width;
      const next = row.panels[i + 1];
      if (next && c.dividers) {
        // 同色面板之间露出分隔线，不同色直接相接。
        fills.push({
          kind: "rect",
          x,
          y,
          width: SEPARATOR,
          height: R,
          fill: next.theme.bg === p.theme.bg ? p.theme.rule : p.theme.bg,
        });
        x += SEPARATOR;
      }
    });
    if (r > 0 && c.dividers) {
      const rule = themeOf(mainColor(c)).rule;
      fills.push({ kind: "rect", x: 0, y: y - 1, width: W, height: SEPARATOR, fill: rule });
    }
    y += R;
  }

  const whole = { x: 0, y: 0, width: W, height: size.height };
  canvas.add(M.panels, nodes, whole, items);
  if (stationNodes.length) canvas.add(M.station, stationNodes, unionBBox(stationBoxes));
  canvas.affordance(ADD_PANEL_ACTION, "添加面板", W, size.height, `${M.panels}#${c.panels.length}`);
  // 面板底色在背景层，但和面板内容是同一个模块：微调、隐藏“面板”时一起移动、一起隐藏。
  const tweakedFills = applyTweak(fills, whole, tweakOf(tweaks, M.panels));
  return canvas.tree(mainColor(c), tweakedFills ? [tweakedFills.node] : []);
}
