import type { SignStyle } from "../../types";
import { ftaFonts } from "../fonts";
import {
  ftaPlatformDefaults,
  migrateLegacyFtaPlatform,
  newFtaPlatformLine,
  normalizeFtaPlatform,
  type FtaPlatformContent,
} from "./content";
import { ADD_LINE_ACTION, FTA_PLATFORM_MODULES as M, layoutFtaPlatform } from "./layout";

/**
 * FTA 站台牌：告诉站台上和车里的乘客“这是哪一站”。站名最大，底色只能从几种固定色里选，
 * 线路色只出现在站号块和色带上；不放 Logo，Logo 留给车站入口牌。竖条格子自动换成柱名牌。
 */
export const ftaPlatformStyle: SignStyle<FtaPlatformContent> = {
  id: "FTA-platform",
  label: "FTA 站台牌",
  description:
    "站台上的站名牌：站名居中最大，线路站号块在下，底边色带可开关。竖条格子自动换成竖排柱名牌。",
  defaultSize: { mode: "grid", grid: { rows: 1, columns: 3 } },
  regions: [
    { id: "center", label: "站名" },
    { id: "lines", label: "线路" },
    { id: "edge", label: "色带" },
  ],
  modules: [
    {
      id: M.stationName,
      label: "站名",
      region: "center",
      fields: [
        { type: "text", path: "station.name", label: "站名" },
        { type: "text", path: "station.secondary", label: "站名 · 英文" },
        {
          type: "choice",
          path: "nameWeight",
          label: "站名字重",
          options: [
            { value: "800", label: "特粗" },
            { value: "700", label: "粗" },
          ],
        },
      ],
    },
    {
      id: M.lines,
      label: "线路",
      region: "lines",
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
            { type: "color", path: "color", label: "线路颜色" },
          ],
        },
        {
          type: "choice",
          path: "showLines",
          label: "显示",
          options: [
            { value: "all", label: "全部线路" },
            { value: "first", label: "只显示第一条" },
          ],
        },
      ],
    },
    {
      id: M.accent,
      label: "色带",
      region: "edge",
      fields: [{ type: "toggle", path: "band", label: "底边色带" }],
    },
  ],
  globalFields: [
    {
      type: "choice",
      path: "look",
      label: "样式",
      options: [
        { value: "axis", label: "中轴" },
        { value: "minimal", label: "极简" },
      ],
    },
    {
      type: "select",
      path: "background",
      label: "底色",
      options: [
        { value: "white", label: "白" },
        { value: "black", label: "黑" },
        { value: "navy", label: "藏青" },
        { value: "teal", label: "青绿" },
        { value: "brick", label: "砖红" },
      ],
    },
    {
      type: "choice",
      path: "layout",
      label: "版式",
      options: [
        { value: "auto", label: "自动" },
        { value: "horizontal", label: "横版" },
        { value: "vertical", label: "竖版" },
      ],
    },
  ],
  globalActions: [],
  defaults: ftaPlatformDefaults,
  normalize: normalizeFtaPlatform,
  fonts: () => ftaFonts(false),
  layout: layoutFtaPlatform,
  applyAction(content, actionId) {
    return actionId === ADD_LINE_ACTION
      ? { ...content, lines: [...content.lines, newFtaPlatformLine(content)] }
      : content;
  },
  newListItem(content, path) {
    return path === "lines" ? newFtaPlatformLine(content) : undefined;
  },
  title: (content) => content.station.name,
  fromLegacy: migrateLegacyFtaPlatform,
};
