import type { MapGrid } from "./grid";

/**
 * ImageFrame 地图名称：只保留字母、数字、下划线和连字符，避免命令被空格截断。
 * 清洗后为空（例如全是汉字）时退回 fallback；调用方应传一个每块牌子都不同的名字，
 * 否则不同的牌子会抢同一个地图名。
 */
export function sanitizeImageFrameName(name: string, fallback = "fesgen"): string {
  const cleaned = name
    .trim()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9_-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || fallback;
}

/** 牌子名清洗后为空时用的地图名：fesgen 加上牌子 id 的前 8 位，每块牌子都不同。 */
export function signImageFrameFallback(signId: string): string {
  const suffix = signId.replace(/[^A-Za-z0-9]/g, "").slice(0, 8);
  return suffix ? `fesgen-${suffix}` : "fesgen";
}

/**
 * ImageFrame 的创建命令：/imageframe create <名称> <链接> <宽> <高>。
 * 宽、高的单位是地图张数，分别对应格子的列数和行数。
 */
export function imageFrameCreateCommand(
  name: string,
  url: string,
  grid: MapGrid,
  fallback?: string,
): string {
  const link = url.trim() || "<图片链接>";
  return `/imageframe create ${sanitizeImageFrameName(name, fallback)} ${link} ${grid.columns} ${grid.rows}`;
}
