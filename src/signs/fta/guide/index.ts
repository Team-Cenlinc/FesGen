import type { SignStyle } from "../../types";
import { ftaFonts } from "../fonts";
import {
  ftaGuideDefaults,
  ftaGuideTemplate,
  migrateLegacyFtaGuide,
  newFtaGuideLine,
  newFtaGuidePanel,
  normalizeFtaGuide,
  type FtaGuideContent,
  type FtaGuideTemplate,
} from "./content";
import { ADD_PANEL_ACTION, FTA_GUIDE_MODULES as M, layoutFtaGuide } from "./layout";

const TEMPLATE_ACTION = "template:";

const isDest = "kind=dest";

/**
 * FTA 导视牌：方向牌、出口牌、设施牌、车站入口牌都由面板拼成，参考 JR 东日本的导视。
 * 模板只是预先填好的面板，套用后都能改。
 */
export const ftaGuideStyle: SignStyle<FtaGuideContent> = {
  id: "FTA-guide",
  label: "FTA 导视牌",
  description: "方向牌、出口牌、设施牌和车站入口牌：由按语义上色的面板拼成，箭头贴在它指的一侧。",
  defaultSize: { mode: "grid", grid: { rows: 1, columns: 4 } },
  regions: [
    { id: "panels", label: "面板" },
    { id: "station", label: "车站" },
  ],
  modules: [
    {
      id: M.panels,
      label: "面板",
      region: "panels",
      fields: [
        {
          type: "list",
          path: "panels",
          label: "面板",
          itemLabel: "面板",
          itemTitle: ["name", "exits"],
          min: 1,
          fields: [
            {
              type: "choice",
              path: "kind",
              label: "内容",
              options: [
                { value: "dest", label: "目的地" },
                { value: "station", label: "站名" },
              ],
            },
            {
              type: "select",
              path: "tone",
              label: "底色",
              options: [
                { value: "main", label: "主色（跟随整块牌子）" },
                { value: "exit", label: "出口黄" },
                { value: "white", label: "白" },
                { value: "black", label: "黑" },
                { value: "navy", label: "藏青" },
                { value: "teal", label: "青绿" },
                { value: "brick", label: "砖红" },
                { value: "custom", label: "自定义" },
              ],
            },
            { type: "color", path: "color", label: "自定义底色", visibleWhen: "tone=custom" },
            {
              type: "select",
              path: "arrow",
              label: "箭头",
              options: [
                { value: "none", label: "无" },
                { value: "left", label: "← 左" },
                { value: "right", label: "→ 右" },
                { value: "up", label: "↑ 上" },
                { value: "down", label: "↓ 下" },
                { value: "up-left", label: "↖ 左上" },
                { value: "up-right", label: "↗ 右上" },
                { value: "down-left", label: "↙ 左下" },
                { value: "down-right", label: "↘ 右下" },
              ],
            },
            { type: "text", path: "name", label: "文字", visibleWhen: isDest },
            { type: "text", path: "secondary", label: "文字 · 英文", visibleWhen: isDest },
            {
              type: "text",
              path: "stationName",
              label: "站名覆盖（留空用“车站与线路”的站名）",
              placeholder: "留空即跟随车站",
              visibleWhen: "kind=station",
            },
            {
              type: "text",
              path: "stationSecondary",
              label: "站名覆盖 · 英文（留空跟随车站）",
              placeholder: "留空即跟随车站",
              visibleWhen: "kind=station",
            },
            {
              type: "text",
              path: "to",
              label: "去向",
              placeholder: "往 主城湾",
              visibleWhen: isDest,
            },
            {
              type: "text",
              path: "toSecondary",
              label: "去向 · 英文",
              placeholder: "for Spawn Bay",
              visibleWhen: isDest,
            },
            {
              type: "text",
              path: "lines",
              label: "线路代号",
              placeholder: "WS HT（空格分开）",
              visibleWhen: isDest,
            },
            {
              type: "text",
              path: "exits",
              label: "出口编号",
              placeholder: "A B2（空格分开）",
              visibleWhen: isDest,
            },
            { type: "toggle", path: "icons.info", label: "问询", visibleWhen: isDest },
            { type: "toggle", path: "icons.elevator", label: "电梯", visibleWhen: isDest },
            { type: "toggle", path: "icons.stairs", label: "楼梯", visibleWhen: isDest },
            { type: "toggle", path: "icons.toilet", label: "卫生间", visibleWhen: isDest },
            { type: "toggle", path: "icons.accessible", label: "无障碍", visibleWhen: isDest },
            { type: "toggle", path: "icons.ticket", label: "售票", visibleWhen: isDest },
            { type: "toggle", path: "logo", label: "Logo", visibleWhen: "kind=station" },
            {
              type: "choice",
              path: "row",
              label: "所在行",
              options: [
                { value: "1", label: "第一行" },
                { value: "2", label: "第二行" },
              ],
            },
            { type: "toggle", path: "flip", label: "文字在前，图标放后面" },
            { type: "toggle", path: "fill", label: "撑满剩余宽度" },
            {
              type: "choice",
              path: "align",
              label: "水平对齐",
              options: [
                { value: "start", label: "靠左" },
                { value: "center", label: "居中" },
                { value: "end", label: "靠右" },
              ],
            },
            {
              type: "choice",
              path: "valign",
              label: "竖直对齐",
              options: [
                { value: "top", label: "靠上" },
                { value: "middle", label: "居中" },
                { value: "bottom", label: "靠下" },
              ],
            },
          ],
        },
      ],
      actions: [{ id: ADD_PANEL_ACTION, label: "添加面板" }],
    },
    {
      id: M.station,
      label: "车站与线路",
      region: "station",
      fields: [
        { type: "text", path: "station.name", label: "站名" },
        { type: "text", path: "station.secondary", label: "站名 · 英文" },
        {
          type: "list",
          path: "lines",
          label: "线路",
          itemLabel: "线路",
          itemTitle: ["code", "name"],
          min: 0,
          fields: [
            { type: "text", path: "code", label: "线路代号", placeholder: "WS" },
            { type: "text", path: "name", label: "线路名" },
            { type: "text", path: "secondary", label: "线路名 · 英文" },
            { type: "color", path: "color", label: "线路颜色" },
          ],
        },
      ],
    },
  ],
  globalFields: [
    {
      type: "select",
      path: "background",
      label: "主色",
      options: [
        { value: "black", label: "黑" },
        { value: "white", label: "白" },
        { value: "navy", label: "藏青" },
        { value: "teal", label: "青绿" },
        { value: "brick", label: "砖红" },
        { value: "custom", label: "自定义" },
      ],
    },
    {
      type: "color",
      path: "backgroundColor",
      label: "自定义主色",
      visibleWhen: "background=custom",
    },
    {
      type: "choice",
      path: "lineMark",
      label: "线路标",
      options: [
        { value: "solid", label: "实心方块" },
        { value: "frame", label: "色框方块" },
        { value: "bar", label: "色条" },
      ],
    },
    { type: "toggle", path: "dividers", label: "面板分隔线" },
  ],
  globalActions: [
    { id: `${TEMPLATE_ACTION}direction`, label: "套用方向牌" },
    { id: `${TEMPLATE_ACTION}entrance`, label: "套用入口牌" },
    { id: `${TEMPLATE_ACTION}exit`, label: "套用出口牌" },
    { id: `${TEMPLATE_ACTION}facility`, label: "套用设施牌" },
  ],
  defaults: ftaGuideDefaults,
  normalize: normalizeFtaGuide,
  fonts: () => ftaFonts(false),
  layout: layoutFtaGuide,
  applyAction(content, actionId) {
    if (actionId === ADD_PANEL_ACTION) {
      return { ...content, panels: [...content.panels, newFtaGuidePanel(content)] };
    }
    if (actionId.startsWith(TEMPLATE_ACTION)) {
      const template = actionId.slice(TEMPLATE_ACTION.length) as FtaGuideTemplate;
      return { ...content, panels: ftaGuideTemplate(template, content.lines) };
    }
    return content;
  },
  newListItem(content, path) {
    if (path === "lines") return newFtaGuideLine(content);
    if (path === "panels") return newFtaGuidePanel(content);
    return undefined;
  },
  title: (content) => content.station.name,
  fromLegacy: migrateLegacyFtaGuide,
};
