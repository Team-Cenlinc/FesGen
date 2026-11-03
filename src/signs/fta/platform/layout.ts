import type { FontId } from "@/fonts/stacks";
import { fmt, unionBBox, type BBox, type RenderNode, type RenderTree } from "../../render";
import type { LayoutInput } from "../../types";
import { FTA_FONT } from "../fonts";
import { contrast, FtaCanvas, inkOn } from "../kit";
import { stationCode } from "../station/layout";
import {
  FTA_PLATFORM_BACKGROUNDS,
  type FtaPlatformContent,
  type FtaPlatformLayout,
  type FtaPlatformLine,
  type FtaPlatformLook,
} from "./content";

/**
 * FTA 站台牌排版。坐标是设计单位，横版以 1×3（384 × 128）、竖版以 2×1（128 × 256）为 1 倍。
 *
 * - 横版：站名、英文、线路行竖向成组，在内容区里上下居中；站名取能放下的最大字号，
 *   英文和间距按站名字号成比例。中轴样式整组居中，极简和色框左对齐。
 * - 竖版（柱名牌）：汉字一字一行，英文顺时针转 90° 放在右侧，整组居中；线路块贴底。
 *
 * 文字按字形墨迹定位，不按字宽：汉字、英文和站号块的边缘因此真正对齐。
 */

export const FTA_PLATFORM_MODULES = {
  stationName: "station-name",
  lines: "lines",
  accent: "accent",
} as const;

export const ADD_LINE_ACTION = "add-line";

const ROW_H = 22;
const CHIP_SIZE = 13;
const LINE_NAME_SIZE = 14;
const CHIP_PAD = 7;
/** 站号块和线路名之间、两条线路之间、只留站号块时块与块之间。 */
const NAME_GAP = 6;
const ITEM_GAP = 16;
const CHIP_GAP = 6;
const BAND = 8;
const BAND_GAP = 12;
const FRAME = 8;
const FRAME_GAP = 12;
/** 站号块和底色对比度低于这个值时，描一圈字色。 */
const OUTLINE_CONTRAST = 1.6;
const OUTLINE = 2;

const LOOKS: Readonly<Record<FtaPlatformLook, { center: boolean; rowOnTop: boolean }>> = {
  axis: { center: true, rowOnTop: false },
  minimal: { center: false, rowOnTop: true },
  frame: { center: false, rowOnTop: true },
};

const M = FTA_PLATFORM_MODULES;

export function resolvePlatformLayout(
  mode: FtaPlatformLayout,
  width: number,
  height: number,
): "horizontal" | "vertical" {
  if (mode !== "auto") return mode;
  return width < height ? "vertical" : "horizontal";
}

export function layoutFtaPlatform(input: LayoutInput<FtaPlatformContent>): RenderTree {
  const { content, size } = input;
  return resolvePlatformLayout(content.layout, size.width, size.height) === "vertical"
    ? layoutVertical(input)
    : layoutHorizontal(input);
}

interface Ink {
  x1: number;
  y1: number;
  w: number;
  h: number;
}

function inkOf(canvas: FtaCanvas, font: FontId, text: string, size: number): Ink {
  if (!text) return { x1: 0, y1: 0, w: 0, h: 0 };
  const b = canvas.ink(font, text, size);
  return { x1: b.x1, y1: b.y1, w: b.x2 - b.x1, h: b.y2 - b.y1 };
}

function nameFont(c: FtaPlatformContent): FontId {
  return c.nameWeight === "700" ? FTA_FONT.strong : FTA_FONT.name;
}

interface Entry {
  line: FtaPlatformLine;
  index: number;
}

function shownLines(c: FtaPlatformContent): Entry[] {
  const entries = c.lines.map((line, index) => ({ line, index }));
  return c.showLines === "first" ? entries.slice(0, 1) : entries;
}

// ————————————————————————— 站号块与线路行 —————————————————————————

