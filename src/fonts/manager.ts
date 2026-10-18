import { parse, type Font } from "opentype.js";
import { reactive, ref } from "vue";
import { FONT_CATALOG, type FontId } from "./catalog";
import { OpentypeShaper } from "./shaper";

/**
 * 字体的下载、缓存与解析。
 * 下载过的字体存进浏览器的 Cache Storage，之后打开同样式的牌子直接从缓存读，不再提示；
 * 只有需要走网络下载时才弹出确认（由界面层调用 download 之前负责询问）。
 */

const CACHE_NAME = "fesgen-fonts-v1";

export type FontStatus = "missing" | "downloading" | "ready" | "error";

export interface FontProgress {
  status: FontStatus;
  loaded: number;
  total: number;
}

const fonts = new Map<FontId, Font>();

/** 每个字体的状态，界面直接读这个对象显示进度。 */
export const fontProgress = reactive(
  Object.fromEntries(
    Object.values(FONT_CATALOG).map((asset) => [
      asset.id,
      { status: "missing", loaded: 0, total: asset.approxBytes } satisfies FontProgress,
    ]),
  ) as Record<FontId, FontProgress>,
);

/** 字体集合每变化一次加一，依赖排版结果的计算属性据此重新计算。 */
export const fontsVersion = ref(0);

function parseFont(buffer: ArrayBuffer): Font {
  return parse(buffer, { lowMemory: true });
}

function register(id: FontId, buffer: ArrayBuffer) {
  fonts.set(id, parseFont(buffer));
  fontProgress[id] = { status: "ready", loaded: buffer.byteLength, total: buffer.byteLength };
  fontsVersion.value++;
}

async function openCache(): Promise<Cache | null> {
  try {
    return "caches" in globalThis ? await caches.open(CACHE_NAME) : null;
  } catch {
    return null;
  }
}

export function isFontLoaded(id: FontId): boolean {
  return fonts.has(id);
}

/** 尝试从缓存加载这些字体，返回仍然需要下载的那部分。 */
export async function loadCachedFonts(ids: readonly FontId[]): Promise<FontId[]> {
  const cache = await openCache();
  const missing: FontId[] = [];
  for (const id of ids) {
    if (fonts.has(id)) continue;
    const response = await cache?.match(FONT_CATALOG[id].url).catch(() => undefined);
    if (response) {
      try {
        register(id, await response.arrayBuffer());
        continue;
      } catch {
        // 缓存损坏就当作没有，重新下载。
        await cache?.delete(FONT_CATALOG[id].url);
      }
    }
    missing.push(id);
  }
  return missing;
}

async function fetchWithProgress(id: FontId): Promise<ArrayBuffer> {
  const asset = FONT_CATALOG[id];
  const response = await fetch(asset.url);
  if (!response.ok) {
    throw new Error(`${asset.label} 下载失败（HTTP ${response.status}）。`);
  }
  const total = Number(response.headers.get("content-length")) || asset.approxBytes;
  fontProgress[id] = { status: "downloading", loaded: 0, total };
  if (!response.body) {
    const buffer = await response.arrayBuffer();
    fontProgress[id] = { status: "downloading", loaded: buffer.byteLength, total };
    return buffer;
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.byteLength;
    fontProgress[id] = { status: "downloading", loaded, total: Math.max(total, loaded) };
  }
  const bytes = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes.buffer;
}

/** 下载并解析字体，同时写进缓存。任何一个失败都会抛错，已成功的保留。 */
export async function downloadFonts(ids: readonly FontId[]): Promise<void> {
  const cache = await openCache();
  const failures: string[] = [];
  await Promise.all(
    ids
      .filter((id) => !fonts.has(id))
      .map(async (id) => {
        try {
          const buffer = await fetchWithProgress(id);
          await cache
            ?.put(
              FONT_CATALOG[id].url,
              new Response(buffer.slice(0), { headers: { "content-type": "font/otf" } }),
            )
            .catch(() => undefined);
          register(id, buffer);
        } catch (error) {
          fontProgress[id] = { ...fontProgress[id], status: "error" };
          failures.push(error instanceof Error ? error.message : String(error));
        }
      }),
  );
  if (failures.length > 0) {
    throw new Error(failures.join(" "));
  }
}

/** 用当前已加载的字体排版；调用方保证所需字体都已就绪。 */
export function createShaper(): OpentypeShaper {
  return new OpentypeShaper(fonts);
}
