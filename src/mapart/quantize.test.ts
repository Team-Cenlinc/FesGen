import { describe, expect, it } from "vitest";
import { MapPalette } from "./palette";
import { quantize, type RgbaImage } from "./quantize";

const palette = MapPalette.minecraft();

function imageFrom(
  width: number,
  height: number,
  pixel: (x: number, y: number) => number[],
): RgbaImage {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      data.set(pixel(x, y), (y * width + x) * 4);
    }
  }
  return { width, height, data };
}

/** 一张颜色随位置渐变、带一圈透明边的测试图。 */
const gradient = imageFrom(32, 16, (x, y) => [
  x * 8,
  y * 16,
  255 - x * 4,
  x === 0 || y === 0 ? 0 : 255,
]);

describe("量化", () => {
  for (const dither of ["none", "floyd-steinberg"] as const) {
    it(`${dither}：输出的每个像素都是色板色或透明`, () => {
      const result = quantize(gradient, palette, { dither });
      const { data } = result.image;
      for (let i = 0; i < result.codes.length; i++) {
        const code = result.codes[i]!;
        if (code === 0) {
          expect(data[i * 4 + 3]).toBe(0);
          continue;
        }
        const color = palette.byCode(code)!;
        expect([data[i * 4], data[i * 4 + 1], data[i * 4 + 2], data[i * 4 + 3]]).toEqual([
          (color.rgb >> 16) & 0xff,
          (color.rgb >> 8) & 0xff,
          color.rgb & 0xff,
          255,
        ]);
      }
    });

    it(`${dither}：已量化的图再量化一次结果不变`, () => {
      const once = quantize(gradient, palette, { dither });
      const twice = quantize(once.image, palette, { dither });
      expect(twice.codes).toEqual(once.codes);
      expect(twice.image.data).toEqual(once.image.data);
    });
  }

  it("透明阈值以下的像素记为 0 号透明色", () => {
    const result = quantize(gradient, palette);
    expect(result.transparentPixels).toBe(32 + 16 - 1);
    expect(result.codes[0]).toBe(0);
  });

  it("统计用到的颜色数", () => {
    const solid = imageFrom(4, 4, () => [255, 255, 255, 255]);
    expect(quantize(solid, palette).colorsUsed).toBe(1);
  });

  it("抖动能用色板色混出更接近的平均色", () => {
    // #808080 不在色板上；抖动后整体平均值应比最近色更接近原色。
    const gray = imageFrom(32, 32, () => [128, 128, 128, 255]);
    const average = (image: RgbaImage) => {
      let sum = 0;
      for (let i = 0; i < image.width * image.height; i++) sum += image.data[i * 4]!;
      return sum / (image.width * image.height);
    };
    const plain = average(quantize(gray, palette).image);
    const dithered = average(quantize(gray, palette, { dither: "floyd-steinberg" }).image);
    expect(Math.abs(dithered - 128)).toBeLessThanOrEqual(Math.abs(plain - 128));
  });
});
