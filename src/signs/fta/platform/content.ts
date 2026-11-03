import type { LegacyMigration } from "../../types";
import { asArray, asChoice, asColor, asRecord, asString } from "../../values";
import { FTA_BACKGROUNDS, FTA_LINE_PRESETS, nextLinePreset, type FtaBackground } from "../assets";
import { migrateLegacyFtaStation } from "../station/content";

/** 一条经过本站的线路。站台牌只写线路主名，没有第二语言。 */
export interface FtaPlatformLine {
  /** 线路代号，例如 WS。 */
  code: string;
  /** 本站在这条线上的序号；纯数字显示时补成两位，数据里保存原样。 */
  number: string;
  name: string;
  color: string;
}

/**
 * 样式只能选一个，每种样式固定对齐方式和线路行位置：
 * 中轴是居中、线路行在站名下方；极简是左对齐、本线在站名上方；色框在极简外面加一圈本线颜色。
 * 竖版（柱名牌）不分样式，一律居中。
 */
export type FtaPlatformLook = "axis" | "minimal" | "frame";
export const FTA_PLATFORM_LOOKS = ["axis", "minimal", "frame"] as const;

/** 站台牌的底色：FTA 共用的几种固定色，见 assets.ts。 */
export const FTA_PLATFORM_BACKGROUNDS = FTA_BACKGROUNDS;
export type FtaPlatformBackground = FtaBackground;
const BACKGROUND_IDS = Object.keys(FTA_PLATFORM_BACKGROUNDS) as FtaPlatformBackground[];

/** 版式：自动按宽高比选，横版用于 1×3 这类长条，竖版用于 2×1 这类柱子。 */
export type FtaPlatformLayout = "auto" | "horizontal" | "vertical";

export interface FtaPlatformContent {
  station: { name: string; secondary: string };
  lines: FtaPlatformLine[];
  look: FtaPlatformLook;
  /** 底边色带：按显示的线路等分。色框样式不受影响。 */
  band: boolean;
  background: FtaPlatformBackground;
  /** 显示全部线路，还是只显示列表里的第一条（本线）。 */
  showLines: "all" | "first";
  nameWeight: "800" | "700";
  layout: FtaPlatformLayout;
}

export const FTA_PLATFORM_DEFAULTS: FtaPlatformContent = {
  station: { name: "主城湾", secondary: "Spawn Bay" },
  lines: [{ code: "WS", number: "01", name: "浦蓝线", color: "#6699D8" }],
  look: "axis",
  band: true,
  background: "white",
  showLines: "all",
  nameWeight: "800",
  layout: "auto",
};

export function ftaPlatformDefaults(): FtaPlatformContent {
  return structuredClone(FTA_PLATFORM_DEFAULTS);
}

/** 新线路：颜色取还没用过的预设色，序号 01，代号和名字留空等用户填。 */
export function newFtaPlatformLine(content: FtaPlatformContent): FtaPlatformLine {
  const color = nextLinePreset(content.lines.map((line) => line.color));
  return { code: "", number: "01", name: "", color };
}

function normalizeLine(raw: unknown, fallbackColor: string): FtaPlatformLine {
  const value = asRecord(raw);
  return {
    code: asString(value.code, ""),
    number: asString(value.number, "01"),
    name: asString(value.name, ""),
    color: asColor(value.color, fallbackColor),
  };
}

/** 补齐缺失字段、纠正类型；导入的文件和本地存档都先过这一步。至少保留一条线路。 */
export function normalizeFtaPlatform(raw: unknown): FtaPlatformContent {
  const d = FTA_PLATFORM_DEFAULTS;
  const value = asRecord(raw);
  const station = asRecord(value.station);
  const lines = asArray(value.lines).map((line, index) =>
    normalizeLine(line, FTA_LINE_PRESETS[index % FTA_LINE_PRESETS.length]!),
  );
  return {
    station: {
      name: asString(station.name, d.station.name),
      secondary: asString(station.secondary, d.station.secondary),
    },
    lines: lines.length > 0 ? lines : structuredClone(d.lines),
    look: asChoice(value.look, FTA_PLATFORM_LOOKS, d.look),
    band: typeof value.band === "boolean" ? value.band : d.band,
    background: asChoice(value.background, BACKGROUND_IDS, d.background),
    showLines: asChoice(value.showLines, ["all", "first"] as const, d.showLines),
    nameWeight: asChoice(String(value.nameWeight), ["800", "700"] as const, d.nameWeight),
    layout: asChoice(value.layout, ["auto", "horizontal", "vertical"] as const, d.layout),
  };
}

/**
 * 站台牌是新样式，没有旧版文件；接口要求迁移函数，这里按旧版 FTA 车站牌读出站名和线路，
 * 颜色、Logo 这些旧版设置不对应新样式，用默认值。
 */
export function migrateLegacyFtaPlatform(
  legacy: Record<string, unknown>,
): LegacyMigration<FtaPlatformContent> {
  const station = migrateLegacyFtaStation(legacy);
  return {
    ...station,
    content: normalizeFtaPlatform({
      station: station.content.station,
      lines: station.content.lines,
    }),
  };
}
