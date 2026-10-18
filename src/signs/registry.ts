import { gridPixelSize, type Size } from "@/mapart/grid";
import { ftaStationStyle } from "./fta/station";
import { kitajukuStyle } from "./kitajuku";
import type { SignSize, SignStyle, SignStyleId } from "./types";

/** 所有已实现的样式。加新样式时在这里登记，其余代码只认这张表。 */
export const SIGN_STYLES: Readonly<Record<SignStyleId, SignStyle<unknown>>> = {
  "kitajuku-dentetsu": kitajukuStyle as SignStyle<unknown>,
  "FTA-station": ftaStationStyle as SignStyle<unknown>,
};

export function isSignStyleId(value: unknown): value is SignStyleId {
  return typeof value === "string" && value in SIGN_STYLES;
}

export function getSignStyle(id: SignStyleId): SignStyle<unknown> {
  return SIGN_STYLES[id];
}

/** 牌子尺寸换算成像素。 */
export function signPixelSize(size: SignSize): Size {
  return size.mode === "grid"
    ? gridPixelSize(size.grid)
    : { width: size.width, height: size.height };
}

export const MIN_FREE_SIDE = 16;
export const MAX_FREE_SIDE = 4096;
