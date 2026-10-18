import type { MapGrid } from "./grid";

/**
 * ImageFrame 地图名称：只保留字母、数字、下划线和连字符，避免命令被空格截断。
 * 清洗后为空（例如全是汉字）时退回 fallback。
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

/**
 * 从牌子导出时的地图名：清洗后的牌子名加上牌子 id 的前 8 位。
 * 牌子名多半是汉字（清洗后为空），没改过名的牌子又都叫样式名（“FTA 车站牌”清洗后是 FTA），
 * 不加 id 的话不同的牌子会抢同一个地图名。
 */
export function signImageFrameName(name: string, signId: string): string {
  const base = sanitizeImageFrameName(name);
  const suffix = signId.replace(/[^A-Za-z0-9]/g, "").slice(0, 8);
  return suffix ? `${base}-${suffix}` : base;
}

/**
 * ImageFrame 的创建命令：/imageframe create <名称> <链接> <宽> <高>。
 * 宽、高的单位是地图张数，分别对应格子的列数和行数。
 */
export function imageFrameCreateCommand(name: string, url: string, grid: MapGrid): string {
  const link = url.trim() || "<图片链接>";
  return `/imageframe create ${sanitizeImageFrameName(name)} ${link} ${grid.columns} ${grid.rows}`;
}
