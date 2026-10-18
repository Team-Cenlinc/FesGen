import type { InkBounds, TextShaper } from "@/fonts/shaper";
import { fontStack, type FontId } from "@/fonts/stacks";
import { hexToRgb, unpackRgb, type Rgb } from "@/mapart/colors";
import { MapPalette } from "@/mapart/palette";
import {
  applyTweak,
  fmt,
  scaleBBox,
  tweakOf,
  type Affordance,
  type BBox,
  type RenderNode,
  type RenderTree,
} from "../render";
import type { ModuleTweak } from "../types";
import {
  FTA_MARK_DARK,
  FTA_MARK_GLYPH_PATH,
  FTA_MARK_GLYPH_POLYGON,
  FTA_MARK_HEIGHT,
  FTA_MARK_LIGHT,
  FTA_MARK_PLATE,
  FTA_SLANT,
} from "./assets";
import { FTA_FONT } from "./fonts";

/**
 * FTA 牌子共用的排版工具：车站牌和以后的导视牌都用这一套。
 * 坐标一律是设计单位，最后整体乘缩放比 s 得到输出像素；需要落在整像素上的边和基线用 snap 对齐。
 */

/** Noto Sans Display 的大写字母和数字高度（相对字号）。 */
export const CAP = 0.714;
/** 字形大致占据的纵向范围（相对字号），用于选中框。 */
const ASCENT = 0.88;
const DESCENT = 0.14;

/** 线路色上的深字和浅字，与 FetaruteTCAddon 的 PidsTheme.textOn 相同，两者本身就在地图色板里。 */
export const INK_DARK = "#191919";
export const INK_LIGHT = "#FFFFFF";

let palette: MapPalette | null = null;

