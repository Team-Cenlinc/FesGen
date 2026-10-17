import { labDistanceSquared, rgbToLab, type Lab, type Rgb } from "./colors";

/** 一张地图的边长（像素）。 */
export const MAP_TILE_SIZE = 128;

/** 地图基础色：id 即游戏内 MapColor 的编号，0 号为透明，不在此列。 */
export interface MapBaseColor {
  id: number;
  name: string;
  rgb: Rgb;
}

/**
 * Java 版 1.21 的地图基础色（1–61 号）。
 * 数据来源：https://minecraft.wiki/w/Map_item_format ，与服务器 Paper 1.21.10 一致。
 */
export const MAP_BASE_COLORS: readonly MapBaseColor[] = [
  { id: 1, name: "GRASS", rgb: 0x7fb238 },
  { id: 2, name: "SAND", rgb: 0xf7e9a3 },
  { id: 3, name: "WOOL", rgb: 0xc7c7c7 },
  { id: 4, name: "FIRE", rgb: 0xff0000 },
  { id: 5, name: "ICE", rgb: 0xa0a0ff },
  { id: 6, name: "METAL", rgb: 0xa7a7a7 },
  { id: 7, name: "PLANT", rgb: 0x007c00 },
  { id: 8, name: "SNOW", rgb: 0xffffff },
  { id: 9, name: "CLAY", rgb: 0xa4a8b8 },
  { id: 10, name: "DIRT", rgb: 0x976d4d },
  { id: 11, name: "STONE", rgb: 0x707070 },
  { id: 12, name: "WATER", rgb: 0x4040ff },
  { id: 13, name: "WOOD", rgb: 0x8f7748 },
  { id: 14, name: "QUARTZ", rgb: 0xfffcf5 },
  { id: 15, name: "COLOR_ORANGE", rgb: 0xd87f33 },
  { id: 16, name: "COLOR_MAGENTA", rgb: 0xb24cd8 },
  { id: 17, name: "COLOR_LIGHT_BLUE", rgb: 0x6699d8 },
  { id: 18, name: "COLOR_YELLOW", rgb: 0xe5e533 },
  { id: 19, name: "COLOR_LIGHT_GREEN", rgb: 0x7fcc19 },
  { id: 20, name: "COLOR_PINK", rgb: 0xf27fa5 },
  { id: 21, name: "COLOR_GRAY", rgb: 0x4c4c4c },
  { id: 22, name: "COLOR_LIGHT_GRAY", rgb: 0x999999 },
  { id: 23, name: "COLOR_CYAN", rgb: 0x4c7f99 },
  { id: 24, name: "COLOR_PURPLE", rgb: 0x7f3fb2 },
  { id: 25, name: "COLOR_BLUE", rgb: 0x334cb2 },
  { id: 26, name: "COLOR_BROWN", rgb: 0x664c33 },
  { id: 27, name: "COLOR_GREEN", rgb: 0x667f33 },
  { id: 28, name: "COLOR_RED", rgb: 0x993333 },
  { id: 29, name: "COLOR_BLACK", rgb: 0x191919 },
  { id: 30, name: "GOLD", rgb: 0xfaee4d },
  { id: 31, name: "DIAMOND", rgb: 0x5cdbd5 },
  { id: 32, name: "LAPIS", rgb: 0x4a80ff },
  { id: 33, name: "EMERALD", rgb: 0x00d93a },
  { id: 34, name: "PODZOL", rgb: 0x815631 },
  { id: 35, name: "NETHER", rgb: 0x700200 },
  { id: 36, name: "TERRACOTTA_WHITE", rgb: 0xd1b1a1 },
  { id: 37, name: "TERRACOTTA_ORANGE", rgb: 0x9f5224 },
  { id: 38, name: "TERRACOTTA_MAGENTA", rgb: 0x95576c },
  { id: 39, name: "TERRACOTTA_LIGHT_BLUE", rgb: 0x706c8a },
  { id: 40, name: "TERRACOTTA_YELLOW", rgb: 0xba8524 },
  { id: 41, name: "TERRACOTTA_LIGHT_GREEN", rgb: 0x677535 },
  { id: 42, name: "TERRACOTTA_PINK", rgb: 0xa04d4e },
  { id: 43, name: "TERRACOTTA_GRAY", rgb: 0x392923 },
  { id: 44, name: "TERRACOTTA_LIGHT_GRAY", rgb: 0x876b62 },
  { id: 45, name: "TERRACOTTA_CYAN", rgb: 0x575c5c },
  { id: 46, name: "TERRACOTTA_PURPLE", rgb: 0x7a4958 },
  { id: 47, name: "TERRACOTTA_BLUE", rgb: 0x4c3e5c },
  { id: 48, name: "TERRACOTTA_BROWN", rgb: 0x4c3223 },
  { id: 49, name: "TERRACOTTA_GREEN", rgb: 0x4c522a },
  { id: 50, name: "TERRACOTTA_RED", rgb: 0x8e3c2e },
  { id: 51, name: "TERRACOTTA_BLACK", rgb: 0x251610 },
  { id: 52, name: "CRIMSON_NYLIUM", rgb: 0xbd3031 },
  { id: 53, name: "CRIMSON_STEM", rgb: 0x943f61 },
  { id: 54, name: "CRIMSON_HYPHAE", rgb: 0x5c191d },
  { id: 55, name: "WARPED_NYLIUM", rgb: 0x167e86 },
  { id: 56, name: "WARPED_STEM", rgb: 0x3a8e8c },
  { id: 57, name: "WARPED_HYPHAE", rgb: 0x562c3e },
  { id: 58, name: "WARPED_WART_BLOCK", rgb: 0x14b485 },
  { id: 59, name: "DEEPSLATE", rgb: 0x646464 },
  { id: 60, name: "RAW_IRON", rgb: 0xd8af93 },
  { id: 61, name: "GLOW_LICHEN", rgb: 0x7fa796 },
];

