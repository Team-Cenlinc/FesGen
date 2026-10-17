import type { Font } from "opentype.js";
import type { FontId, FontStack } from "./stacks";

/** 文字的水平对齐基准点，含义同 SVG 的 text-anchor。 */
export type TextAnchor = "start" | "middle" | "end";

export interface ShapedText {
  /** 已经按字形转好的 SVG 路径数据。 */
  d: string;
  /** 按字距和前进宽度算出的排版宽度。 */
  width: number;
  /** 实际落笔的位置，便于选中框和调试。 */
  x: number;
  y: number;
  /** 整条字体链里（已加载的字体）都找不到的字符，会画成主字体的缺字框。 */
  missing: string[];
}

/**
 * 排版用的文字测量与转路径接口。排版函数只依赖这个接口，
 * 单元测试可以换成等宽的假实现，不必加载几 MB 的字体。
 */
export interface TextShaper {
  measure(stack: FontStack, text: string, size: number): number;
  shape(
    stack: FontStack,
    text: string,
    size: number,
    x: number,
    y: number,
    anchor?: TextAnchor,
  ): ShapedText;
}

interface Run {
  font: Font;
  text: string;
}

/**
 * 基于 opentype.js 的实现。逐字挑字体：主字体有就用主字体，否则用链上第一个已加载且有这个字的补字字体；
 * 同一字体的连续字符合成一段排版，段内保留字距。还没下载的补字字体直接跳过。
 */
export class OpentypeShaper implements TextShaper {
  constructor(private readonly fonts: ReadonlyMap<FontId, Font>) {}

  private runs(stack: FontStack, text: string): { runs: Run[]; missing: string[] } {
    const loaded = stack.map((id) => this.fonts.get(id)).filter((font): font is Font => !!font);
    const primary = loaded[0];
    if (!primary) {
      throw new Error(`字体 ${stack[0]} 尚未加载。`);
    }
    const runs: Run[] = [];
    const missing = new Set<string>();
    for (const char of text) {
      const previous = runs.at(-1);
      let font: Font;
      if (/\s/.test(char)) {
        // 空白沿用前一段的字体，避免无谓地切段。
        font = previous?.font ?? primary;
      } else {
        const found = loaded.find((candidate) => candidate.charToGlyphIndex(char) !== 0);
        if (!found) missing.add(char);
        font = found ?? primary;
      }
      if (previous && previous.font === font) previous.text += char;
      else runs.push({ font, text: char });
    }
    return { runs, missing: [...missing] };
  }

  measure(stack: FontStack, text: string, size: number): number {
    if (!text) return 0;
    return this.runs(stack, text).runs.reduce(
      (sum, run) => sum + run.font.getAdvanceWidth(run.text, size, { kerning: true }),
      0,
    );
  }

  shape(
    stack: FontStack,
    text: string,
    size: number,
    x: number,
    y: number,
    anchor: TextAnchor = "start",
  ): ShapedText {
    if (!text) return { d: "", width: 0, x, y, missing: [] };
    const { runs, missing } = this.runs(stack, text);
    const widths = runs.map((run) => run.font.getAdvanceWidth(run.text, size, { kerning: true }));
    const width = widths.reduce((sum, value) => sum + value, 0);
    const startX = anchor === "start" ? x : anchor === "middle" ? x - width / 2 : x - width;
    let cursor = startX;
    const parts: string[] = [];
    runs.forEach((run, index) => {
      parts.push(run.font.getPath(run.text, cursor, y, size, { kerning: true }).toPathData(2));
      cursor += widths[index]!;
    });
    return { d: parts.join(""), width, x: startX, y, missing };
  }
}
