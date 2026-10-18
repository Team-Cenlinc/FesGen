import { fmt, unionBBox, type BBox, type RenderNode, type RenderTree } from "../../render";
import type { LayoutInput } from "../../types";
import { FTA_MARK_HEIGHT, FTA_MARK_WIDTH, FTA_OPERATOR_CAPTION } from "../assets";
import { FTA_FONT } from "../fonts";
import {
  bandSlant,
  CAP,
  chipMetrics,
  chipWidth,
  drawChip,
  fitLineLabel,
  FtaCanvas,
  ftaMark,
  inkOn,
  luminance,
  polygon,
} from "../kit";
import type { FtaLine, FtaStationContent } from "./content";

/**
 * FTA 车站牌排版，规格见 docs/rewrite-decisions.md 3.1。
 *
 * 两种版式按宽高比自动选（也可以手动指定）：
 * - 站名牌（宽高比 ≥ 2.5，例如 1×3）：左上站名撑满，底部整条色带按线路数等分并斜切，右下 Logo。
 *   设计基准高 200、宽至少 400，s = min(高 / 200, 宽 / 400)。
 * - 柱名牌（1×1、横两格、竖两格）：每条线路一行叠在底部，站名在上方；竖条时中文竖排。
 *   设计基准 200 × 200，s = min(宽 / 200, 高 / 200)。
 */

export const FTA_STATION_MODULES = {
  stationName: "station-name",
  logo: "logo",
  belt: "line-belt",
} as const;

export const ADD_LINE_ACTION = "add-line";

/** 中文没有斜体，打开站名斜体时按这个角度仿斜，和 Noto Sans Display Italic 的斜度一致。 */
const ITALIC_SKEW = 12;

/** 站号：代号加序号，例如 WS-01。纯数字的一位序号补成两位。 */
export function stationCode(line: FtaLine): string {
  const number = /^\d$/.test(line.number) ? `0${line.number}` : line.number;
  if (!line.code) return number;
  if (!number) return line.code;
  return `${line.code}-${number}`;
}

export type ResolvedLayout = "station" | "pillar";

export function resolveFtaLayout(
  mode: FtaStationContent["layout"],
  width: number,
  height: number,
): ResolvedLayout {
  if (mode !== "auto") return mode;
  return width / height >= 2.5 ? "station" : "pillar";
}

function lineInk(c: FtaStationContent, color: string): string {
  return c.lineInk.custom ? c.lineInk.color : inkOn(color);
}

function logoReversed(c: FtaStationContent): boolean {
  return (
    c.logo.variant === "reversed" || (c.logo.variant === "auto" && luminance(c.background) < 0.25)
  );
}

function maxLabelLevel(c: FtaStationContent): number {
  return c.lineNames === "auto" ? 2 : c.lineNames === "main" ? 1 : 0;
}

export function layoutFtaStation(input: LayoutInput<FtaStationContent>): RenderTree {
  const { content, size } = input;
  return resolveFtaLayout(content.layout, size.width, size.height) === "station"
    ? layoutStation(input)
    : layoutPillar(input);
}

/** 一条线路名：主名用 700，第二语言用 500，同一基线。 */
function lineLabel(
  canvas: FtaCanvas,
  moduleId: string,
  line: FtaLine,
  fit: ReturnType<typeof fitLineLabel>,
  x: number,
  centerY: number,
  ink: string,
): RenderNode[] {
  if (fit.level === 0) return [];
  const base = centerY + 0.37 * fit.main;
  const nodes = [canvas.text(moduleId, FTA_FONT.strong, line.name, fit.main, x, base, ink).node];
  if (fit.second) {
    const mainWidth = canvas.measure(FTA_FONT.strong, line.name, fit.main);
    nodes.push(
      canvas.text(
        moduleId,
        FTA_FONT.regular,
        line.secondary,
        fit.second,
        x + mainWidth + fit.gap,
        base,
        ink,
      ).node,
    );
  }
  return nodes;
}

// ————————————————————————— 站名牌 —————————————————————————