/** 亮度档位：0 偏暗、1 平铺、2 最亮、3 最暗（生存里搭不出，插件可以直接写）。 */
export type MapShade = 0 | 1 | 2 | 3;

/** 各档位的亮度系数，下标即档位编号。 */
export const MAP_SHADE_MULTIPLIERS: readonly [number, number, number, number] = [
  180, 220, 255, 135,
];

/** ImageFrame 这类插件直接写地图数据，4 档亮度都能用。 */
export const ALL_MAP_SHADES: readonly MapShade[] = [0, 1, 2, 3];

/** 色板里的一个可用颜色。 */
export interface MapColor {
  /** 地图颜色字节：4 × 基础色编号 + 档位。 */
  code: number;
  base: MapBaseColor;
  shade: MapShade;
  rgb: Rgb;
  lab: Lab;
}

/** 游戏对每个通道的计算：floor(通道 × 系数 / 255)。 */
export function shadeRgb(rgb: Rgb, shade: MapShade): Rgb {
  const multiplier = MAP_SHADE_MULTIPLIERS[shade];
  const red = Math.floor((((rgb >> 16) & 0xff) * multiplier) / 255);
  const green = Math.floor((((rgb >> 8) & 0xff) * multiplier) / 255);
  const blue = Math.floor(((rgb & 0xff) * multiplier) / 255);
  return (red << 16) | (green << 8) | blue;
}

/** 一套可查最近色的地图色板。 */
export class MapPalette {
  readonly colors: readonly MapColor[];
  private readonly byCodeTable = new Map<number, MapColor>();
  private readonly nearestCache = new Map<Rgb, MapColor>();

  constructor(colors: readonly MapColor[]) {
    if (colors.length === 0) {
      throw new Error("地图色板不能为空。");
    }
    this.colors = colors;
    for (const color of colors) {
      this.byCodeTable.set(color.code, color);
    }
  }

  /** Java 版 1.21 色板，默认包含全部 4 档亮度。 */
  static minecraft(shades: readonly MapShade[] = ALL_MAP_SHADES): MapPalette {
    const colors: MapColor[] = [];
    for (const base of MAP_BASE_COLORS) {
      for (const shade of shades) {
        const rgb = shadeRgb(base.rgb, shade);
        colors.push({ code: base.id * 4 + shade, base, shade, rgb, lab: rgbToLab(rgb) });
      }
    }
    return new MapPalette(colors);
  }

  byCode(code: number): MapColor | undefined {
    return this.byCodeTable.get(code);
  }

  /** 按 CIE76 色差取最近的地图色；色板里已有的颜色原样命中。结果按 RGB 缓存。 */
  nearest(rgb: Rgb): MapColor {
    const cached = this.nearestCache.get(rgb);
    if (cached) {
      return cached;
    }
    const target = rgbToLab(rgb);
    let best = this.colors[0]!;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const color of this.colors) {
      const distance = labDistanceSquared(target, color.lab);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = color;
      }
    }
    this.nearestCache.set(rgb, best);
    return best;
  }
}
