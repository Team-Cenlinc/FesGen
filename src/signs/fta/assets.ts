/**
 * FTA 牌子的图形素材，原样取自旧版模板 src/assets/signs/FTA-Station.svg（ddb8636）。
 * 五个运营方共用同一个标志，区别只在说明文字。
 */

/** 标志在自身坐标系里的宽高。 */
export const FTA_MARK_WIDTH = 262.8;
export const FTA_MARK_HEIGHT = 324;

/** 标志的平行四边形底板。 */
export const FTA_MARK_PLATE =
  "64.8 0 54 54 36 144 18 234 0 324 189 324 198 324 216 234 234 144 252 54 262.8 0 64.8 0";

/** 底板上的字形（两段）。 */
export const FTA_MARK_GLYPH_PATH =
  "m180,243h18s1.8-9,1.8-9h-9l7.2-36h-45l-9,45h36Zm-19.8-36h27l-5.4,27h-27l5.4-27Z";
export const FTA_MARK_GLYPH_POLYGON =
  "207 252 203.4 252 122.4 252 129.6 216 135 216 135 216 136.8 207 135 207 131.4 207 135 189 126 189 122.4 207 91.8 207 97.2 180 135 180 135 180 136.8 171 135 171 99 171 90 171 82.8 207 32.4 207 27 207 23.4 207 21.6 216 27 216 30.6 216 81 216 73.8 252 36 252 34.2 261 36 261 36 261 72 261 81 261 90 216 120.6 216 111.6 261 117 261 120.6 261 201.6 261 207 261 210.6 261 212.4 252 207 252";

/** 正常版：深色底板、白色字形；反色版两者对调。 */
export const FTA_MARK_DARK = "#333333";
export const FTA_MARK_LIGHT = "#FFFFFF";

/**
 * 标志的斜度：底板上边比下边往右偏 64.8 / 324，约 11.3°。
 * 色带分段和站号块按这个斜度切开。
 */
export const FTA_SLANT = 64.8 / 324;

export const FTA_OPERATORS = ["SUR", "NLRR", "MLR", "Lobby", "PUAT"] as const;
export type FtaOperator = (typeof FTA_OPERATORS)[number];

export const FTA_OPERATOR_LABEL: Readonly<Record<FtaOperator, string>> = {
  SUR: "生存铁路",
  NLRR: "北方大陆铁路",
  MLR: "大都会联贯铁路",
  Lobby: "大厅区域交通",
  PUAT: "蒲塘桥都市区域交通",
};

/** 标志下方的说明文字。 */
export const FTA_OPERATOR_CAPTION: Readonly<Record<FtaOperator, string>> = {
  SUR: "Survival Railroad",
  NLRR: "North Land Rail Road",
  MLR: "Metrolink Railroad",
  Lobby: "Lobby Transit",
  PUAT: "Pyutocor Urban Area Transit",
};

/**
 * 新线路的预设色：取 1.21 地图色板里区分度高的一组（档位 2，即基础色本身），
 * 所以矢量预览和游戏里的地图画颜色一致。
 */
export const FTA_LINE_PRESETS = [
  "#6699D8",
  "#D87F33",
  "#7FCC19",
  "#B24CD8",
  "#E5E533",
  "#334CB2",
  "#F27FA5",
  "#5CDBD5",
  "#993333",
  "#667F33",
  "#7F3FB2",
  "#4C7F99",
] as const;
