import type { FontId } from "@/fonts/stacks";

/**
 * FTA 牌子的字体：西文和数字用 Noto Sans Display，汉字交给同粗细的 Noto Sans SC（见 stacks.ts 的补字顺序）。
 * 和 Fetarute 官网的 FTA 导视一致。
 */
export const FTA_FONT = {
  /** 站名：800。 */
  name: "noto-sans-display-800",
  /** 站号、线路主名：700。 */
  strong: "noto-sans-display-700",
  /** 第二语言、Logo 说明文字：500。 */
  regular: "noto-sans-display-500",
  /** 站名斜体时的第二语言。 */
  italic: "noto-sans-display-500-italic",
} as const satisfies Record<string, FontId>;

/** 一块 FTA 牌子需要的字体。斜体只在打开“站名斜体”时才要下载。 */
export function ftaFonts(italic: boolean): FontId[] {
  const fonts: FontId[] = [
    FTA_FONT.name,
    FTA_FONT.strong,
    FTA_FONT.regular,
    "noto-sans-sc-800",
    "noto-sans-sc-700",
  ];
  if (italic) fonts.push(FTA_FONT.italic);
  return fonts;
}
