/**
 * 把一段界面短文本切成汉字、西文（字母与数字）和乘号三类片段，供 TypeText 分别排版。
 * 牌子上的文字走字体转路径，不经过这里。
 */
export type TypeRun = { kind: "cjk" | "latin" | "times" | "plain"; text: string };

const CJK = /[⺀-⿿　-〿぀-ヿ㐀-䶿一-鿿豈-﫿＀-￯]/u;
const LATIN = /[0-9A-Za-zÀ-ɏ]/u;

function kindOf(char: string): TypeRun["kind"] {
  if (char === "×") return "times";
  if (CJK.test(char)) return "cjk";
  if (LATIN.test(char)) return "latin";
  return "plain";
}

export function typeRuns(text: string): TypeRun[] {
  const runs: TypeRun[] = [];
  for (const char of text) {
    const kind = kindOf(char);
    const last = runs.at(-1);
    // 乘号各自成段；其余同类字符合并。
    if (last && last.kind === kind && kind !== "times") last.text += char;
    else runs.push({ kind, text: char });
  }
  return runs;
}

/** 中文与数字、西文之间加空格（与 Fetarute-Website 的文案习惯一致），用于 Intl 等生成的文本。 */
export function spaceMixedScript(text: string): string {
  return text
    .replace(/([㐀-鿿])([0-9A-Za-z])/gu, "$1 $2")
    .replace(/([0-9A-Za-z])([㐀-鿿])/gu, "$1 $2");
}
