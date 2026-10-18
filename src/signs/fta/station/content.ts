import { exactGrid } from "@/mapart/grid";
import type { LegacyMigration, Lighting, SignSize } from "../../types";
import { asArray, asBoolean, asChoice, asColor, asNumber, asRecord, asString } from "../../values";
import { FTA_LINE_PRESETS, FTA_OPERATORS, type FtaOperator } from "../assets";

/** 一条经过本站的线路。 */
export interface FtaLine {
  /** 线路代号，例如 WS。 */
  code: string;
  /** 本站在这条线上的序号；纯数字显示时补成两位，数据里保存原样。 */
  number: string;
  name: string;
  /** 线路名的第二语言。 */
  secondary: string;
  color: string;
}

/** 版式：自动按宽高比选；站名牌是 1×3 这类长条，柱名牌是方形和竖条。 */
export type FtaLayoutMode = "auto" | "station" | "pillar";
/** 线路名显示几档：自动（放得下就写第二语言）、只写主名、不写（只留站号块）。 */
export type FtaLineNames = "auto" | "main" | "none";
export type FtaLogoVariant = "auto" | "normal" | "reversed";
export type FtaLogoPosition = "bottom" | "top";

export interface FtaStationContent {
  station: { name: string; secondary: string };
  lines: FtaLine[];
  textColor: string;
  background: string;
  lineNames: FtaLineNames;
  /** 色带里线路名的字色：默认按线路色自动选深浅，也可以统一指定一个颜色。 */
  lineInk: { custom: boolean; color: string };
  /** operator 为空表示不放 Logo。 */
  logo: { operator: FtaOperator | ""; variant: FtaLogoVariant; position: FtaLogoPosition };
  /** 站名斜体：西文用真斜体，中文仿斜。 */
  italic: boolean;
  /** 色带分段和站号块按 FTA 标志的斜度切开。 */
  slant: boolean;
  layout: FtaLayoutMode;
}

const DEFAULT_LINE: FtaLine = {
  code: "WS",
  number: "01",
  name: "浦蓝线",
  secondary: "Waterside Line",
  color: "#55CCFF",
};

/** 默认内容沿用旧版：主城湾、浦蓝线、黑字白底。 */
export const FTA_STATION_DEFAULTS: FtaStationContent = {
  station: { name: "主城湾", secondary: "Spawn Bay" },
  lines: [DEFAULT_LINE],
  textColor: "#000000",
  background: "#FFFFFF",
  lineNames: "auto",
  lineInk: { custom: false, color: "#FFFFFF" },
  logo: { operator: "", variant: "auto", position: "bottom" },
  italic: false,
  slant: true,
  layout: "auto",
};

export function ftaStationDefaults(): FtaStationContent {
  return structuredClone(FTA_STATION_DEFAULTS);
}

/** 新线路：颜色取还没用过的预设色，序号 01，代号和名字留空等用户填。 */
export function newFtaLine(content: FtaStationContent): FtaLine {
  const used = new Set(content.lines.map((line) => line.color.toUpperCase()));
  const color =
    FTA_LINE_PRESETS.find((preset) => !used.has(preset)) ??
    FTA_LINE_PRESETS[content.lines.length % FTA_LINE_PRESETS.length]!;
  return { code: "", number: "01", name: "", secondary: "", color };
}

function normalizeLine(raw: unknown, fallbackColor: string): FtaLine {
  const value = asRecord(raw);
  return {
    code: asString(value.code, ""),
    number: asString(value.number, "01"),
    name: asString(value.name, ""),
    secondary: asString(value.secondary, ""),
    color: asColor(value.color, fallbackColor),
  };
}

