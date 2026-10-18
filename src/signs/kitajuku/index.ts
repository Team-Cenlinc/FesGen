import type { FontId } from "@/fonts/stacks";
import type { SignStyle } from "../types";
import {
  kitajukuDefaults,
  migrateLegacyKitajuku,
  normalizeKitajuku,
  swapNeighbors,
  type KitajukuContent,
} from "./content";
import { KITAJUKU_MODULES as M, layoutKitajuku } from "./layout";

const SWAP_NEIGHBORS = { id: "swap-neighbors", label: "左右邻站互换" } as const;

function neighborFields(side: "left" | "right") {
  return [
    { type: "text", path: `${side}.chinese`, label: "中文站名" },
    { type: "text", path: `${side}.english`, label: "英文站名" },
    { type: "text", path: `${side}.number`, label: "站点编号" },
    { type: "color", path: `${side}.textColor`, label: "文字颜色" },
  ] as const;
}

/** 北宿电铁站牌：保持旧版设计，只做自适应排版和换字体。 */
export const kitajukuStyle: SignStyle<KitajukuContent> = {
  id: "kitajuku-dentetsu",
  label: "北宿电铁",
  description: "北宿电铁站名牌：本站名居中，左右是邻站，底部是线路色带。",
  defaultSize: { mode: "grid", grid: { rows: 1, columns: 3 } },
  regions: [
    { id: "top", label: "上 · 本站名" },
    { id: "left", label: "左 · 邻站" },
    { id: "middle", label: "中 · 线路与编号" },
    { id: "right", label: "右 · 邻站" },
    { id: "bottom", label: "底 · 色带" },
    { id: "overlay", label: "叠加" },
  ],
  modules: [
    {
      id: M.stationName,
      label: "本站名",
      region: "top",
      fields: [
        { type: "text", path: "station.chinese", label: "中文站名" },
        { type: "text", path: "station.kana", label: "假名" },
        { type: "text", path: "station.english", label: "英文站名" },
        { type: "color", path: "station.textColor", label: "文字颜色" },
      ],
    },
    {
      id: M.leftStation,
      label: "左侧邻站",
      region: "left",
      fields: neighborFields("left"),
      actions: [SWAP_NEIGHBORS],
    },
    {
      id: M.lineMark,
      label: "线路标",
      region: "middle",
      fields: [
        { type: "text", path: "line.abbr", label: "线路缩写" },
        { type: "text", path: "line.name", label: "线路名称" },
      ],
    },
    {
      id: M.stationNumber,
      label: "本站编号",
      region: "middle",
      fields: [{ type: "text", path: "station.number", label: "编号" }],
    },
    {
      id: M.rightStation,
      label: "右侧邻站",
      region: "right",
      fields: neighborFields("right"),
      actions: [SWAP_NEIGHBORS],
    },
    {
      id: M.belt,
      label: "线路色带",
      region: "bottom",
      fields: [
        { type: "color", path: "line.color", label: "线路颜色" },
        { type: "toggle", path: "line.second.enabled", label: "第二条色带" },
        {
          type: "color",
          path: "line.second.color",
          label: "第二条色带颜色",
          visibleWhen: "line.second.enabled",
        },
      ],
    },
    {
      id: M.arrow,
      label: "行进方向箭头",
      region: "overlay",
      fields: [
        { type: "toggle", path: "arrow.visible", label: "显示箭头" },
        {
          type: "choice",
          path: "arrow.direction",
          label: "行进方向",
          options: [
            { value: "left", label: "向左" },
            { value: "right", label: "向右" },
          ],
          visibleWhen: "arrow.visible",
        },
      ],
    },
  ],
  globalFields: [
    { type: "color", path: "background", label: "背景颜色" },
    { type: "number", path: "frameThickness", label: "边框粗细", min: 0, max: 40, unit: "px" },
    { type: "toggle", path: "emphasizeKanji", label: "汉字强调（中文站名用粗体）" },
  ],
  globalActions: [SWAP_NEIGHBORS],
  defaults: kitajukuDefaults,
  normalize: normalizeKitajuku,
  fonts(content): FontId[] {
    return content.emphasizeKanji
      ? ["noto-sans-jp-400", "noto-sans-jp-700", "tex-gyre-heros-400"]
      : ["noto-sans-jp-400", "tex-gyre-heros-400"];
  },
  layout: layoutKitajuku,
  applyAction(content, actionId) {
    return actionId === SWAP_NEIGHBORS.id ? swapNeighbors(content) : content;
  },
  title: (content) => content.station.chinese,
  fromLegacy: migrateLegacyKitajuku,
};