function rgbLuminance(rgb: Rgb): number {
  const linear = unpackRgb(rgb).map((channel) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!;
}

/** sRGB 相对亮度；颜色写法不对时按白色处理。 */
export function luminance(hex: string): number {
  return rgbLuminance(hexToRgb(hex) ?? 0xffffff);
}

/**
 * 线路色上的字用深色还是浅色：按线路色吸附到地图色板之后的亮度判断，低于 0.25 用浅色。
 * 不能按原色判断，比如 #E4007F 会被吸成浅粉，按原色选的白字在地图画里就看不见了。
 */
export function inkOn(hex: string): string {
  const rgb = hexToRgb(hex);
  if (rgb === null) return INK_DARK;
  palette ??= MapPalette.minecraft();
  return rgbLuminance(palette.nearest(rgb).rgb) < 0.25 ? INK_LIGHT : INK_DARK;
}

export function polygon(points: readonly (readonly [number, number])[], fill: string): RenderNode {
  return { kind: "polygon", points: points.map(([x, y]) => `${fmt(x)},${fmt(y)}`).join(" "), fill };
}

/** 平行四边形：上边往右、下边往左各偏 slant × 高 / 2。slant 为 0 时就是矩形。 */
export function slantedBox(
  x: number,
  y: number,
  width: number,
  height: number,
  slant: number,
): [number, number][] {
  const d = (height * slant) / 2;
  return [
    [x + d, y],
    [x + width + d, y],
    [x + width - d, y + height],
    [x - d, y + height],
  ];
}

/** FTA 标志：左上角放在 (x, y)，高 height。反色版是浅色底板、深色字形。 */
export function ftaMark(x: number, y: number, height: number, reversed: boolean): RenderNode {
  const plate = reversed ? FTA_MARK_LIGHT : FTA_MARK_DARK;
  const glyph = reversed ? FTA_MARK_DARK : FTA_MARK_LIGHT;
  return {
    kind: "group",
    transform: `translate(${fmt(x)} ${fmt(y)}) scale(${(height / FTA_MARK_HEIGHT).toFixed(5)})`,
    children: [
      { kind: "polygon", points: FTA_MARK_PLATE, fill: plate },
      { kind: "path", d: FTA_MARK_GLYPH_PATH, fill: glyph },
      { kind: "polygon", points: FTA_MARK_GLYPH_POLYGON, fill: glyph },
    ],
  };
}

export interface TextResult {
  node: RenderNode;
  bbox: BBox | null;
  width: number;
}

/**
 * 一次排版的画布：收集内容节点、模块范围、列表项范围、最小字号、缺字和排版提示。
 * 和北宿的排版函数做的是同一件事，抽出来给 FTA 的几种版式共用。
 */
export class FtaCanvas {
  private readonly nodes: RenderNode[] = [];
  private readonly modules: Record<string, BBox> = {};
  private readonly items: Record<string, BBox> = {};
  private readonly minTextSize: Record<string, number> = {};
  private readonly missingGlyphs: Record<string, string[]> = {};
  private readonly missingByPrimary: Partial<Record<FontId, string[]>> = {};
  private readonly warnings: Record<string, string[]> = {};
  private readonly affordances: Affordance[] = [];
  /** 缺字先按模块暂存，模块真正画上去才汇总；隐藏的模块不应触发补字提示。 */
  private readonly pendingMisses: Record<string, Partial<Record<FontId, string[]>>> = {};

  constructor(
    private readonly shaper: TextShaper,
    private readonly tweaks: Readonly<Record<string, ModuleTweak>>,
    /** 设计单位到输出像素的缩放比。 */
    readonly s: number,
    readonly width: number,
    readonly height: number,
  ) {}

  /** 设计尺寸：输出尺寸除以缩放比。 */
  get designWidth(): number {
    return this.width / this.s;
  }

  get designHeight(): number {
    return this.height / this.s;
  }

  /** 设计坐标换成整数输出像素。 */
  px(value: number): number {
    return Math.round(value * this.s);
  }

  /** 输出像素换回设计坐标。 */
  du(pixels: number): number {
    return pixels / this.s;
  }

  /** 对齐到输出像素：色块边缘和文字基线落在整像素上，地图画里才不会多出一条杂色边。 */
  snap(value: number): number {
    return Math.round(value * this.s) / this.s;
  }

  measure(font: FontId, value: string, size: number): number {
    return this.shaper.measure(fontStack(font), value, size);
  }

  /** 字形边界；排版器没有提供时按字宽估算。 */
  ink(font: FontId, value: string, size: number): InkBounds {
    if (this.shaper.bounds) return this.shaper.bounds(fontStack(font), value, size);
    return { x1: 0, x2: this.measure(font, value, size), y1: -CAP * size, y2: 0 };
  }

  /**
   * 排一段文字（基线对齐到整像素），同时记下这个模块的最小字号和缺字。
   * skew 是仿斜的角度（度），中文没有斜体时用。
   */
  text(
    moduleId: string,
    font: FontId,
    value: string,
    size: number,
    x: number,
    y: number,
    fill: string,
    skew = 0,
  ): TextResult {
    const base = this.snap(y);
    const shaped = this.shaper.shape(fontStack(font), value, size, x, base, "start");
    if (!value) return { node: { kind: "path", d: "", fill }, bbox: null, width: 0 };
    const effective = size * this.s * tweakOf(this.tweaks, moduleId).scale;
    this.minTextSize[moduleId] = Math.min(this.minTextSize[moduleId] ?? Infinity, effective);
    if (shaped.missing.length > 0) {
      this.missingGlyphs[moduleId] = [
        ...new Set([...(this.missingGlyphs[moduleId] ?? []), ...shaped.missing]),
      ];
      const pending = (this.pendingMisses[moduleId] ??= {});
      pending[font] = [...new Set([...(pending[font] ?? []), ...shaped.missing])];
    }
    let node: RenderNode = { kind: "path", d: shaped.d, fill };
    let extra = 0;
    if (skew) {
      node = {
        kind: "group",
        transform: `translate(0 ${fmt(base)}) skewX(${fmt(-skew)}) translate(0 ${fmt(-base)})`,
        children: [node],
      };
      extra = size * ASCENT * Math.tan((skew * Math.PI) / 180);
    }
    return {
      node,
      bbox: {
        x: shaped.x,
        y: base - size * ASCENT,
        width: shaped.width + extra,
        height: size * (ASCENT + DESCENT),
      },
      width: shaped.width,
    };
  }

  /** 放入一个模块：套上用户微调，记下范围；items 是模块里列表项的范围（设计坐标）。 */
  add(id: string, children: RenderNode[], bbox: BBox, items: Record<string, BBox> = {}) {
    const tweak = tweakOf(this.tweaks, id);
    const tweaked = applyTweak(children, bbox, tweak);
    const misses = this.pendingMisses[id] ?? {};
    delete this.pendingMisses[id];
    if (!tweaked) {
      delete this.minTextSize[id];
      delete this.missingGlyphs[id];
      return;
    }
    for (const [font, chars] of Object.entries(misses) as [FontId, string[]][]) {
      this.missingByPrimary[font] = [
        ...new Set([...(this.missingByPrimary[font] ?? []), ...chars]),
      ];
    }
    this.nodes.push(tweaked.node);
    this.modules[id] = scaleBBox(tweaked.bbox, this.s);
    // 列表项跟着模块一起平移、缩放。
    const cx = bbox.x + bbox.width / 2;
    const cy = bbox.y + bbox.height / 2;
    for (const [itemId, box] of Object.entries(items)) {
      this.items[itemId] = scaleBBox(
        {
          x: cx + tweak.dx + (box.x - cx) * tweak.scale,
          y: cy + tweak.dy + (box.y - cy) * tweak.scale,
          width: box.width * tweak.scale,
          height: box.height * tweak.scale,
        },
        this.s,
      );
    }
  }

  warn(moduleId: string, message: string) {
    const list = (this.warnings[moduleId] ??= []);
    if (!list.includes(message)) list.push(message);
  }

  /** 牌面快捷按钮：锚点是设计坐标，按钮放在锚点下方、右边缘对齐锚点。 */
  affordance(action: string, label: string, x: number, y: number, select?: string) {
    this.affordances.push({
      action,
      label,
      x: x * this.s,
      y: y * this.s,
      placement: "below-end",
      select,
    });
  }

  tree(background: string): RenderTree {
    const root = (children: RenderNode[]): RenderNode[] => [
      { kind: "group", transform: `scale(${fmt(this.s)})`, children },
    ];
    return {
      width: this.width,
      height: this.height,
      backdrop: background,
      background: root([
        {
          kind: "rect",
          x: 0,
          y: 0,
          width: this.designWidth,
          height: this.designHeight,
          fill: background,
        },
      ]),
      content: root(this.nodes),
      modules: this.modules,
      minTextSize: this.minTextSize,
      missingGlyphs: this.missingGlyphs,
      missingByPrimary: this.missingByPrimary,
      items: this.items,
      warnings: this.warnings,
      affordances: this.affordances,
    };
  }
}

/**
 * 站号块的尺寸：字高取整数像素，并和所在色带的高度奇偶一致，上下留白正好相等；
 * 色块边缘都落在整像素上。
 */
export interface ChipMetrics {
  /** 块的上边和高（设计单位）。 */
  top: number;
  height: number;
  /** 实际字号（设计单位）。 */
  size: number;
  /** 以输出像素计的上下、左右留白和字高。 */
  padYpx: number;
  padXpx: number;
  capPx: number;
  topPx: number;
}

export function chipMetrics(
  canvas: FtaCanvas,
  bandTop: number,
  bandBottom: number,
  size = 18,
): ChipMetrics {
  const topPx = canvas.px(bandTop);
  const heightPx = canvas.px(bandBottom) - topPx;
  const exact = CAP * size * canvas.s;
  let capPx = Math.max(1, Math.round(exact));
  // 奇偶对不上时往上取；字高 8 px 以下再往下就认不出了。
  if ((heightPx - capPx) % 2 !== 0) capPx += exact >= capPx || capPx <= 8 ? 1 : -1;
  const padYpx = Math.max(2, Math.round(6.5 * canvas.s));
  const chipPx = capPx + 2 * padYpx;
  const chipTopPx = topPx + (heightPx - chipPx) / 2;
  return {
    top: canvas.du(chipTopPx),
    height: canvas.du(chipPx),
    size: capPx / (CAP * canvas.s),
    padYpx,
    padXpx: Math.max(3, Math.round(8 * canvas.s)),
    capPx,
    topPx: chipTopPx,
  };
}

/** 站号块的宽（设计单位）：字形宽取整数像素，再加左右留白。 */
export function chipWidth(canvas: FtaCanvas, metrics: ChipMetrics, code: string): number {
  const ink = canvas.ink(FTA_FONT.strong, code, metrics.size);
  return canvas.du(Math.round((ink.x2 - ink.x1) * canvas.s) + 2 * metrics.padXpx);
}

/**
 * 画一个站号块：左边缘对齐到整像素，字形左边缘落在整像素上，左右留白相差不超过半像素。
 * slant 不为 0 时块切成平行四边形。
 */
export function drawChip(
  canvas: FtaCanvas,
  moduleId: string,
  metrics: ChipMetrics,
  x: number,
  code: string,
  fill: string,
  ink: string,
  slant: number,
): { nodes: RenderNode[]; bbox: BBox; width: number } {
  const xPx = canvas.px(x);
  const left = canvas.du(xPx);
  const width = chipWidth(canvas, metrics, code);
  const glyph = canvas.ink(FTA_FONT.strong, code, metrics.size);
  const label = canvas.text(
    moduleId,
    FTA_FONT.strong,
    code,
    metrics.size,
    canvas.du(xPx + metrics.padXpx) - glyph.x1,
    canvas.du(metrics.topPx + metrics.padYpx + metrics.capPx),
    ink,
  );
  return {
    nodes: [polygon(slantedBox(left, metrics.top, width, metrics.height, slant), fill), label.node],
    bbox: { x: left, y: metrics.top, width, height: metrics.height },
    width,
  };
}

/** 色带分段的斜度：打开斜切时用 FTA 标志的斜度。 */
export function bandSlant(slanted: boolean): number {
  return slanted ? FTA_SLANT : 0;
}

/** 线路名的排法：2 = 主名 + 第二语言，1 = 只有主名（可能缩小），0 = 不写。 */
export interface LineLabelFit {
  level: 0 | 1 | 2;
  main: number;
  second: number;
  gap: number;
  width: number;
}

/**
 * 在 avail 宽度里排一条线路名，最多排到 maxLevel 级。
 * 调用方先对所有线路各算一次，取最低的级别再统一排，避免一段有第二语言、一段没有。
 */
export function fitLineLabel(
  canvas: FtaCanvas,
  main: string,
  second: string,
  avail: number,
  maxLevel: number,
  mainSize = 19,
  secondSize = 16,
  minMain = 16,
): LineLabelFit {
  const none: LineLabelFit = { level: 0, main: 0, second: 0, gap: 0, width: 0 };
  if (maxLevel <= 0 || !main) return none;
  const gap = mainSize * 0.4;
  const mainWidth = canvas.measure(FTA_FONT.strong, main, mainSize);
  const secondWidth = second ? canvas.measure(FTA_FONT.regular, second, secondSize) : 0;
  // 没有第二语言的线路放得下主名就算完整，不拖累其他线路降级。
  if (maxLevel >= 2 && !second && mainWidth <= avail) {
    return { level: 2, main: mainSize, second: 0, gap: 0, width: mainWidth };
  }
  if (maxLevel >= 2 && second && mainWidth + gap + secondWidth <= avail) {
    return {
      level: 2,
      main: mainSize,
      second: secondSize,
      gap,
      width: mainWidth + gap + secondWidth,
    };
  }
  if (mainWidth <= avail) return { level: 1, main: mainSize, second: 0, gap: 0, width: mainWidth };
  const shrunk = (mainSize * avail) / mainWidth;
  if (shrunk >= minMain) return { level: 1, main: shrunk, second: 0, gap: 0, width: avail };
  return none;
}
