import type { LegacyMigration } from "../../types";
import { asArray, asBoolean, asChoice, asColor, asRecord, asString } from "../../values";
import { FTA_BACKGROUNDS, FTA_LINE_PRESETS, nextLinePreset, type FtaBackground } from "../assets";

/** 一条线路。导视牌只用线路代号做线路标（WS），不带站序号。 */
export interface FtaGuideLine {
  code: string;
  name: string;
  secondary: string;
  color: string;
}

export const FTA_GUIDE_ARROWS = [
  "none",
  "left",
  "right",
  "up",
  "down",
  "up-left",
  "up-right",
  "down-left",
  "down-right",
] as const;
export type FtaGuideArrow = (typeof FTA_GUIDE_ARROWS)[number];

export const FTA_GUIDE_ICONS = [
  "info",
  "elevator",
  "stairs",
  "toilet",
  "accessible",
  "ticket",
] as const;
export type FtaGuideIcon = (typeof FTA_GUIDE_ICONS)[number];

/** 底色：主色跟着整块牌子的主色走；出口黄；几种固定色；或者自定义颜色。 */
export const FTA_GUIDE_TONES = [
  "main",
  "exit",
  "white",
  "black",
  "navy",
  "teal",
  "brick",
  "custom",
] as const;
export type FtaGuideTone = (typeof FTA_GUIDE_TONES)[number];

/** 整块牌子的主色：FTA 的几种固定色（和站台牌相同），或者自定义颜色。 */
export type FtaGuideBackground = FtaBackground | "custom";

/**
 * 一块面板：满行高、自带底色，按语义上色。
 * 目的地面板放箭头、出口编号、设施图标、线路标和文字；站名面板放 Logo、站名和全部线路标。
 */
export interface FtaGuidePanel {
  /** 在第几行。 */
  row: "1" | "2";
  kind: "dest" | "station";
  /** 主色（站台、换乘、设施）、出口黄，或者别的底色。 */
  tone: FtaGuideTone;
  /** tone 为 custom 时的颜色。 */
  color: string;
  arrow: FtaGuideArrow;
  /** 线路代号，用空格分开，例如 “WS HT”；对应“车站”里的线路。 */
  lines: string;
  /** 出口编号，用空格分开，例如 “A B2”。 */
  exits: string;
  icons: Record<FtaGuideIcon, boolean>;
  name: string;
  secondary: string;
  /** 去向，例如 “往 主城湾 / for Spawn Bay”，比主文字小一级。 */
  to: string;
  toSecondary: string;
  logo: boolean;
  /**
   * 站名面板的站名覆盖：留空时用“车站与线路”里的站名，填了就只改这一块面板，
   * 例如同一站的不同出入口牌写“海西路北”。
   */
  stationName: string;
  stationSecondary: string;
  /** 行里剩下的宽度分给哪些面板。 */
  fill: boolean;
  /** 内容在面板里的水平、竖直对齐；箭头始终贴在它指的一侧。 */
  align: "start" | "center" | "end";
  valign: "top" | "middle" | "bottom";
  /** 文字放前面，出口编号、图标、线路标（站名面板是 Logo）放到文字后面。 */
  flip: boolean;
}

/** 线路标的画法：实心方块、色框方块、色条。 */
export type FtaGuideLineMark = "solid" | "frame" | "bar";

export interface FtaGuideContent {
  station: { name: string; secondary: string };
  lines: FtaGuideLine[];
  panels: FtaGuidePanel[];
  /** 主色面板的底色：FTA 的几种固定色，或者自定义。 */
  background: FtaGuideBackground;
  backgroundColor: string;
  lineMark: FtaGuideLineMark;
  /** 面板之间、两行之间的分隔线。 */
  dividers: boolean;
}

export type FtaGuideTemplate = "direction" | "entrance" | "exit" | "facility";

const NO_ICONS: Record<FtaGuideIcon, boolean> = {
  info: false,
  elevator: false,
  stairs: false,
  toilet: false,
  accessible: false,
  ticket: false,
};

export function ftaGuidePanel(patch: Partial<FtaGuidePanel> = {}): FtaGuidePanel {
  return {
    row: "1",
    kind: "dest",
    tone: "main",
    color: "#4C4C4C",
    arrow: "none",
    lines: "",
    exits: "",
    name: "",
    secondary: "",
    to: "",
    toSecondary: "",
    logo: true,
    stationName: "",
    stationSecondary: "",
    fill: true,
    align: "start",
    valign: "middle",
    flip: false,
    ...patch,
    icons: { ...NO_ICONS, ...patch.icons },
  };
}

/** 新加的一块空面板：放在最后一块所在的那一行。列表的“添加面板”和牌面上的按钮共用。 */
export function newFtaGuidePanel(content: FtaGuideContent): FtaGuidePanel {
  return ftaGuidePanel({ row: content.panels.at(-1)?.row ?? "1" });
}

/**
 * 模板只是预先填好的面板，套用后都能改；车站和线路保持不变。
 * 入口牌的站名面板不填站名，跟着“车站与线路”走；方向牌的站台面板用线路列表里的第一条线。
 */