function chipWidth(canvas: FtaCanvas, line: FtaPlatformLine): number {
  const ink = inkOf(canvas, FTA_FONT.strong, stationCode(line), CHIP_SIZE);
  return canvas.du(Math.round(ink.w * canvas.s) + 2 * canvas.px(CHIP_PAD));
}

/** 方角站号块：字形在块里上下、左右按墨迹居中；和底色太接近时描一圈字色。 */
function drawChip(
  canvas: FtaCanvas,
  line: FtaPlatformLine,
  x: number,
  y: number,
  background: string,
): { nodes: RenderNode[]; bbox: BBox } {
  const code = stationCode(line);
  const ink = inkOf(canvas, FTA_FONT.strong, code, CHIP_SIZE);
  const left = canvas.snap(x);
  const top = canvas.snap(y);
  const width = chipWidth(canvas, line);
  const height = canvas.snap(y + ROW_H) - top;
  const nodes: RenderNode[] = [];
  if (contrast(line.color, background) < OUTLINE_CONTRAST) {
    nodes.push({
      kind: "rect",
      x: left - OUTLINE,
      y: top - OUTLINE,
      width: width + 2 * OUTLINE,
      height: height + 2 * OUTLINE,
      fill: inkOn(background),
    });
  }
  nodes.push({ kind: "rect", x: left, y: top, width, height, fill: line.color });
  nodes.push(
    canvas.text(
      M.lines,
      FTA_FONT.strong,
      code,
      CHIP_SIZE,
      left + canvas.du(canvas.px(CHIP_PAD)) - ink.x1,
      top + (height - ink.h) / 2 - ink.y1,
      inkOn(line.color),
    ).node,
  );
  return { nodes, bbox: { x: left, y: top, width, height } };
}

interface RowItem extends Entry {
  chip: number;
  name: number;
}

interface Row {
  items: RowItem[];
  /** 放不下线路名时只留站号块。 */
  names: boolean;
  width: number;
}

function rowItems(canvas: FtaCanvas, entries: readonly Entry[]): RowItem[] {
  return entries.map((entry) => ({
    ...entry,
    chip: chipWidth(canvas, entry.line),
    name: inkOf(canvas, FTA_FONT.strong, entry.line.name, LINE_NAME_SIZE).w,
  }));
}

function chipsOnly(items: RowItem[]): Row {
  const width = items.reduce((sum, item) => sum + item.chip, 0) + CHIP_GAP * (items.length - 1);
  return { items, names: false, width };
}

/** 一行线路：站号块 + 线路名；整行放不下时所有线路一起只留站号块。 */
function rowFor(canvas: FtaCanvas, entries: readonly Entry[], maxWidth: number): Row {
  const items = rowItems(canvas, entries);
  const full =
    items.reduce((sum, item) => sum + item.chip + (item.name ? NAME_GAP + item.name : 0), 0) +
    ITEM_GAP * (items.length - 1);
  return full <= maxWidth ? { items, names: true, width: full } : chipsOnly(items);
}

function drawRow(
  canvas: FtaCanvas,
  row: Row,
  x: number,
  y: number,
  background: string,
  ink: string,
  nodes: RenderNode[],
  items: Record<string, BBox>,
) {
  let cursor = x;
  for (const item of row.items) {
    const chip = drawChip(canvas, item.line, cursor, y, background);
    nodes.push(...chip.nodes);
    let box = chip.bbox;
    cursor += item.chip;
    if (row.names && item.name) {
      const name = inkOf(canvas, FTA_FONT.strong, item.line.name, LINE_NAME_SIZE);
      const left = cursor + NAME_GAP;
      nodes.push(
        canvas.text(
          M.lines,
          FTA_FONT.strong,
          item.line.name,
          LINE_NAME_SIZE,
          left - name.x1,
          y + (ROW_H - name.h) / 2 - name.y1,
          ink,
        ).node,
      );
      box = unionBBox([box, { x: left, y, width: name.w, height: ROW_H }]);
      cursor += NAME_GAP + item.name;
    }
    cursor += row.names ? ITEM_GAP : CHIP_GAP;
    items[`${M.lines}#${item.index}`] = box;
  }
}

