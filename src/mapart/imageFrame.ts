import type { MapGrid } from "./grid";

/**
 * ImageFrame 地图名称：只保留字母、数字、下划线和连字符，避免命令被空格截断。
 * 清洗后为空时退回 fesgen。
 */
export function sanitizeImageFrameName(name: string): string {
  const cleaned = name
    .trim()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9_-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || "fesgen";
}

/**
 * ImageFrame 的创建命令：/imageframe create <名称> <链接> <宽> <高>。
 * 宽、高的单位是地图张数，分别对应格子的列数和行数。
 */
export function imageFrameCreateCommand(name: string, url: string, grid: MapGrid): string {
  const link = url.trim() || "<图片链接>";
  return `/imageframe create ${sanitizeImageFrameName(name)} ${link} ${grid.columns} ${grid.rows}`;
}
