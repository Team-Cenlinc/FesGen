import { fontStack, type FontId } from "@/fonts/stacks";
import type { TextAnchor } from "@/fonts/shaper";
import {
  applyTweak,
  fmt,
  scaleBBox,
  tweakOf,
  unionBBox,
  type BBox,
  type RenderNode,
  type RenderTree,
} from "../render";
import type { LayoutInput } from "../types";
import {
  ARROW_POINTS,
  LEFT_STOP_MARK,
  MIDDLE_STOP_MARK,
  NEIGHBOR_ICON_INNER,
  NEIGHBOR_ICON_OUTER,
  RIGHT_STOP_MARK,
  STATION_ICON_INNER,
  STATION_ICON_OUTER,
} from "./assets";
import type { KitajukuContent, KitajukuNeighbor } from "./content";

/**
 * 北宿电铁站牌排版。
 *
 * 设计基准是旧版的 600×200：所有坐标、字号都照搬旧版 signView.vue 的规则（见 docs/feature-parity.md 2.2）。
 * 换尺寸时先按 s = min(宽/600, 高/200) 整体缩放，再把多出来的宽度 dx、高度 dy 按旧版的偏移规则分配，
 * 所以 3:1 的尺寸（600×200、1×3 地图格 384×128）和旧版完全同构，其他比例则像旧版一样居中铺开。
 */

export const KITAJUKU_MODULES = {
  stationName: "station-name",
  stationNumber: "station-number",
  lineMark: "line-mark",
  leftStation: "left-station",
  rightStation: "right-station",
  belt: "belt",
  arrow: "arrow",
} as const;

const JP_REGULAR: FontId = "noto-sans-jp-400";
const JP_BOLD: FontId = "noto-sans-jp-700";
const LATIN: FontId = "tex-gyre-heros-400";

/** 字形大致占据的纵向范围（相对字号），用于选中框。 */
const ASCENT = 0.88;
const DESCENT = 0.14;