function layoutStation({
  content: c,
  size,
  shaper,
  tweaks,
}: LayoutInput<FtaStationContent>): RenderTree {
  const s = Math.min(size.height / 200, size.width / 400);
  const canvas = new FtaCanvas(shaper, tweaks, s, size.width, size.height);
  const dw = canvas.designWidth;
  const dh = canvas.designHeight;
  const M = 24;
  const bandH = 46;
  const bandY = dh - bandH;
  const slant = bandSlant(c.slant);

  // —— 线路色带：按线路数等分；每段开头一个站号块，后面是线路名 ——
  {
    const id = FTA_STATION_MODULES.belt;
    const n = c.lines.length;
    const segW = dw / n;
    const metrics = chipMetrics(canvas, bandY, dh);
    const chipLeft = (i: number) => canvas.du(canvas.px(i * segW + (i === 0 ? M : 14)));
    const segRight = (i: number) => (i + 1) * segW - (i === n - 1 ? M : 14);
    const codes = c.lines.map(stationCode);
    const widths = codes.map((code) => (code ? chipWidth(canvas, metrics, code) : 0));
    const labelLeft = (i: number) => chipLeft(i) + (widths[i] ? widths[i]! + 10 : 0);
    const maxLevel = maxLabelLevel(c);
    // 所有线路一起降级：先算每条线能排到哪一级，取最低的那级统一排。
    const level = Math.min(
      maxLevel,
      ...c.lines.map(
        (line, i) =>
          fitLineLabel(canvas, line.name, line.secondary, segRight(i) - labelLeft(i), maxLevel)
            .level,
      ),
    );
    const top = canvas.snap(bandY);
    const bottom = canvas.snap(dh);
    const d = ((bottom - top) * slant) / 2;
    const children: RenderNode[] = [];
    const items: Record<string, BBox> = {};
    c.lines.forEach((line, i) => {
      const x0 = i * segW;
      const x1 = (i + 1) * segW;
      // 分段边界上边往右、下边往左偏，牌子两端保持竖直；右边多盖 0.6，避免两段之间露出细缝。
      const overlap = i < n - 1 ? 0.6 : 0;
      children.push(
        polygon(
          [
            [i === 0 ? 0 : x0 + d, top],
            [i === n - 1 ? dw : x1 + d + overlap, top],
            [i === n - 1 ? dw : x1 - d + overlap, bottom],
            [i === 0 ? 0 : x0 - d, bottom],
          ],
          line.color,
        ),
      );
      if (codes[i]) {
        const chip = drawChip(
          canvas,
          id,
          metrics,
          chipLeft(i),
          codes[i]!,
          c.background,
          c.textColor,
          slant,
        );
        children.push(...chip.nodes);
        if (chipLeft(i) + widths[i]! > x1 - 4) {
          canvas.warn(id, `第 ${i + 1} 段色带太窄，放不下站号“${codes[i]}”。`);
        }
      }
      const fit = fitLineLabel(
        canvas,
        line.name,
        line.secondary,
        segRight(i) - labelLeft(i),
        level,
      );
      children.push(
        ...lineLabel(
          canvas,
          id,
          line,
          fit,
          labelLeft(i),
          bandY + bandH / 2,
          lineInk(c, line.color),
        ),
      );
      items[`${id}#${i}`] = { x: x0, y: bandY, width: segW, height: bandH };
    });
    canvas.add(id, children, { x: 0, y: bandY, width: dw, height: bandH }, items);
    // 锚点在色带右端的下沿（牌子右下角）：按钮挂在它正下方。
    canvas.affordance(ADD_LINE_ACTION, "添加线路", dw, dh, `${id}#${n}`);
  }

  // —— 站名和 Logo：站名组贴着色带、撑满上方区域；Logo 说明文字和第二语言同一基线 ——
  {
    const caption = c.logo.operator ? FTA_OPERATOR_CAPTION[c.logo.operator] : "";
    const capSize = 16;
    const capWidth = caption ? canvas.measure(FTA_FONT.regular, caption, capSize) : 0;
    const regionTop = 16;
    // 第二语言的基线离色带 12，和中文与第二语言之间的间距相同，站名组贴着色带。
    const nameGap = 12;
    const enBase = bandY - nameGap;
    const cnBottom = enBase - CAP * 26 - nameGap;
    const fill = (cnBottom - regionTop) / 0.94;
    const logoH = Math.min(56, Math.max(36, 0.5 * fill));
    const logoW = (logoH * FTA_MARK_WIDTH) / FTA_MARK_HEIGHT;
    const top = c.logo.position === "top";
    const markTop = top ? regionTop : enBase - CAP * capSize - 8 - logoH;
    const captionBase = top ? markTop + logoH + 8 + CAP * capSize : enBase;
    /** 一行字落在 [rowTop, rowBottom] 之间时，右边要给 Logo 让出的宽度。 */
    const reserve = (rowTop: number, rowBottom: number) => {
      if (!caption) return 0;
      let width = 0;
      if (rowBottom > markTop && rowTop < markTop + logoH) width = Math.max(width, logoW);
      if (rowBottom > captionBase - CAP * capSize && rowTop < captionBase + 0.22 * capSize) {
        width = Math.max(width, capWidth);
      }
      return width ? width + 28 : 0;
    };

    const id = FTA_STATION_MODULES.stationName;
    const enFont = c.italic ? FTA_FONT.italic : FTA_FONT.regular;
    let enSize = 26;
    const enAvail = dw - 2 * M - reserve(enBase - CAP * 26, enBase + 0.22 * 26);
    const enWidth = canvas.measure(enFont, c.station.secondary, enSize);
    if (enWidth > enAvail) enSize = Math.max(16, (enSize * enAvail) / enWidth);
    let cnSize = fill;
    const cnAvail = dw - 2 * M - reserve(regionTop, cnBottom);
    const cnWidth = canvas.measure(FTA_FONT.name, c.station.name, cnSize);
    // 宽度放不下就直接缩小字号，多出的空间留在上方（不用长体）。
    if (cnWidth > cnAvail) cnSize = Math.max(36, (cnSize * cnAvail) / cnWidth);
    const cnInk = canvas.ink(FTA_FONT.name, c.station.name, cnSize);
    const enInk = canvas.ink(enFont, c.station.secondary, enSize);
    const cn = canvas.text(
      id,
      FTA_FONT.name,
      c.station.name,
      cnSize,
      M - cnInk.x1,
      cnBottom - 0.08 * cnSize,
      c.textColor,
      c.italic ? ITALIC_SKEW : 0,
    );
    const en = canvas.text(
      id,
      enFont,
      c.station.secondary,
      enSize,
      M - enInk.x1,
      enBase,
      c.textColor,
    );
    canvas.add(id, [cn.node, en.node], unionBBox([cn.bbox, en.bbox]));

    if (caption) {
      const logoId = FTA_STATION_MODULES.logo;
      const captionInk = canvas.ink(FTA_FONT.regular, caption, capSize);
      const text = canvas.text(
        logoId,
        FTA_FONT.regular,
        caption,
        capSize,
        dw - M - captionInk.x2,
        captionBase,
        c.textColor,
      );
      canvas.add(
        logoId,
        [ftaMark(dw - M - logoW, markTop, logoH, logoReversed(c)), text.node],
        unionBBox([{ x: dw - M - logoW, y: markTop, width: logoW, height: logoH }, text.bbox]),
      );
    }
  }

  return canvas.tree(c.background);
}

