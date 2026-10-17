import type { Size } from "./grid";

/** 自由尺寸缩放到地图格子时的适配方式，含义与 CSS object-fit 相同。 */
export type FitMode = "contain" | "cover" | "stretch";

/** 源图在目标画布上的落点；裁切模式下可以超出画布，由画布自然裁掉。 */
export interface Placement {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 计算源图放进目标画布的位置。结果取整到像素，
 * 这样尺寸相同时落点正好是 (0, 0, 原宽, 原高)，绘制不会发生任何重采样。
 */
export function placeSource(source: Size, target: Size, mode: FitMode): Placement {
  if (mode === "stretch") {
    return { x: 0, y: 0, width: target.width, height: target.height };
  }
  const scaleX = target.width / source.width;
  const scaleY = target.height / source.height;
  const scale = mode === "contain" ? Math.min(scaleX, scaleY) : Math.max(scaleX, scaleY);
  const width = Math.round(source.width * scale);
  const height = Math.round(source.height * scale);
  return {
    x: Math.round((target.width - width) / 2),
    y: Math.round((target.height - height) / 2),
    width,
    height,
  };
}

/** 落点是否完全没有缩放（只可能有平移）。 */
export function isUnscaled(source: Size, placement: Placement): boolean {
  return placement.width === source.width && placement.height === source.height;
}
