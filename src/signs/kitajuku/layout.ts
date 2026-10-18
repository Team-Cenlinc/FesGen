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
  LEFT_STOP_MARK_CENTER_X,
  MIDDLE_STOP_MARK,
  MIDDLE_STOP_MARK_CENTER_X,
  NEIGHBOR_ICON_INNER,
  NEIGHBOR_ICON_OUTER,
  RIGHT_STOP_MARK,
  RIGHT_STOP_MARK_CENTER_X,
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

/**
 * 编号牌里白底部分的中心和可用宽度（相对编号牌原点，已扣掉描边和两侧各 3 的留白）。
 * 编号按中心对齐，放不下时等比缩小；visualCenterX 是整块编号牌（含左侧色块）的中心。
 */
const STATION_BADGE = { centerX: 24.85, centerY: 13.93, room: 26, visualCenterX: 21.51 };
const NEIGHBOR_BADGE = { centerX: 19.11, centerY: 11.27, room: 20 };
/**
 * TeX Gyre Heros 的数字和大写字母高约 0.72 字号。基线放在方块中心下方半个字高，
 * 编号和线路缩写就竖直居中（不用固定基线，缩小字号时也居中）。
 */
const CAP_HALF_HEIGHT = 0.36;

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
  /** 编号太宽时缩小到放得进编号牌。 */
  const fitNumber = (value: string, fontSize: number, room: number) => {
    const width = measure(LATIN, value, fontSize);
    return width > room ? (fontSize * room) / width : fontSize;
  };
  // 本站名以外的中间一列（线路标、本站编号、本站缺口）共用的中轴：牌面正中。
  const axis = 300 + dx / 2;

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

  // —— 左右邻站：中文名 + 编号牌，英文名在下 ——
  function layoutNeighbor(
    id: string,
    data: KitajukuNeighbor,
    side: "left" | "right",
  ): { children: RenderNode[]; bbox: BBox } {
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
    const numberSize = fitNumber(data.number, 15, NEIGHBOR_BADGE.room);
    const number = text(
      id,
      LATIN,
      data.number,
      numberSize,
      iconX + NEIGHBOR_BADGE.centerX,
      iconY + NEIGHBOR_BADGE.centerY + numberSize * CAP_HALF_HEIGHT,
      "middle",
      data.textColor,
    );
    return {
      children: [
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
      bbox: unionBBox([
        chinese.bbox,
        english.bbox,
        number.bbox,
        { x: iconX + 0.576, y: iconY + 2.052, width: 32.356, height: 18.432 },
      ]),
    };
  }
  // 邻站先排好：色带上的缺口要对准它们的中心。模块仍按原来的先后加入，图层顺序不变。
  const leftNeighbor = layoutNeighbor(KITAJUKU_MODULES.leftStation, c.left, "left");
  const rightNeighbor = layoutNeighbor(KITAJUKU_MODULES.rightStation, c.right, "right");

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
    // 缺口对准车站：本站在中轴上，邻站在整组站名和编号牌的正下方，但不出色带两端。
    const centerOf = (box: BBox) => box.x + box.width / 2;
    const onBelt = (x: number) => Math.min(x2 - 16, Math.max(x1 + 16, x));
    const marks: RenderNode[] = [
      at(onBelt(centerOf(leftNeighbor.bbox)) - LEFT_STOP_MARK_CENTER_X, 120 + dy / 2, [
        { kind: "path", d: LEFT_STOP_MARK },
      ]),
      at(axis - MIDDLE_STOP_MARK_CENTER_X, 100 + dy / 2, [{ kind: "path", d: MIDDLE_STOP_MARK }]),
      at(onBelt(centerOf(rightNeighbor.bbox)) - RIGHT_STOP_MARK_CENTER_X, 120 + dy / 2, [
        { kind: "path", d: RIGHT_STOP_MARK },
      ]),
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

  // —— 线路标：缩写方块 + 线路名，整体在中轴上居中 ——
  {
    const id = KITAJUKU_MODULES.lineMark;
    const color = c.station.textColor;
    const abbrWidth = measure(LATIN, c.line.abbr, 15);
    const nameWidth = measure(JP_REGULAR, c.line.name, 21);
    const abbrBoxWidth = c.line.abbr ? abbrWidth + 10 : 0;
    const gap = c.line.abbr && c.line.name ? 5 : 0;
    const startX = axis - (abbrBoxWidth + gap + nameWidth) / 2;
    const baseY = 100 + dy / 2;
    const children: RenderNode[] = [];
    const boxes: (BBox | null)[] = [];
    if (c.line.abbr) {
      const box = { x: startX, y: baseY, width: abbrBoxWidth, height: 20 };
      children.push({
        kind: "rect",
        ...box,
        rx: 2.8740096,
        fill: color,
        stroke: color,
        strokeWidth: 1.14960384,
      });
      children.push(
        text(
          id,
          LATIN,
          c.line.abbr,
          15,
          startX + abbrBoxWidth / 2,
          baseY + box.height / 2 + 15 * CAP_HALF_HEIGHT,
          "middle",
          c.background,
        ).node,
      );
      boxes.push(box);
    }
    const name = text(
      id,
      JP_REGULAR,
      c.line.name,
      21,
      startX + abbrBoxWidth + gap,
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
    const x = axis - STATION_BADGE.visualCenterX;
    const y = 135 + dy / 2;
    const numberSize = fitNumber(c.station.number, 19.7074944, STATION_BADGE.room);
    const number = text(
      id,
      LATIN,
      c.station.number,
      numberSize,
      x + STATION_BADGE.centerX,
      y + STATION_BADGE.centerY + numberSize * CAP_HALF_HEIGHT,
      "middle",
      color,
    );
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

  addModule(KITAJUKU_MODULES.leftStation, leftNeighbor.children, leftNeighbor.bbox);
  addModule(KITAJUKU_MODULES.rightStation, rightNeighbor.children, rightNeighbor.bbox);

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
