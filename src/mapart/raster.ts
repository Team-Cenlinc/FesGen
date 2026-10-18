import { packRgb, type Rgb } from "./colors";
import type { Placement } from "./fit";
import type { Size } from "./grid";
import type { RgbaImage } from "./quantize";

/** 留边区域的填充方式。 */
export type Padding = { kind: "transparent" } | { kind: "color"; rgb: Rgb };

/**
 * 解码图片文件。关闭色彩空间转换和预乘，保证读出来的像素就是文件里的原值；
 * 否则带 ICC 配置的 PNG 会被浏览器悄悄换色，已经量化好的图也会偏离色板。
 */
export function decodeImage(file: Blob): Promise<ImageBitmap> {
  return createImageBitmap(file, { colorSpaceConversion: "none", premultiplyAlpha: "none" });
}

function createContext(size: Size): CanvasRenderingContext2D {
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext("2d", { willReadFrequently: true, colorSpace: "srgb" });
  if (!context) {
    throw new Error("浏览器不支持 Canvas 2D。");
  }
  return context;
}

/** 把源图按落点画进目标尺寸的画布，读出 RGBA 像素。尺寸没变时关闭平滑，像素原样拷贝。 */
export function rasterize(
  source: ImageBitmap,
  target: Size,
  placement: Placement,
  padding: Padding,
): RgbaImage {
  const context = createContext(target);
  if (padding.kind === "color") {
    context.fillStyle = `#${padding.rgb.toString(16).padStart(6, "0")}`;
    context.fillRect(0, 0, target.width, target.height);
  }
  const unscaled = placement.width === source.width && placement.height === source.height;
  context.imageSmoothingEnabled = !unscaled;
  context.imageSmoothingQuality = "high";
  context.drawImage(source, placement.x, placement.y, placement.width, placement.height);
  const { data } = context.getImageData(0, 0, target.width, target.height);
  return { width: target.width, height: target.height, data };
}

/** 读取源图左上角的颜色，作为留边颜色的默认值（牌子的左上角通常就是背景色）。 */
export function sampleCornerColor(source: ImageBitmap): Rgb {
  const context = createContext({ width: 1, height: 1 });
  context.drawImage(source, 0, 0, 1, 1, 0, 0, 1, 1);
  const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
  return packRgb(red ?? 255, green ?? 255, blue ?? 255);
}

/** 把位图画到可见画布上（预览用）。 */
export function paintImage(canvas: HTMLCanvasElement, image: RgbaImage): void {
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d");
  if (!context) return;
  const imageData = new ImageData(new Uint8ClampedArray(image.data), image.width, image.height);
  context.putImageData(imageData, 0, 0);
}

/** 编码成 PNG。PNG 无损，色板色写进去读出来仍是原值。 */
export function encodePng(image: RgbaImage): Promise<Blob> {
  const canvas = document.createElement("canvas");
  paintImage(canvas, image);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("PNG 编码失败。"))),
      "image/png",
    );
  });
}
