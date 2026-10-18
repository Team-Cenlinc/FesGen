import { exactGrid } from "@/mapart/grid";
import type { LegacyMigration, Lighting, SignSize } from "../types";
import { asBoolean, asChoice, asColor, asNumber, asRecord, asString } from "../values";

/** 北宿电铁站牌的内容。字段与旧版 editorView.vue 一一对应，见 docs/feature-parity.md 第 2 节。 */
export interface KitajukuNeighbor {
  chinese: string;
  english: string;
  number: string;
  textColor: string;
}

export interface KitajukuContent {
  station: { chinese: string; kana: string; english: string; number: string; textColor: string };
  line: { name: string; abbr: string; color: string; second: { enabled: boolean; color: string } };
  left: KitajukuNeighbor;
  right: KitajukuNeighbor;
  background: string;
  frameThickness: number;
  /** 汉字强调：本站、左站、右站的中文名用粗体。 */
  emphasizeKanji: boolean;
  arrow: { visible: boolean; direction: "left" | "right" };
}

export const KITAJUKU_DEFAULTS: KitajukuContent = {
  station: {
    chinese: "海浜宿海",
    kana: "かいひんしゅくかい",
    english: "Kaihin-Shukukai",
    number: "03",
    textColor: "#383838",
  },
  line: {
    name: "東海岸本線",
    abbr: "T",
    color: "#7297DD",
    second: { enabled: false, color: "#A0D4E7" },
  },
  left: { chinese: "錦岡", english: "Nishikioka", number: "04", textColor: "#383838" },
  right: { chinese: "北宿", english: "Kitajuku", number: "02", textColor: "#7A7A7A" },
  background: "#ECECEC",
  frameThickness: 4,
  emphasizeKanji: false,
  arrow: { visible: true, direction: "left" },
};

export function kitajukuDefaults(): KitajukuContent {
  return structuredClone(KITAJUKU_DEFAULTS);
}

function normalizeNeighbor(raw: unknown, fallback: KitajukuNeighbor): KitajukuNeighbor {
  const value = asRecord(raw);
  return {
    chinese: asString(value.chinese, fallback.chinese),
    english: asString(value.english, fallback.english),
    number: asString(value.number, fallback.number),
    textColor: asColor(value.textColor, fallback.textColor),
  };
}

/** 补齐缺失字段、纠正类型；导入的文件和本地存档都先过这一步。 */
export function normalizeKitajuku(raw: unknown): KitajukuContent {
  const d = KITAJUKU_DEFAULTS;
  const value = asRecord(raw);
  const station = asRecord(value.station);
  const line = asRecord(value.line);
  const second = asRecord(line.second);
  const arrow = asRecord(value.arrow);
  return {
    station: {
      chinese: asString(station.chinese, d.station.chinese),
      kana: asString(station.kana, d.station.kana),
      english: asString(station.english, d.station.english),
      number: asString(station.number, d.station.number),
      textColor: asColor(station.textColor, d.station.textColor),
    },
    line: {
      name: asString(line.name, d.line.name),
      abbr: asString(line.abbr, d.line.abbr),
      color: asColor(line.color, d.line.color),
      second: {
        enabled: asBoolean(second.enabled, d.line.second.enabled),
        color: asColor(second.color, d.line.second.color),
      },
    },
    left: normalizeNeighbor(value.left, d.left),
    right: normalizeNeighbor(value.right, d.right),
    background: asColor(value.background, d.background),
    frameThickness: asNumber(value.frameThickness, d.frameThickness, 0, 40),
    emphasizeKanji: asBoolean(value.emphasizeKanji, d.emphasizeKanji),
    arrow: {
      visible: asBoolean(arrow.visible, d.arrow.visible),
      direction: asChoice(arrow.direction, ["left", "right"] as const, d.arrow.direction),
    },
  };
}

/** 左右邻站互换（旧版的“反转左右信息”）：中文名、英文名、编号和文字颜色一起换。 */
export function swapNeighbors(content: KitajukuContent): KitajukuContent {
  return { ...content, left: { ...content.right }, right: { ...content.left } };
}

/**
 * 旧版 beta-v0.1.1 JSON 迁移。旧版数字常存成字符串，lightStyle 与新版取值相同；
 * 输出尺寸正好是整数张地图时换成地图格模式，否则保留自由像素。
 */
export function migrateLegacyKitajuku(
  legacy: Record<string, unknown>,
): LegacyMigration<KitajukuContent> {
  const info = asRecord(legacy.signInfo);
  const main = asRecord(info.main);
  const middle = asRecord(info.middle);
  const left = asRecord(info.left);
  const right = asRecord(info.right);
  const secondLine = asRecord(info.secondLine);
  const output = asRecord(legacy.output);

  const content = normalizeKitajuku({
    station: {
      chinese: main.staNameChinese,
      kana: main.staNameKana,
      english: main.staNameEnglish,
      number: middle.middleStaNumber,
      textColor: main.mainTextColor,
    },
    line: {
      name: middle.lineName,
      abbr: middle.lineAbbr,
      color: info.lineColor,
      second: { enabled: secondLine.enable, color: secondLine.color },
    },
    left: {
      chinese: left.leftStaNameChinese,
      english: left.leftStaNameEnglish,
      number: left.leftStaNumber,
      textColor: left.leftTextColor,
    },
    right: {
      chinese: right.rightStaNameChinese,
      english: right.rightStaNameEnglish,
      number: right.rightStaNumber,
      textColor: right.rightTextColor,
    },
    background: info.backgroundColor,
    frameThickness: info.frameThickness,
    emphasizeKanji: info.chnCharacterBold,
    arrow: { visible: info.displayForwardArrow, direction: info.direction },
  });

  const width = Math.round(asNumber(output.outputWidth, 600, 16, 8192));
  const height = Math.round(asNumber(output.outputHeight, 200, 16, 8192));
  const grid = exactGrid({ width, height });
  const size: SignSize = grid ? { mode: "grid", grid } : { mode: "free", width, height };
  const lighting = asChoice<Lighting>(legacy.lightStyle, ["none", "fluore", "led"], "fluore");
  return { content, size, lighting };
}