// ————————————————————————— 色带与色框 —————————————————————————

function drawBand(canvas: FtaCanvas, entries: readonly Entry[]): BBox {
  const dw = canvas.designWidth;
  const top = canvas.snap(canvas.designHeight - BAND);
  const nodes: RenderNode[] = entries.map(({ line }, i) => {
    const a = canvas.snap((i * dw) / entries.length);
    const b = canvas.snap(((i + 1) * dw) / entries.length);
    return {
      kind: "rect",
      x: a,
      y: top,
      width: b - a,
      height: canvas.designHeight - top,
      fill: line.color,
    };
  });
  const bbox = { x: 0, y: top, width: dw, height: canvas.designHeight - top };
  canvas.add(M.accent, nodes, bbox);
  return bbox;
}

/** 本线颜色的外框。里面挖空而不是用底色盖住，开灯光时里外的渐变才连续。 */
function drawFrame(canvas: FtaCanvas, color: string) {
  const dw = canvas.designWidth;
  const dh = canvas.designHeight;
  const inset = canvas.snap(FRAME);
  const bbox = { x: 0, y: 0, width: dw, height: dh };
  canvas.add(
    M.accent,
    [
      {
        kind: "group",
        children: [{ kind: "rect", x: 0, y: 0, width: dw, height: dh, fill: color }],
        holes: [
          { kind: "rect", x: inset, y: inset, width: dw - 2 * inset, height: dh - 2 * inset },
        ],
      },
    ],
    bbox,
  );
}

function addAffordance(canvas: FtaCanvas, c: FtaPlatformContent) {
  canvas.affordance(
    ADD_LINE_ACTION,
    "添加线路",
    canvas.designWidth,
    canvas.designHeight,
    `${M.lines}#${c.lines.length}`,
  );
}

// ————————————————————————— 横版 —————————————————————————

const H_MARGIN = 16;