// ————————————————————————— 柱名牌 —————————————————————————

function layoutPillar({
  content: c,
  size,
  shaper,
  tweaks,
}: LayoutInput<FtaStationContent>): RenderTree {
  const s = Math.min(size.width / 200, size.height / 200);
  const canvas = new FtaCanvas(shaper, tweaks, s, size.width, size.height);
  const dw = canvas.designWidth;
  const dh = canvas.designHeight;
  const M = 16;
  const rowH = 36;
  const n = c.lines.length;
  const rowsY = dh - n * rowH;
  const slant = bandSlant(c.slant);
  const vertical = size.height > size.width;

  // —— 线路：每条一行叠在底部，行里是站号块和线路主名 ——
  {
    const id = FTA_STATION_MODULES.belt;
    const codes = c.lines.map(stationCode);
    const metrics = c.lines.map((_line, i) =>
      chipMetrics(canvas, rowsY + i * rowH, rowsY + (i + 1) * rowH, 17),
    );
    const widths = codes.map((code, i) => (code ? chipWidth(canvas, metrics[i]!, code) : 0));
    const labelLeft = (i: number) => M + (widths[i] ? widths[i]! + 8 : 0);
    const maxLevel = Math.min(1, maxLabelLevel(c));
    // 各行一起降级：有一行放不下主名，各行就都只留站号块。
    const level = Math.min(
      maxLevel,
      ...c.lines.map(
        (line, i) => fitLineLabel(canvas, line.name, "", dw - M - labelLeft(i), maxLevel).level,
      ),
    );
    const children: RenderNode[] = [];
    const items: Record<string, BBox> = {};
    c.lines.forEach((line, i) => {
      const y0 = canvas.snap(rowsY + i * rowH);
      const y1 = canvas.snap(rowsY + (i + 1) * rowH);
      children.push({
        kind: "rect",
        x: 0,
        y: y0,
        width: dw,
        height: y1 - y0 + (i < n - 1 ? 0.6 : 0),
        fill: line.color,
      });
      if (codes[i]) {
        children.push(
          ...drawChip(canvas, id, metrics[i]!, M, codes[i]!, c.background, c.textColor, slant)
            .nodes,
        );
        if (M + widths[i]! > dw - 4) canvas.warn(id, `牌子太窄，放不下站号“${codes[i]}”。`);
      }
      const fit = fitLineLabel(canvas, line.name, "", dw - M - labelLeft(i), level);
      children.push(
        ...lineLabel(
          canvas,
          id,
          line,
          fit,
          labelLeft(i),
          rowsY + (i + 0.5) * rowH,
          lineInk(c, line.color),
        ),
      );
      items[`${id}#${i}`] = { x: 0, y: rowsY + i * rowH, width: dw, height: rowH };
    });
    canvas.add(id, children, { x: 0, y: rowsY, width: dw, height: n * rowH }, items);
    canvas.affordance(ADD_LINE_ACTION, "添加线路", dw, dh, `${id}#${n}`);
  }

  // —— Logo：标志在 1×1、横两格上不到 17 px，只在 2×2 及以上显示，放右上角，不带说明文字 ——
  const showLogo = Boolean(c.logo.operator) && s >= 1 && !vertical;
  const logoH = 26;
  const logoW = (logoH * FTA_MARK_WIDTH) / FTA_MARK_HEIGHT;
  if (showLogo) {
    canvas.add(FTA_STATION_MODULES.logo, [ftaMark(dw - M - logoW, 14, logoH, logoReversed(c))], {
      x: dw - M - logoW,
      y: 14,
      width: logoW,
      height: logoH,
    });
  }

  const id = FTA_STATION_MODULES.stationName;
  const enFont = c.italic ? FTA_FONT.italic : FTA_FONT.regular;
  if (vertical) {
    // —— 竖版：中文一字一行压在中轴线上，字号约为牌宽的四成、字距 1.12 倍；
    // 第二语言顺时针转 90° 放在右侧留白里，和第一个字的顶边对齐。整组在线路行上方居中 ——
    const top = 18;
    const bottom = rowsY - 14;
    const chars = [...c.station.name];
    const pitch = 1.12;
    const span = Math.max(1, chars.length * pitch - (pitch - 1));
    const charSize = Math.min(0.42 * dw, (bottom - top) / span);
    const blockH = charSize * span;
    let enSize = 18;
    const enWidth = canvas.measure(enFont, c.station.secondary, enSize);
    if (enWidth > blockH) enSize = Math.max(10 / s, (enSize * blockH) / enWidth);
    const gap = 10;
    let axis = dw / 2;
    const enRight = axis + charSize / 2 + gap + (0.22 + CAP) * enSize;
    if (enRight > dw - 10) axis -= enRight - (dw - 10);
    const y0 = top + (bottom - top - blockH) / 2;
    const nodes: RenderNode[] = [];
    chars.forEach((char, i) => {
      const ink = canvas.ink(FTA_FONT.name, char, charSize);
      nodes.push(
        canvas.text(
          id,
          FTA_FONT.name,
          char,
          charSize,
          axis - (ink.x1 + ink.x2) / 2,
          y0 + i * charSize * pitch + 0.88 * charSize,
          c.textColor,
        ).node,
      );
    });
    const ex = axis + charSize / 2 + gap + 0.22 * enSize;
    const en = canvas.text(id, enFont, c.station.secondary, enSize, 0, 0, c.textColor);
    if (c.station.secondary) {
      nodes.push({
        kind: "group",
        transform: `translate(${fmt(ex)} ${fmt(y0 + 0.06 * charSize)}) rotate(90)`,
        children: [en.node],
      });
    }
    canvas.add(id, nodes, {
      x: axis - charSize / 2,
      y: y0,
      width: charSize + gap + (0.22 + CAP) * enSize,
      height: blockH,
    });
  } else {
    // —— 横版：站名组撑满宽度，在线路行上方的区域里上下居中 ——
    const top = 14;
    const width = dw - 2 * M - (showLogo ? logoW + 10 : 0);
    // 同站名牌：第二语言基线离线路行的距离等于中文与第二语言之间的间距。
    const nameGap = 9;
    let enSize = 20;
    const enBase = rowsY - nameGap;
    const enWidth = canvas.measure(enFont, c.station.secondary, enSize);
    if (enWidth > width) enSize = Math.max(10 / s, (enSize * width) / enWidth);
    const cnBottom = enBase - CAP * 20 - nameGap;
    let cnSize = (cnBottom - top) / 0.94;
    const cnWidth = canvas.measure(FTA_FONT.name, c.station.name, cnSize);
    if (cnWidth > width) cnSize = (cnSize * width) / cnWidth;
    const lift = (cnBottom - top - 0.94 * cnSize) / 2;
    const cnInk = canvas.ink(FTA_FONT.name, c.station.name, cnSize);
    const enInk = canvas.ink(enFont, c.station.secondary, enSize);
    const cn = canvas.text(
      id,
      FTA_FONT.name,
      c.station.name,
      cnSize,
      M - cnInk.x1,
      cnBottom - 0.08 * cnSize - lift,
      c.textColor,
      c.italic ? ITALIC_SKEW : 0,
    );
    const en = canvas.text(
      id,
      enFont,
      c.station.secondary,
      enSize,
      M - enInk.x1,
      enBase - lift,
      c.textColor,
    );
    canvas.add(id, [cn.node, en.node], unionBBox([cn.bbox, en.bbox]));
  }

  return canvas.tree(c.background);
}
