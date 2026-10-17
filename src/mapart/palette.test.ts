import { describe, expect, it } from "vitest";
import { MAP_BASE_COLORS, MapPalette, shadeRgb } from "./palette";

describe("地图色板", () => {
  const palette = MapPalette.minecraft();

  it("61 种基础色 × 4 档亮度", () => {
    expect(MAP_BASE_COLORS).toHaveLength(61);
    expect(MAP_BASE_COLORS.map((color) => color.id)).toEqual(
      Array.from({ length: 61 }, (_, i) => i + 1),
    );
    expect(palette.colors).toHaveLength(244);
  });

  it("档位亮度按 floor(通道 × 系数 / 255) 计算", () => {
    // minecraft.wiki 的示例：GRASS 0 档为 (89, 125, 39)。
    expect(shadeRgb(0x7fb238, 0)).toBe((89 << 16) | (125 << 8) | 39);
    expect(shadeRgb(0x7fb238, 2)).toBe(0x7fb238);
    expect(shadeRgb(0xffffff, 1)).toBe(0xdcdcdc);
    expect(shadeRgb(0xffffff, 3)).toBe(0x878787);
  });

  it("颜色字节为 4 × 编号 + 档位", () => {
    expect(palette.byCode(4 * 8 + 2)?.rgb).toBe(0xffffff);
    expect(palette.byCode(4 * 29 + 2)?.base.name).toBe("COLOR_BLACK");
    expect(palette.byCode(0)).toBeUndefined();
  });

  it("色板里的每个颜色都原样命中", () => {
    for (const color of palette.colors) {
      expect(palette.nearest(color.rgb).rgb).toBe(color.rgb);
    }
  });

  it("不在色板上的颜色取最近色", () => {
    expect(palette.nearest(0xfefefe).rgb).toBe(0xffffff);
    expect(palette.nearest(0x010101).base.name).toBe("COLOR_BLACK");
  });

  it("只要部分档位时只生成对应颜色", () => {
    const flat = MapPalette.minecraft([1]);
    expect(flat.colors).toHaveLength(61);
    expect(flat.colors.every((color) => color.shade === 1)).toBe(true);
  });
});