function layoutHorizontal({
  content: c,
  size,
  shaper,
  tweaks,
}: LayoutInput<FtaPlatformContent>): RenderTree {
  const canvas = new FtaCanvas(
    shaper,
    tweaks,
    Math.min(size.height / 128, size.width / 256),
    size.width,
    size.height,
  );
  const dw = canvas.designWidth;
  const dh = canvas.designHeight;
  const background = FTA_PLATFORM_BACKGROUNDS[c.background];
  const ink = inkOn(background);
  const look = LOOKS[c.look];
  const entries = shownLines(c);

  let x0 = H_MARGIN;
  let x1 = dw - H_MARGIN;
  let y0 = H_MARGIN;
  let y1 = dh - H_MARGIN;
  if (c.look === "frame") {
    drawFrame(canvas, entries[0]!.line.color);
    x0 = y0 = FRAME + FRAME_GAP;
    x1 = dw - x0;
    y1 = dh - y0;
  } else if (c.band) {
    drawBand(canvas, entries);
    y1 = dh - BAND - BAND_GAP;
  }
  const areaW = x1 - x0;
  const areaH = y1 - y0;
  const row = rowFor(canvas, entries, areaW);

  // 站名取能放下的最大字号；英文和间距按站名字号成比例。
  const font = nameFont(c);
  const fitAt = (nameSize: number) => {
    const name = inkOf(canvas, font, c.station.name, nameSize);
    const enSize = Math.max(14, Math.min(22, Math.round(nameSize * 0.34)));
    const en = inkOf(canvas, FTA_FONT.regular, c.station.secondary, enSize);
    const gapEn = Math.round(nameSize * 0.18);
    const gapRow = Math.round(nameSize * 0.24);
    const total = ROW_H + gapRow + name.h + (en.h ? gapEn + en.h : 0);
    const fits = name.w <= areaW && en.w <= areaW && total <= areaH;
    return { nameSize, name, enSize, en, gapEn, gapRow, total, fits };
  };
  let fit = fitAt(72);
  for (let nameSize = 70; !fit.fits && nameSize >= 32; nameSize -= 2) fit = fitAt(nameSize);
  if (!fit.fits) canvas.warn(M.stationName, "站名太长，缩到最小字号仍放不下。");

  const xAt = (width: number) => (look.center ? x0 + (areaW - width) / 2 : x0);
  let y = y0 + (areaH - fit.total) / 2;
  const lineNodes: RenderNode[] = [];
  const items: Record<string, BBox> = {};
  if (look.rowOnTop) {
    drawRow(canvas, row, xAt(row.width), y, background, ink, lineNodes, items);
    y += ROW_H + fit.gapRow;
  }

  const nameNodes: RenderNode[] = [];
  const boxes: BBox[] = [];
  const nameX = xAt(fit.name.w);
  nameNodes.push(
    canvas.text(
      M.stationName,
      font,
      c.station.name,
      fit.nameSize,
      nameX - fit.name.x1,
      y - fit.name.y1,
      ink,
    ).node,
  );
  boxes.push({ x: nameX, y, width: fit.name.w, height: fit.name.h });
  y += fit.name.h;
  if (fit.en.h) {
    y += fit.gapEn;
    const enX = xAt(fit.en.w);
    nameNodes.push(
      canvas.text(
        M.stationName,
        FTA_FONT.regular,
        c.station.secondary,
        fit.enSize,
        enX - fit.en.x1,
        y - fit.en.y1,
        ink,
      ).node,
    );
    boxes.push({ x: enX, y, width: fit.en.w, height: fit.en.h });
    y += fit.en.h;
  }
  if (!look.rowOnTop) {
    drawRow(canvas, row, xAt(row.width), y + fit.gapRow, background, ink, lineNodes, items);
  }

  canvas.add(M.lines, lineNodes, unionBBox(Object.values(items)), items);
  canvas.add(M.stationName, nameNodes, unionBBox(boxes));
  addAffordance(canvas, c);
  return canvas.tree(background);
}

// ————————————————————————— 竖版（柱名牌） —————————————————————————

const V_MARGIN = 12;
/** 竖版的线路块和站名组之间。 */
const V_BLOCK_GAP = 16;

/** 竖版线路块：单条线放得下就带线路名；多条线只留站号块，按宽度换行。 */
function lineBlock(canvas: FtaCanvas, entries: readonly Entry[], maxWidth: number): Row[] {
  if (entries.length === 1) return [rowFor(canvas, entries, maxWidth)];
  const rows: RowItem[][] = [[]];
  let width = 0;
  for (const item of rowItems(canvas, entries)) {
    const current = rows.at(-1)!;
    if (current.length && width + CHIP_GAP + item.chip > maxWidth) {
      rows.push([item]);
      width = item.chip;
    } else {
      width += (current.length ? CHIP_GAP : 0) + item.chip;
      current.push(item);
    }
  }
  return rows.map(chipsOnly);
}