/** 补齐缺失字段、纠正类型；导入的文件和本地存档都先过这一步。至少保留一条线路。 */
export function normalizeFtaStation(raw: unknown): FtaStationContent {
  const d = FTA_STATION_DEFAULTS;
  const value = asRecord(raw);
  const station = asRecord(value.station);
  const lineInk = asRecord(value.lineInk);
  const logo = asRecord(value.logo);
  const lines = asArray(value.lines).map((line, index) =>
    normalizeLine(line, FTA_LINE_PRESETS[index % FTA_LINE_PRESETS.length]!),
  );
  return {
    station: {
      name: asString(station.name, d.station.name),
      secondary: asString(station.secondary, d.station.secondary),
    },
    lines: lines.length > 0 ? lines : structuredClone(d.lines),
    textColor: asColor(value.textColor, d.textColor),
    background: asColor(value.background, d.background),
    lineNames: asChoice(value.lineNames, ["auto", "main", "none"] as const, d.lineNames),
    lineInk: {
      custom: asBoolean(lineInk.custom, d.lineInk.custom),
      color: asColor(lineInk.color, d.lineInk.color),
    },
    logo: {
      operator: asChoice<FtaOperator | "">(logo.operator, ["", ...FTA_OPERATORS], ""),
      variant: asChoice(logo.variant, ["auto", "normal", "reversed"] as const, d.logo.variant),
      position: asChoice(logo.position, ["bottom", "top"] as const, d.logo.position),
    },
    italic: asBoolean(value.italic, d.italic),
    slant: asBoolean(value.slant, d.slant),
    layout: asChoice(value.layout, ["auto", "station", "pillar"] as const, d.layout),
  };
}

const HAS_CJK = /[㐀-鿿豈-﫿]/;

/**
 * 旧版的线路名是一个字段，例如“Waterside Line · 浦蓝线”。按“·”拆开：含汉字的一半作主名，
 * 其余作第二语言；没有“·”时整串作主名。
 */
export function splitLegacyLineName(name: string): { name: string; secondary: string } {
  const parts = name
    .split(/\s*[·・•]\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length < 2) return { name: name.trim(), secondary: "" };
  const mainIndex = Math.max(
    0,
    parts.findIndex((part) => HAS_CJK.test(part)),
  );
  return {
    name: parts[mainIndex]!,
    secondary: parts.filter((_part, index) => index !== mainIndex).join(" · "),
  };
}

/** 旧版 Logo 选项“FTA-Logo-SUR-Reversed”拆成运营方和配色。 */
function legacyLogo(enabled: boolean, style: string): FtaStationContent["logo"] {
  const match = /^FTA-Logo-(SUR|NLRR|MLR|Lobby|PUAT)(-Reversed)?$/.exec(style);
  if (!enabled || !match) return { operator: "", variant: "auto", position: "bottom" };
  return {
    operator: match[1] as FtaOperator,
    variant: match[2] ? "reversed" : "normal",
    position: "bottom",
  };
}

/**
 * 旧版 beta-v0.1.1 JSON 迁移，规则见 docs/rewrite-decisions.md 3.1“旧文件迁移”。
 * 旧版数字常存成字符串，序号可能是数字；随机生成的颜色可能不足 6 位，读不出来时用预设色。
 */
export function migrateLegacyFtaStation(
  legacy: Record<string, unknown>,
): LegacyMigration<FtaStationContent> {
  const info = asRecord(legacy.signInfo);
  const config = asRecord(info.signConfig);
  const layoutInfo = asRecord(info.layoutInfo);
  const station = asRecord(info.thisStation);
  const logoInfo = asRecord(info.logoInfo);
  const output = asRecord(legacy.output);
  const lineInk = asColor(layoutInfo.stationNameColor, "#FFFFFF");

  const content = normalizeFtaStation({
    station: { name: station.nameMain, secondary: station.nameSub },
    lines: asArray(info.lineInfo).map((raw) => {
      const line = asRecord(raw);
      return {
        code: asString(line.nameAbbr, ""),
        number: asString(line.stationNumber, ""),
        color: line.color,
        ...splitLegacyLineName(asString(line.name, "")),
      };
    }),
    textColor: layoutInfo.textColor,
    background: layoutInfo.backgroundColor,
    lineNames: asBoolean(config.simplifySign, false) ? "none" : "auto",
    // 旧版默认的白字压在浅色线路上看不清，换成自动；用户改过的颜色原样保留。
    lineInk:
      lineInk === "#FFFFFF" ? { custom: false, color: lineInk } : { custom: true, color: lineInk },
    logo: legacyLogo(asBoolean(logoInfo.enableLogo, false), asString(logoInfo.logoStyle, "")),
    italic: config.stationNameItalic,
    slant: true,
    layout: "auto",
  });

  const width = Math.round(asNumber(output.outputWidth, 600, 16, 8192));
  const height = Math.round(asNumber(output.outputHeight, 200, 16, 8192));
  const grid = exactGrid({ width, height });
  const size: SignSize = grid ? { mode: "grid", grid } : { mode: "free", width, height };
  const lighting = asChoice<Lighting>(legacy.lightStyle, ["none", "fluore", "led"], "fluore");
  return { content, size, lighting };
}