export function layoutKitajuku({
  content: c,
  size,
  shaper,
  tweaks,
}: LayoutInput<KitajukuContent>): RenderTree {
  const scale = Math.min(size.width / 600, size.height / 200);
  const designWidth = size.width / scale;
  const designHeight = size.height / scale;
  const dx = designWidth - 600;
  const dy = designHeight - 200;
  const nameFont = c.emphasizeKanji ? JP_BOLD : JP_REGULAR;

  const modules: Record<string, BBox> = {};
  const minTextSize: Record<string, number> = {};
  const missingGlyphs: Record<string, string[]> = {};
  const missingByPrimary: Partial<Record<FontId, string[]>> = {};
  // 缺字先按模块暂存，模块真正画上去才汇总；隐藏的模块不应触发补字提示。
  const pendingMisses: Record<string, Partial<Record<FontId, string[]>>> = {};
  const contentNodes: RenderNode[] = [];
  const measure = (font: FontId, value: string, fontSize: number) =>
    shaper.measure(fontStack(font), value, fontSize);

  /** 排一段文字，同时记录这个模块的最小字号和缺字。 */
  function text(
    moduleId: string,
    font: FontId,
    value: string,
    fontSize: number,
    x: number,
    y: number,
    anchor: TextAnchor,
    fill: string,
  ): { node: RenderNode; bbox: BBox | null; width: number } {
    const shaped = shaper.shape(fontStack(font), value, fontSize, x, y, anchor);
    if (value) {
      const effective = fontSize * scale * tweakOf(tweaks, moduleId).scale;
      minTextSize[moduleId] = Math.min(minTextSize[moduleId] ?? Infinity, effective);
      if (shaped.missing.length > 0) {
        missingGlyphs[moduleId] = [
          ...new Set([...(missingGlyphs[moduleId] ?? []), ...shaped.missing]),
        ];
        const pending = (pendingMisses[moduleId] ??= {});
        pending[font] = [...new Set([...(pending[font] ?? []), ...shaped.missing])];
      }
    }
    return {
      node: { kind: "path", d: shaped.d, fill },
      bbox: value
        ? {
            x: shaped.x,
            y: y - fontSize * ASCENT,
            width: shaped.width,
            height: fontSize * (ASCENT + DESCENT),
          }
        : null,
      width: shaped.width,
    };
  }

  function addModule(id: string, children: RenderNode[], bbox: BBox) {
    const tweaked = applyTweak(children, bbox, tweakOf(tweaks, id));
    const misses = pendingMisses[id] ?? {};
    delete pendingMisses[id];
    if (!tweaked) {
      delete minTextSize[id];
      delete missingGlyphs[id];
      return;
    }
    for (const [font, chars] of Object.entries(misses) as [FontId, string[]][]) {
      missingByPrimary[font] = [...new Set([...(missingByPrimary[font] ?? []), ...chars])];
    }
    contentNodes.push(tweaked.node);
    modules[id] = scaleBBox(tweaked.bbox, scale);
  }

  /** 把一段局部坐标的路径平移到 (x, y)。 */
  const at = (x: number, y: number, children: RenderNode[]): RenderNode => ({
    kind: "group",
    transform: `translate(${fmt(x)} ${fmt(y)})`,
    children,
  });

  // 边框：旧版是背景矩形的描边，描边居中所以只露出一半；色带从边框内沿画起。
  const frame: RenderNode[] =
    c.frameThickness > 0
      ? [
          {
            kind: "rect",
            x: 0,
            y: 0,
            width: designWidth,
            height: designHeight,
            stroke: "#4D4D4D",
            strokeWidth: c.frameThickness,
          },
        ]
      : [];

  // —— 色带与三个站点标记 ——
  {
    const x1 = c.frameThickness / 2;
    const x2 = designWidth - c.frameThickness / 2;
    const belts: RenderNode[] = c.line.second.enabled
      ? [
          {
            kind: "line",
            x1,
            y1: 176.75 + dy / 2,
            x2,
            y2: 176.75 + dy / 2,
            stroke: c.line.color,
            strokeWidth: 7.5,
          },
          {
            kind: "line",
            x1,
            y1: 183.25 + dy / 2,
            x2,
            y2: 183.25 + dy / 2,
            stroke: c.line.second.color,
            strokeWidth: 7.5,
          },
        ]
      : [
          {
            kind: "line",
            x1,
            y1: 180 + dy / 2,
            x2,
            y2: 180 + dy / 2,
            stroke: c.line.color,
            strokeWidth: 15,
          },
        ];
    // 站点标记是色带上的缺口：从色带里挖掉，透出背景和灯光。旧版是用底色画上去的，
    // 不开灯光时两者一样；开了灯光，底色画的缺口不受渐变影响，会比周围更白。
    const marks: RenderNode[] = [
      at(29, 120 + dy / 2, [{ kind: "path", d: LEFT_STOP_MARK }]),
      at(235 + dx / 2, 100 + dy / 2, [{ kind: "path", d: MIDDLE_STOP_MARK }]),
      at(472 + dx, 120 + dy / 2, [{ kind: "path", d: RIGHT_STOP_MARK }]),
    ];
    addModule(KITAJUKU_MODULES.belt, [{ kind: "group", children: belts, holes: marks }], {
      x: x1,
      y: 172.5 + dy / 2,
      width: x2 - x1,
      height: 15,
    });
  }

  // —— 本站名：中文名右对齐到中线，假名在上、英文在下，左对齐 ——
  {
    const id = KITAJUKU_MODULES.stationName;
    const color = c.station.textColor;
    const anchorX = 305 + dx / 2;
    // 中文名太长时等比缩小，最多缩到一半，避免顶出左边框。
    const chineseWidth = measure(nameFont, c.station.chinese, 60);
    const chineseRoom = anchorX - c.frameThickness - 12;
    const chineseSize =
      chineseWidth > chineseRoom ? Math.max(30, (60 * chineseRoom) / chineseWidth) : 60;
    const chinese = text(
      id,
      nameFont,
      c.station.chinese,
      chineseSize,
      anchorX,
      75 + dy / 4,
      "end",
      color,
    );
    const kana = text(
      id,
      JP_REGULAR,
      c.station.kana,
      22,
      320 + dx / 2,
      45 + dy / 4,
      "start",
      color,
    );
    const english = text(
      id,
      LATIN,
      c.station.english,
      22,
      320 + dx / 2,
      80 + dy / 4,
      "start",
      color,
    );
    addModule(
      id,
      [chinese.node, kana.node, english.node],
      unionBBox([chinese.bbox, kana.bbox, english.bbox]),
    );
  }

  // —— 线路标：缩写方块 + 线路名，整体以 305 为中线居中 ——
  {
    const id = KITAJUKU_MODULES.lineMark;
    const color = c.station.textColor;
    const abbrWidth = measure(LATIN, c.line.abbr, 15);
    const nameWidth = measure(JP_REGULAR, c.line.name, 21);
    const baseX = 235 + (dx - abbrWidth - nameWidth - 5) / 2;
    const baseY = 100 + dy / 2;
    const children: RenderNode[] = [];
    const boxes: (BBox | null)[] = [];
    if (c.line.abbr) {
      const box = { x: baseX + 65, y: baseY, width: abbrWidth + 10, height: 20 };
      children.push({
        kind: "rect",
        ...box,
        rx: 2.8740096,
        fill: color,
        stroke: color,
        strokeWidth: 1.14960384,
      });
      children.push(
        text(id, LATIN, c.line.abbr, 15, baseX + 70, baseY + 15, "start", c.background).node,
      );
      boxes.push(box);
    }
    const name = text(
      id,
      JP_REGULAR,
      c.line.name,
      21,
      baseX + abbrWidth + 80,
      baseY + 18,
      "start",
      color,
    );
    children.push(name.node);
    boxes.push(name.bbox);
    addModule(id, children, unionBBox(boxes));
  }

  // —— 本站编号：色带上方中间的编号牌 ——
  {
    const id = KITAJUKU_MODULES.stationNumber;
    const color = c.station.textColor;
    const x = 280 + dx / 2;
    const y = 135 + dy / 2;
    const number = text(id, LATIN, c.station.number, 19.7074944, x + 12, y + 21, "start", color);
    addModule(
      id,
      [
        at(x, y, [
          { kind: "path", d: STATION_ICON_OUTER, stroke: color, strokeWidth: 2.16 },
          { kind: "path", d: STATION_ICON_INNER, fill: color, stroke: color, strokeWidth: 2.16 },
        ]),
        number.node,
      ],
      unionBBox([{ x: x + 1.08, y: y + 2.08, width: 40.86, height: 23.69 }, number.bbox]),
    );
  }

  // —— 左右邻站：中文名 + 编号牌，英文名在下 ——
  function neighbor(id: string, data: KitajukuNeighbor, side: "left" | "right") {
    const groupX = side === "left" ? 29 : 472 + dx;
    const groupY = 120 + dy / 2;
    const nameWidth = measure(nameFont, data.chinese, 25);
    const anchor: TextAnchor = side === "left" ? "start" : "end";
    const textX = side === "left" ? groupX : groupX + 84;
    const iconX =
      side === "left" ? groupX + (nameWidth ? nameWidth + 10 : 0) : groupX + 40 - nameWidth;
    const iconY = groupY + 5;
    const chinese = text(
      id,
      nameFont,
      data.chinese,
      25,
      textX,
      groupY + 25,
      anchor,
      data.textColor,
    );
    const english = text(id, LATIN, data.english, 18, textX, groupY + 45, anchor, data.textColor);
    const number = text(
      id,
      LATIN,
      data.number,
      15,
      iconX + 19,
      iconY + 17,
      "middle",
      data.textColor,
    );
    addModule(
      id,
      [
        chinese.node,
        at(iconX, iconY, [
          {
            kind: "path",
            d: NEIGHBOR_ICON_INNER,
            fill: data.textColor,
            stroke: data.textColor,
            strokeWidth: 1.152,
          },
          { kind: "path", d: NEIGHBOR_ICON_OUTER, stroke: data.textColor, strokeWidth: 1.6 },
        ]),
        number.node,
        english.node,
      ],
      unionBBox([
        chinese.bbox,
        english.bbox,
        number.bbox,
        { x: iconX + 0.576, y: iconY + 2.052, width: 32.356, height: 18.432 },
      ]),
    );
  }
  neighbor(KITAJUKU_MODULES.leftStation, c.left, "left");
  neighbor(KITAJUKU_MODULES.rightStation, c.right, "right");

  // —— 行进方向箭头：朝左时在左站上方，朝右时旋转 180° 移到右站上方 ——
  if (c.arrow.visible) {
    const left = c.arrow.direction === "left";
    addModule(
      KITAJUKU_MODULES.arrow,
      [
        {
          kind: "group",
          transform: left
            ? `translate(0 ${fmt(dy / 2)})`
            : `translate(${fmt(595 + dx)} ${fmt(200 + dy / 2)}) rotate(180)`,
          children: [{ kind: "polygon", points: ARROW_POINTS, fill: c.station.textColor }],
        },
      ],
      left
        ? { x: 29.42, y: 88 + dy / 2, width: 27.5, height: 24 }
        : { x: 595 + dx - 56.92, y: 88 + dy / 2, width: 27.5, height: 24 },
    );
  }

  const root = (children: RenderNode[]): RenderNode[] => [
    { kind: "group", transform: `scale(${fmt(scale)})`, children },
  ];

  return {
    width: size.width,
    height: size.height,
    backdrop: c.background,
    background: root([
      { kind: "rect", x: 0, y: 0, width: designWidth, height: designHeight, fill: c.background },
    ]),
    content: root([...frame, ...contentNodes]),
    modules,
    minTextSize,
    missingGlyphs,
    missingByPrimary,
  };
}