function layoutVertical({
  content: c,
  size,
  shaper,
  tweaks,
}: LayoutInput<FtaPlatformContent>): RenderTree {
  const canvas = new FtaCanvas(
    shaper,
    tweaks,
    Math.min(size.width / 128, size.height / 256),
    size.width,
    size.height,
  );
  const dw = canvas.designWidth;
  const dh = canvas.designHeight;
  const background = FTA_PLATFORM_BACKGROUNDS[c.background];
  const ink = inkOn(background);
  const entries = shownLines(c);
  const cx = dw / 2;
  const areaW = dw - 2 * V_MARGIN;
  const y0 = V_MARGIN + 4;
  let y1 = dh - V_MARGIN;
  if (c.band) {
    drawBand(canvas, entries);
    y1 = dh - BAND - BAND_GAP;
  }

  // 线路块贴底，每行居中。
  const rows = lineBlock(canvas, entries, areaW);
  const blockH = rows.length * ROW_H + (rows.length - 1) * CHIP_GAP;
  const lineNodes: RenderNode[] = [];
  const items: Record<string, BBox> = {};
  rows.forEach((row, i) => {
    const top = y1 - blockH + i * (ROW_H + CHIP_GAP);
    drawRow(canvas, row, cx - row.width / 2, top, background, ink, lineNodes, items);
  });
  const areaH = y1 - blockH - V_BLOCK_GAP - y0;

  // 汉字一字一行，行高按参考字“国”的墨迹定；英文转 90° 放在右侧，间距 0.12 倍站名字号。
  const font = nameFont(c);
  const chars = [...c.station.name];
  const fitAt = (nameSize: number) => {
    const ref = inkOf(canvas, font, "国", nameSize);
    const gap = Math.round(nameSize * 0.1);
    const column = chars.length ? chars.length * ref.h + (chars.length - 1) * gap : 0;
    const columnW = Math.max(0, ...chars.map((char) => inkOf(canvas, font, char, nameSize).w));
    const enSize = Math.max(12, Math.min(18, Math.round(nameSize * 0.34)));
    const en = inkOf(canvas, FTA_FONT.regular, c.station.secondary, enSize);
    const gapEn = Math.max(4, Math.round(nameSize * 0.12));
    const groupW = columnW + (en.w ? gapEn + en.h : 0);
    const fits = groupW <= areaW && column <= areaH && en.w <= areaH;
    return { nameSize, ref, gap, column, columnW, enSize, en, gapEn, groupW, fits };
  };
  let fit = fitAt(72);
  for (let nameSize = 70; !fit.fits && nameSize >= 16; nameSize -= 2) fit = fitAt(nameSize);
  if (!fit.fits) canvas.warn(M.stationName, "站名太长，缩到最小字号仍放不下。");

  const nameNodes: RenderNode[] = [];
  const boxes: BBox[] = [];
  const columnX = cx - fit.groupW / 2;
  const columnTop = y0 + (areaH - fit.column) / 2;
  chars.forEach((char, i) => {
    const glyph = inkOf(canvas, font, char, fit.nameSize);
    const left = columnX + (fit.columnW - glyph.w) / 2;
    const top = columnTop + i * (fit.ref.h + fit.gap);
    nameNodes.push(
      canvas.text(M.stationName, font, char, fit.nameSize, left - glyph.x1, top - fit.ref.y1, ink)
        .node,
    );
    boxes.push({ x: left, y: top, width: glyph.w, height: fit.ref.h });
  });
  if (fit.en.w) {
    // 转 90° 后，英文字形的上边朝右、下边朝汉字列；按这串英文自己的墨迹算，不给没有的降部留位置。
    const left = columnX + fit.columnW + fit.gapEn;
    const top = y0 + (areaH - fit.en.w) / 2;
    const text = canvas.text(
      M.stationName,
      FTA_FONT.regular,
      c.station.secondary,
      fit.enSize,
      -fit.en.x1,
      -fit.en.h - fit.en.y1,
      ink,
    );
    nameNodes.push({
      kind: "group",
      transform: `translate(${fmt(canvas.snap(left + fit.en.h))} ${fmt(canvas.snap(top))}) rotate(90)`,
      children: [text.node],
    });
    boxes.push({ x: left, y: top, width: fit.en.h, height: fit.en.w });
  }

  canvas.add(M.lines, lineNodes, unionBBox(Object.values(items)), items);
  canvas.add(M.stationName, nameNodes, unionBBox(boxes));
  addAffordance(canvas, c);
  return canvas.tree(background);
}
