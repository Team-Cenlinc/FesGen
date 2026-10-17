/**
 * 字体编号与字体链。这里不引用任何字体文件，排版函数和单元测试可以直接用。
 */
export type FontId =
  | "noto-sans-jp-400"
  | "noto-sans-jp-700"
  | "noto-sans-sc-400"
  | "noto-sans-sc-700"
  | "noto-sans-tc-400"
  | "noto-sans-tc-700"
  | "tex-gyre-heros-400"
  | "tex-gyre-heros-700";

/** 一条字体链：第一个是主字体，后面是缺字时依次尝试的补字字体。 */
export type FontStack = readonly FontId[];

/**
 * 每个主字体的补字顺序。日文字体缺的多是简体字形，所以先简体再繁体；
 * 西文字体遇到汉字时先交给同粗细的日文字体，再走中文补字。
 */
export const FALLBACKS: Readonly<Record<FontId, readonly FontId[]>> = {
  "noto-sans-jp-400": ["noto-sans-sc-400", "noto-sans-tc-400"],
  "noto-sans-jp-700": ["noto-sans-sc-700", "noto-sans-tc-700"],
  "noto-sans-sc-400": ["noto-sans-tc-400", "noto-sans-jp-400"],
  "noto-sans-sc-700": ["noto-sans-tc-700", "noto-sans-jp-700"],
  "noto-sans-tc-400": ["noto-sans-sc-400", "noto-sans-jp-400"],
  "noto-sans-tc-700": ["noto-sans-sc-700", "noto-sans-jp-700"],
  "tex-gyre-heros-400": ["noto-sans-jp-400", "noto-sans-sc-400", "noto-sans-tc-400"],
  "tex-gyre-heros-700": ["noto-sans-jp-700", "noto-sans-sc-700", "noto-sans-tc-700"],
};

/** 主字体加上它的补字字体。 */
export function fontStack(primary: FontId): FontStack {
  return [primary, ...FALLBACKS[primary]];
}
