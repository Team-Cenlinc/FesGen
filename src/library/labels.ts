import { gridLabel } from "@/mapart/grid";
import { getSignStyle } from "@/signs/registry";
import { spaceMixedScript } from "@/utils/typeset";
import type { SignDocument, SignSize } from "@/signs/types";

export function sizeLabel(size: SignSize): string {
  return size.mode === "grid"
    ? `${gridLabel(size.grid)} 地图格`
    : `${size.width} × ${size.height} px`;
}

const relative = new Intl.RelativeTimeFormat("zh-Hans", { numeric: "auto" });

/** “刚刚”“3 分钟前”“昨天”这样的相对时间。 */
export function relativeTime(timestamp: number, now = Date.now()): string {
  const seconds = Math.round((timestamp - now) / 1000);
  if (Math.abs(seconds) < 45) return "刚刚";
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["minute", 60],
    ["hour", 3600],
    ["day", 86400],
    ["month", 2592000],
    ["year", 31536000],
  ];
  let unit: Intl.RelativeTimeFormatUnit = "minute";
  let divisor = 60;
  for (const [candidate, size] of units) {
    if (Math.abs(seconds) >= size) {
      unit = candidate;
      divisor = size;
    }
  }
  // Intl 输出“36分钟前”，按界面文案习惯在数字和汉字之间补空格。
  return spaceMixedScript(relative.format(Math.round(seconds / divisor), unit));
}

export function signMeta(sign: SignDocument): string {
  return `${getSignStyle(sign.style).label} · ${sizeLabel(sign.size)}`;
}
