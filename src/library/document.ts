import { clampGridSide, type MapGrid } from "@/mapart/grid";
import { getSignStyle, isSignStyleId, MAX_FREE_SIDE, MIN_FREE_SIDE } from "@/signs/registry";
import type {
  Lighting,
  MapArtSettings,
  ModuleTweak,
  SignDocument,
  SignSize,
  SignStyleId,
} from "@/signs/types";
import { asBoolean, asChoice, asNumber, asRecord, asString } from "@/signs/values";

export const DEFAULT_MAP_ART: MapArtSettings = {
  gridForFree: { rows: 1, columns: 3 },
  fit: "contain",
  applyLighting: false,
};

function newId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `sign-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  );
}

/** 新建一块牌子：样式默认内容、默认尺寸，名字取本站名。 */
export function createSign(styleId: SignStyleId, now = Date.now()): SignDocument {
  const style = getSignStyle(styleId);
  return {
    id: newId(),
    name: style.label,
    style: styleId,
    size: structuredClone(style.defaultSize),
    lighting: "fluore",
    content: style.defaults(),
    tweaks: {},
    mapArt: structuredClone(DEFAULT_MAP_ART),
    createdAt: now,
    updatedAt: now,
  };
}

/** 复制一块牌子。传进来的可能是作品库里的响应式对象，用 JSON 往返拷贝以穿透代理。 */
export function duplicateSign(sign: SignDocument, now = Date.now()): SignDocument {
  return {
    ...(JSON.parse(JSON.stringify(sign)) as SignDocument),
    id: newId(),
    name: `${sign.name} 副本`,
    createdAt: now,
    updatedAt: now,
  };
}

function normalizeGrid(raw: unknown, fallback: MapGrid): MapGrid {
  const value = asRecord(raw);
  return {
    rows: clampGridSide(asNumber(value.rows, fallback.rows, 1, 16)),
    columns: clampGridSide(asNumber(value.columns, fallback.columns, 1, 16)),
  };
}

export function normalizeSize(raw: unknown, fallback: SignSize): SignSize {
  const value = asRecord(raw);
  if (value.mode === "grid") {
    return {
      mode: "grid",
      grid: normalizeGrid(
        value.grid,
        fallback.mode === "grid" ? fallback.grid : { rows: 1, columns: 3 },
      ),
    };
  }
  if (value.mode === "free") {
    return {
      mode: "free",
      width: Math.round(asNumber(value.width, 600, MIN_FREE_SIDE, MAX_FREE_SIDE)),
      height: Math.round(asNumber(value.height, 200, MIN_FREE_SIDE, MAX_FREE_SIDE)),
    };
  }
  return structuredClone(fallback);
}

function normalizeTweaks(raw: unknown): Record<string, ModuleTweak> {
  const out: Record<string, ModuleTweak> = {};
  for (const [id, value] of Object.entries(asRecord(raw))) {
    const tweak = asRecord(value);
    out[id] = {
      dx: asNumber(tweak.dx, 0, -2000, 2000),
      dy: asNumber(tweak.dy, 0, -2000, 2000),
      scale: asNumber(tweak.scale, 1, 0.1, 10),
      hidden: asBoolean(tweak.hidden, false),
    };
  }
  return out;
}

/**
 * 校验并补齐一份牌子文档；本地存档和导入文件都先过这一步。
 * 样式不认识时返回 null，由调用方决定提示什么。
 */
export function normalizeSignDocument(raw: unknown, now = Date.now()): SignDocument | null {
  const value = asRecord(raw);
  if (!isSignStyleId(value.style)) return null;
  const style = getSignStyle(value.style);
  const mapArt = asRecord(value.mapArt);
  const createdAt = asNumber(value.createdAt, now, 0, Number.MAX_SAFE_INTEGER);
  return {
    id: asString(value.id, "") || newId(),
    name: asString(value.name, style.label).slice(0, 80) || style.label,
    style: value.style,
    size: normalizeSize(value.size, style.defaultSize),
    lighting: asChoice<Lighting>(value.lighting, ["none", "fluore", "led"], "fluore"),
    content: style.normalize(value.content),
    tweaks: normalizeTweaks(value.tweaks),
    mapArt: {
      gridForFree: normalizeGrid(mapArt.gridForFree, DEFAULT_MAP_ART.gridForFree),
      fit: asChoice(mapArt.fit, ["contain", "cover", "stretch"] as const, DEFAULT_MAP_ART.fit),
      applyLighting: asBoolean(mapArt.applyLighting, DEFAULT_MAP_ART.applyLighting),
    },
    createdAt,
    updatedAt: asNumber(value.updatedAt, createdAt, 0, Number.MAX_SAFE_INTEGER),
    thumbnail:
      typeof value.thumbnail === "string" && value.thumbnail.startsWith("data:image/png")
        ? value.thumbnail
        : undefined,
  };
}
