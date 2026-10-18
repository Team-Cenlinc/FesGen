import { packRgb } from "./colors";
import type { MapColor, MapPalette } from "./palette";

/** 与 ImageData 同形的 RGBA 位图（非预乘），便于在 Worker 和测试里脱离 DOM 使用。 */
export interface RgbaImage {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

export type DitherMode = "none" | "floyd-steinberg";

export interface QuantizeOptions {
  dither?: DitherMode;
  /** 透明度低于这个值的像素当作透明，对应地图上的 0 号透明色。 */
  alphaThreshold?: number;
}

export interface QuantizedMapArt {
  /** 每个像素都已是色板色（透明像素为全 0）的位图，直接编码成 PNG 交给 ImageFrame。 */
  image: RgbaImage;
  /** 每个像素的地图颜色字节，透明为 0；行优先。 */
  codes: Uint8Array;
  colorsUsed: number;
  transparentPixels: number;
}

const DEFAULT_ALPHA_THRESHOLD = 128;

/**
 * 把位图换成地图色板里的颜色。
 * 色板里本来就有的颜色原样保留；抖动的误差也只会来自不在色板上的颜色，
 * 所以已经量化过的图再量化一次结果不变——这是“预览即游戏内效果”的前提。
 */
export function quantize(
  source: RgbaImage,
  palette: MapPalette,
  options: QuantizeOptions = {},
): QuantizedMapArt {
  const { width, height, data } = source;
  const alphaThreshold = options.alphaThreshold ?? DEFAULT_ALPHA_THRESHOLD;
  const pixelCount = width * height;
  const out = new Uint8ClampedArray(pixelCount * 4);
  const codes = new Uint8Array(pixelCount);
  const used = new Set<number>();
  let transparentPixels = 0;

  const opaque = (index: number) => data[index * 4 + 3]! >= alphaThreshold;

  const write = (index: number, color: MapColor) => {
    const offset = index * 4;
    out[offset] = (color.rgb >> 16) & 0xff;
    out[offset + 1] = (color.rgb >> 8) & 0xff;
    out[offset + 2] = color.rgb & 0xff;
    out[offset + 3] = 255;
    codes[index] = color.code;
    used.add(color.code);
  };

  if (options.dither === "floyd-steinberg") {
    // 误差在 sRGB 通道上扩散，只扩散到不透明的邻居，避免把颜色“漏”进透明区域。
    const work = new Float32Array(pixelCount * 3);
    for (let i = 0; i < pixelCount; i++) {
      work[i * 3] = data[i * 4]!;
      work[i * 3 + 1] = data[i * 4 + 1]!;
      work[i * 3 + 2] = data[i * 4 + 2]!;
    }

    const spread = (x: number, y: number, er: number, eg: number, eb: number, weight: number) => {
      if (x < 0 || x >= width || y >= height) return;
      const index = y * width + x;
      if (!opaque(index)) return;
      work[index * 3] = work[index * 3]! + er * weight;
      work[index * 3 + 1] = work[index * 3 + 1]! + eg * weight;
      work[index * 3 + 2] = work[index * 3 + 2]! + eb * weight;
    };

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        if (!opaque(index)) {
          transparentPixels++;
          continue;
        }
        const r = work[index * 3]!;
        const g = work[index * 3 + 1]!;
        const b = work[index * 3 + 2]!;
        const color = palette.nearest(packRgb(clampChannel(r), clampChannel(g), clampChannel(b)));
        write(index, color);
        const er = r - ((color.rgb >> 16) & 0xff);
        const eg = g - ((color.rgb >> 8) & 0xff);
        const eb = b - (color.rgb & 0xff);
        if (er === 0 && eg === 0 && eb === 0) continue;
        spread(x + 1, y, er, eg, eb, 7 / 16);
        spread(x - 1, y + 1, er, eg, eb, 3 / 16);
        spread(x, y + 1, er, eg, eb, 5 / 16);
        spread(x + 1, y + 1, er, eg, eb, 1 / 16);
      }
    }
  } else {
    for (let index = 0; index < pixelCount; index++) {
      if (!opaque(index)) {
        transparentPixels++;
        continue;
      }
      const offset = index * 4;
      write(index, palette.nearest(packRgb(data[offset]!, data[offset + 1]!, data[offset + 2]!)));
    }
  }

  return {
    image: { width, height, data: out },
    codes,
    colorsUsed: used.size,
    transparentPixels,
  };
}

function clampChannel(value: number): number {
  return Math.min(255, Math.max(0, Math.round(value)));
}
