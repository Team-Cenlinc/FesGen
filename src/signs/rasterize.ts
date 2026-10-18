import { hexToRgb } from "@/mapart/colors";
import { isUnscaled, placeSource, type Placement } from "@/mapart/fit";
import { gridPixelSize, type MapGrid, type Size } from "@/mapart/grid";
import type { QuantizedMapArt, RgbaImage } from "@/mapart/quantize";
import { quantizeInWorker } from "@/mapart/quantizeClient";
import { renderTreeToSvg, type RenderTree, type SvgOptions } from "./render";
import type { Lighting, MapArtSettings, SignSize } from "./types";

/**
 * 牌子的光栅化。渲染树里只有几何图形，SVG 当作图片画进 canvas 时不需要任何字体，
 * 所以 PNG、JPG、缩略图和地图画都与预览一致。
 */

function loadSvgImage(svg: string): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("牌子渲染失败。"));
    };
    image.src = url;
  });
}

function context2d(size: Size): CanvasRenderingContext2D {
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext("2d", { willReadFrequently: true, colorSpace: "srgb" });
  if (!context) throw new Error("浏览器不支持 Canvas 2D。");
  return context;
}

/** 把牌子的某一层画进 target 画布的 placement 位置，可选留边填色。 */
async function drawSign(
  tree: RenderTree,
  options: SvgOptions,
  target: Size,
  placement: Placement,
  fill?: string,
): Promise<CanvasRenderingContext2D> {
  const image = await loadSvgImage(renderTreeToSvg(tree, options));
  const context = context2d(target);
  if (fill) {
    context.fillStyle = fill;
    context.fillRect(0, 0, target.width, target.height);
  }
  context.imageSmoothingEnabled = !isUnscaled(tree, placement);
  context.imageSmoothingQuality = "high";
  context.drawImage(image, placement.x, placement.y, placement.width, placement.height);
  return context;
}

function readPixels(context: CanvasRenderingContext2D): RgbaImage {
  const { width, height } = context.canvas;
  return { width, height, data: context.getImageData(0, 0, width, height).data };
}

/** 导出 PNG/JPG：按倍率放大渲染矢量，不是放大位图。JPG 没有透明，底下垫白色。 */
export async function signToBlob(
  tree: RenderTree,
  lighting: Lighting,
  scale: number,
  type: "image/png" | "image/jpeg",
  quality = 0.92,
): Promise<Blob> {
  const target = { width: Math.round(tree.width * scale), height: Math.round(tree.height * scale) };
  const context = await drawSign(
    tree,
    { lighting },
    target,
    { x: 0, y: 0, ...target },
    type === "image/jpeg" ? "#FFFFFF" : undefined,
  );
  return new Promise((resolve, reject) =>
    context.canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("图片编码失败。"))),
      type,
      quality,
    ),
  );
}

/** 作品库缩略图：宽 240 的 PNG data URL。 */
export async function signThumbnail(
  tree: RenderTree,
  lighting: Lighting,
  width = 240,
): Promise<string> {
  const height = Math.max(1, Math.round((tree.height / tree.width) * width));
  const context = await drawSign(
    tree,
    { lighting },
    { width, height },
    { x: 0, y: 0, width, height },
  );
  return context.canvas.toDataURL("image/png");
}

export interface SignMapArt extends QuantizedMapArt {
  grid: MapGrid;
}

/**
 * 牌子转地图画。
 * - 地图格尺寸直接按原尺寸量化；自由尺寸按设置缩放到目标格子，留边用牌子底色。
 * - 默认不带灯光（灯光的细腻渐变在地图色板里会变成一圈圈色带）。
 * - 打开“地图画应用灯光”时，背景层单独用抖动模拟渐变，文字、色带等内容层仍取最近色，保持清晰。
 */
export async function signToMapArt(
  tree: RenderTree,
  lighting: Lighting,
  size: SignSize,
  settings: MapArtSettings,
): Promise<SignMapArt> {
  const grid = size.mode === "grid" ? size.grid : settings.gridForFree;
  const target = gridPixelSize(grid);
  const placement =
    size.mode === "grid" ? { x: 0, y: 0, ...target } : placeSource(tree, target, settings.fit);
  const backdrop = hexToRgb(tree.backdrop) === null ? "#FFFFFF" : tree.backdrop;
  const withLighting = settings.applyLighting && lighting !== "none";

  if (!withLighting) {
    const full = readPixels(
      await drawSign(tree, { lighting: "none" }, target, placement, backdrop),
    );
    return { ...(await quantizeInWorker(full, "none")), grid };
  }

  const [full, background, content] = await Promise.all([
    drawSign(tree, { lighting }, target, placement, backdrop).then(readPixels),
    drawSign(tree, { lighting, layers: "background" }, target, placement, backdrop).then(
      readPixels,
    ),
    drawSign(tree, { lighting, layers: "content" }, target, placement).then(readPixels),
  ]);
  const [sharp, dithered] = await Promise.all([
    quantizeInWorker(full, "none"),
    quantizeInWorker(background, "floyd-steinberg"),
  ]);

  // 内容层不透明的地方用清晰的最近色，其余（背景和留边）用抖动后的背景。
  const data = new Uint8ClampedArray(sharp.image.data.length);
  const codes = new Uint8Array(sharp.codes.length);
  const used = new Set<number>();
  for (let i = 0; i < codes.length; i++) {
    const source = content.data[i * 4 + 3]! >= 128 ? sharp : dithered;
    data.set(source.image.data.subarray(i * 4, i * 4 + 4), i * 4);
    codes[i] = source.codes[i]!;
    if (codes[i] !== 0) used.add(codes[i]!);
  }
  return {
    image: { width: target.width, height: target.height, data },
    codes,
    colorsUsed: used.size,
    transparentPixels: codes.filter((code) => code === 0).length,
    grid,
  };
}
