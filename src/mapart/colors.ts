/** 打包成 0xRRGGBB 的 sRGB 颜色，不含透明度。 */
export type Rgb = number;

/** CIELAB 坐标：[L, a, b]。 */
export type Lab = readonly [number, number, number];

export function packRgb(red: number, green: number, blue: number): Rgb {
  return ((red & 0xff) << 16) | ((green & 0xff) << 8) | (blue & 0xff);
}

export function unpackRgb(rgb: Rgb): [number, number, number] {
  return [(rgb >> 16) & 0xff, (rgb >> 8) & 0xff, rgb & 0xff];
}

export function rgbToHex(rgb: Rgb): string {
  return `#${rgb.toString(16).padStart(6, "0").toUpperCase()}`;
}

/** 解析 #RRGGBB；格式不对时返回 null，不猜测缩写或颜色名。 */
export function hexToRgb(hex: string): Rgb | null {
  return /^#[\da-f]{6}$/i.test(hex) ? Number.parseInt(hex.slice(1), 16) : null;
}

function linearize(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function labF(t: number): number {
  return t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116;
}

/**
 * sRGB（D65）换算到 CIELAB。
 * 公式与常数和 FetaruteTCAddon 的 PidsMapPalette 逐项一致，保证 FesGen 和站台屏对同一颜色选出同一个地图色。
 */
export function rgbToLab(rgb: Rgb): Lab {
  const [red, green, blue] = unpackRgb(rgb);
  const r = linearize(red);
  const g = linearize(green);
  const b = linearize(blue);
  const x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047;
  const y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
  const z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / 1.08883;
  const fx = labF(x);
  const fy = labF(y);
  const fz = labF(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

/** CIE76 色差的平方；只用来比较远近，省掉开方。 */
export function labDistanceSquared(a: Lab, b: Lab): number {
  const dl = a[0] - b[0];
  const da = a[1] - b[1];
  const db = a[2] - b[2];
  return dl * dl + da * da + db * db;
}