export function ftaGuideTemplate(
  template: FtaGuideTemplate,
  lines: readonly FtaGuideLine[],
): FtaGuidePanel[] {
  switch (template) {
    case "entrance":
      return [
        ftaGuidePanel({ kind: "station" }),
        ftaGuidePanel({
          tone: "exit",
          exits: "A",
          name: "出入口",
          secondary: "Entrance",
          fill: false,
        }),
      ];
    case "exit":
      return [
        ftaGuidePanel({
          tone: "exit",
          arrow: "up-right",
          exits: "A",
          name: "A 出口",
          secondary: "Exit A",
          to: "市政厅 · 中央公园",
          toSecondary: "City Hall · Central Park",
        }),
      ];
    case "facility":
      return [
        ftaGuidePanel({
          arrow: "right",
          icons: { ...NO_ICONS, toilet: true, accessible: true },
          name: "卫生间",
          secondary: "Toilets",
        }),
      ];
    case "direction":
      return [
        ftaGuidePanel({
          arrow: "left",
          lines: lines[0]?.code ?? "",
          name: lines[0]?.name || "站台",
          secondary: lines[0] ? lines[0].secondary : "Platforms",
          to: "往 主城湾",
          toSecondary: "for Spawn Bay",
        }),
        ftaGuidePanel({
          tone: "exit",
          arrow: "right",
          exits: "A B",
          name: "出口",
          secondary: "Exit",
        }),
      ];
  }
}

const DEFAULT_LINES: FtaGuideLine[] = [
  { code: "WS", name: "望山线", secondary: "Wangshan Line", color: "#334CB2" },
  { code: "HT", name: "鹤汀线", secondary: "Heting Line", color: "#D87F33" },
];

export const FTA_GUIDE_DEFAULTS: FtaGuideContent = {
  station: { name: "中央公园", secondary: "Central Park" },
  lines: DEFAULT_LINES,
  panels: ftaGuideTemplate("direction", DEFAULT_LINES),
  background: "black",
  backgroundColor: "#4C4C4C",
  lineMark: "solid",
  dividers: true,
};

export function ftaGuideDefaults(): FtaGuideContent {
  return structuredClone(FTA_GUIDE_DEFAULTS);
}

export function newFtaGuideLine(content: FtaGuideContent): FtaGuideLine {
  return {
    code: "",
    name: "",
    secondary: "",
    color: nextLinePreset(content.lines.map((line) => line.color)),
  };
}

/** 线路代号按空格、逗号或顿号分开。 */
export function splitCodes(value: string): string[] {
  return value.split(/[\s,，、]+/).filter(Boolean);
}

function normalizeLine(raw: unknown, fallbackColor: string): FtaGuideLine {
  const value = asRecord(raw);
  return {
    code: asString(value.code, ""),
    name: asString(value.name, ""),
    secondary: asString(value.secondary, ""),
    color: asColor(value.color, fallbackColor),
  };
}

function normalizePanel(raw: unknown): FtaGuidePanel {
  const value = asRecord(raw);
  const d = ftaGuidePanel();
  const icons = asRecord(value.icons);
  return {
    row: asChoice(String(value.row), ["1", "2"] as const, d.row),
    kind: asChoice(value.kind, ["dest", "station"] as const, d.kind),
    tone: asChoice(value.tone, FTA_GUIDE_TONES, d.tone),
    color: asColor(value.color, d.color),
    arrow: asChoice(value.arrow, FTA_GUIDE_ARROWS, d.arrow),
    lines: asString(value.lines, d.lines),
    exits: asString(value.exits, d.exits),
    icons: Object.fromEntries(
      FTA_GUIDE_ICONS.map((icon) => [icon, asBoolean(icons[icon], false)]),
    ) as Record<FtaGuideIcon, boolean>,
    name: asString(value.name, d.name),
    secondary: asString(value.secondary, d.secondary),
    to: asString(value.to, d.to),
    toSecondary: asString(value.toSecondary, d.toSecondary),
    logo: asBoolean(value.logo, d.logo),
    stationName: asString(value.stationName, d.stationName),
    stationSecondary: asString(value.stationSecondary, d.stationSecondary),
    fill: asBoolean(value.fill, d.fill),
    align: asChoice(value.align, ["start", "center", "end"] as const, d.align),
    valign: asChoice(value.valign, ["top", "middle", "bottom"] as const, d.valign),
    flip: asBoolean(value.flip, d.flip),
  };
}

const BACKGROUND_IDS = [...(Object.keys(FTA_BACKGROUNDS) as FtaBackground[]), "custom"] as const;

/**
 * 补齐缺失字段、纠正类型。至少保留一块面板。
 * 没有 lines 字段时用默认线路（空列表是用户自己删光的，保留）；没有面板时按现有线路套方向牌模板，
 * 免得面板引用一条不存在的线路。
 */
export function normalizeFtaGuide(raw: unknown): FtaGuideContent {
  const d = FTA_GUIDE_DEFAULTS;
  const value = asRecord(raw);
  const station = asRecord(value.station);
  const lines = Array.isArray(value.lines)
    ? value.lines.map((line, index) =>
        normalizeLine(line, FTA_LINE_PRESETS[index % FTA_LINE_PRESETS.length]!),
      )
    : structuredClone(d.lines);
  const panels = asArray(value.panels).map(normalizePanel);
  return {
    station: {
      name: asString(station.name, d.station.name),
      secondary: asString(station.secondary, d.station.secondary),
    },
    lines,
    panels: panels.length > 0 ? panels : ftaGuideTemplate("direction", lines),
    background: asChoice(value.background, BACKGROUND_IDS, d.background),
    backgroundColor: asColor(value.backgroundColor, d.backgroundColor),
    lineMark: asChoice(value.lineMark, ["solid", "frame", "bar"] as const, d.lineMark),
    dividers: asBoolean(value.dividers, d.dividers),
  };
}

/**
 * 旧版导视牌的层、组件、文本行和新版的面板对不上，暂时不迁移；
 * 接口要求迁移函数，这里只给默认内容。导入时由 io.ts 提示还不能导入。
 */
export function migrateLegacyFtaGuide(): LegacyMigration<FtaGuideContent> {
  return {
    content: ftaGuideDefaults(),
    size: { mode: "grid", grid: { rows: 1, columns: 4 } },
    lighting: "none",
  };
}
