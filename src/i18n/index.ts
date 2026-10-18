import { zhHans, type Messages } from "./zh-Hans";

export type { Messages };

/** 当前界面语言的文案。目前只有简体中文；加语言时在这里按设置切换。 */
export const messages: Messages = zhHans;

/** 填充文案里的 {name} 占位符。 */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
