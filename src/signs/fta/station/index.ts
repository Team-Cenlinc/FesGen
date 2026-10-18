import type { SignStyle } from "../../types";
import { FTA_OPERATOR_LABEL, FTA_OPERATORS } from "../assets";
import { ftaFonts } from "../fonts";
import {
  ftaStationDefaults,
  migrateLegacyFtaStation,
  newFtaLine,
  normalizeFtaStation,
  type FtaStationContent,
} from "./content";
import { ADD_LINE_ACTION, FTA_STATION_MODULES as M, layoutFtaStation } from "./layout";

/**
 * FTA 车站牌：保留旧版骨架（左上站名、底部色带、右下 Logo），重做色带、站号和字号规则；
 * 小格子自动换成柱名牌。规格见 docs/rewrite-decisions.md 3.1。
 */
export const ftaStationStyle: SignStyle<FtaStationContent> = {
  id: "FTA-station",
  label: "FTA 车站牌",
  description:
    "FTA 车站名牌：左上站名，底部是按线路等分的斜切色带，右下是运营方 Logo。方形和竖条格子自动换成柱名牌。",
  defaultSize: { mode: "grid", grid: { rows: 1, columns: 3 } },
  regions: [
    { id: "top-left", label: "左上 · 站名" },
    { id: "top-right", label: "右上 · 空位" },
    { id: "bottom-right", label: "右下 · 标识" },
    { id: "bottom", label: "底 · 线路带" },
  ],
  modules: [
    {
      id: M.stationName,
      label: "站名",
      region: "top-left",
      fields: [
        { type: "text", path: "station.name", label: "站名" },
        { type: "text", path: "station.secondary", label: "站名 · 第二语言" },
        { type: "toggle", path: "italic", label: "站名斜体" },
      ],
    },
    {
      id: M.logo,
      label: "Logo",
      region: "bottom-right",
      fields: [
        {
          type: "select",
          path: "logo.operator",
          label: "运营方",
          options: [
            { value: "", label: "不显示" },
            ...FTA_OPERATORS.map((id) => ({ value: id, label: FTA_OPERATOR_LABEL[id] })),
          ],
        },
        {
          type: "choice",
          path: "logo.variant",
          label: "配色",
          options: [
            { value: "auto", label: "自动" },
            { value: "normal", label: "正常" },
            { value: "reversed", label: "反色" },
          ],
          visibleWhen: "logo.operator",
        },
        {
          type: "choice",
          path: "logo.position",
          label: "位置",
          options: [
            { value: "bottom", label: "右下" },
            { value: "top", label: "右上" },
          ],
          visibleWhen: "logo.operator",
        },
      ],
    },
    {
      id: M.belt,
      label: "线路色带",
      region: "bottom",
      fields: [
        {
          type: "list",
          path: "lines",
          label: "线路",
          itemLabel: "线路",
          itemTitle: ["code", "name"],
          min: 1,
          fields: [
            { type: "text", path: "code", label: "线路代号", placeholder: "WS" },
            { type: "text", path: "number", label: "本站序号", placeholder: "01" },
            { type: "text", path: "name", label: "线路名" },
            { type: "text", path: "secondary", label: "线路名 · 第二语言" },
            { type: "color", path: "color", label: "线路颜色" },
          ],
        },
        {
          type: "choice",
          path: "lineNames",
          label: "线路名",
          options: [
            { value: "auto", label: "自动" },
            { value: "main", label: "只写主名" },
            { value: "none", label: "不写" },
          ],
        },
        { type: "toggle", path: "lineInk.custom", label: "线路名用指定颜色" },
        {
          type: "color",
          path: "lineInk.color",
          label: "线路名颜色",
          visibleWhen: "lineInk.custom",
        },
        { type: "toggle", path: "slant", label: "斜切色带" },
      ],
    },
  ],
  globalFields: [
    {
      type: "choice",
      path: "layout",
      label: "版式",
      options: [
        { value: "auto", label: "自动" },
        { value: "station", label: "站名牌" },
        { value: "pillar", label: "柱名牌" },
      ],
    },
    { type: "color", path: "textColor", label: "文字颜色" },
    { type: "color", path: "background", label: "背景颜色" },
  ],
  globalActions: [],
  defaults: ftaStationDefaults,
  normalize: normalizeFtaStation,
  fonts: (content) => ftaFonts(content.italic),
  layout: layoutFtaStation,
  applyAction(content, actionId) {
    return actionId === ADD_LINE_ACTION
      ? { ...content, lines: [...content.lines, newFtaLine(content)] }
      : content;
  },
  newListItem(content, path) {
    return path === "lines" ? newFtaLine(content) : undefined;
  },
  title: (content) => content.station.name,
  fromLegacy: migrateLegacyFtaStation,
};
