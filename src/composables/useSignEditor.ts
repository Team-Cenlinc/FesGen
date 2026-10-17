import { computed, onBeforeUnmount, ref, shallowRef, toRaw, watch } from "vue";
import { FALLBACKS, type FontId } from "@/fonts/stacks";
import {
  createShaper,
  downloadFonts,
  fontsVersion,
  isFontLoaded,
  loadCachedFonts,
} from "@/fonts/manager";
import { format, messages as m } from "@/i18n";
import { useLibrary } from "@/library/store";
import { placeSource } from "@/mapart/fit";
import { gridPixelSize } from "@/mapart/grid";
import { signThumbnail } from "@/signs/rasterize";
import { getSignStyle, signPixelSize } from "@/signs/registry";
import type { RenderTree } from "@/signs/render";
import type { ModuleTweak, SignDocument } from "@/signs/types";
import { setAtPath } from "@/signs/values";

/** 地图画里低于这个字号（像素）的文字会提示可能看不清。 */
export const SMALL_TEXT_THRESHOLD = 10;

type Snapshot = Pick<SignDocument, "name" | "size" | "lighting" | "content" | "tweaks" | "mapArt">;

export interface EditorCheck {
  kind: "small-text" | "missing-glyphs";
  module: string;
  text: string;
}

const COALESCE_MS = 800;

/**
 * 深拷贝牌子数据。草稿是响应式对象，嵌套属性里可能夹着 Vue 的代理，structuredClone 拷不了代理；
 * 牌子文档只含 JSON 能表示的值，用 JSON 往返既能穿透代理，也保证存下来的就是导出时的样子。
 */
function cloneData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * 编辑一块牌子：草稿、撤销重做、自动保存、字体检查和排版结果都在这里。
 * 所有修改都经过 commit，这样撤销栈和自动保存不会漏掉任何一次改动。
 */
export function useSignEditor(id: string) {
  const library = useLibrary();
  const stored = library.get(id);
  const draft = ref<SignDocument | null>(stored ? cloneData(stored) : null);
  const style = computed(() => (draft.value ? getSignStyle(draft.value.style) : null));
  const selected = ref<string | null>(null);

  // —— 撤销与重做 ——
  const past = shallowRef<Snapshot[]>([]);
  const future = shallowRef<Snapshot[]>([]);
  let lastCoalesce: { key: string; at: number } | null = null;

  function snapshot(doc: SignDocument): Snapshot {
    const { name, size, lighting, content, tweaks, mapArt } = cloneData(doc);
    return { name, size, lighting, content, tweaks, mapArt };
  }

  function restore(doc: SignDocument, state: Snapshot) {
    Object.assign(doc, cloneData(state));
  }

  /**
   * 修改草稿。coalesceKey 相同且间隔很短的连续修改（比如逐字输入）合并成一步撤销。
   */
  function commit(mutate: (doc: SignDocument) => void, coalesceKey?: string) {
    const doc = draft.value;
    if (!doc) return;
    const now = Date.now();
    const merge =
      coalesceKey && lastCoalesce?.key === coalesceKey && now - lastCoalesce.at < COALESCE_MS;
    if (!merge) past.value = [...past.value.slice(-99), snapshot(doc)];
    future.value = [];
    lastCoalesce = coalesceKey ? { key: coalesceKey, at: now } : null;
    mutate(doc);
    scheduleSave(true);
  }

  function undo() {
    const doc = draft.value;
    const previous = past.value.at(-1);
    if (!doc || !previous) return;
    future.value = [snapshot(doc), ...future.value];
    past.value = past.value.slice(0, -1);
    restore(doc, previous);
    lastCoalesce = null;
    scheduleSave(true);
  }

  function redo() {
    const doc = draft.value;
    const next = future.value[0];
    if (!doc || !next) return;
    past.value = [...past.value, snapshot(doc)];
    future.value = future.value.slice(1);
    restore(doc, next);
    lastCoalesce = null;
    scheduleSave(true);
  }

  const canUndo = computed(() => past.value.length > 0);
  const canRedo = computed(() => future.value.length > 0);

  // —— 常用修改 ——
  function setField(path: string, value: unknown) {
    commit((doc) => {
      doc.content = setAtPath(toRaw(doc.content), path, value);
    }, `field:${path}`);
  }

  function setTweak(moduleId: string, patch: Partial<ModuleTweak>) {
    commit(
      (doc) => {
        const current = doc.tweaks[moduleId] ?? { dx: 0, dy: 0, scale: 1, hidden: false };
        doc.tweaks = { ...doc.tweaks, [moduleId]: { ...current, ...patch } };
      },
      `tweak:${moduleId}:${Object.keys(patch).join()}`,
    );
  }

  function resetTweak(moduleId: string) {
    commit((doc) => {
      const { [moduleId]: _removed, ...rest } = doc.tweaks;
      doc.tweaks = rest;
    });
  }

  function runAction(actionId: string) {
    const current = style.value;
    if (!current) return;
    commit((doc) => {
      doc.content = current.applyAction(doc.content, actionId);
    });
  }

  // —— 字体 ——
  const requiredFonts = computed<FontId[]>(() =>
    draft.value && style.value ? style.value.fonts(draft.value.content) : [],
  );
  const missingFonts = ref<FontId[]>([]);
  const fontsChecking = ref(true);
  const fontsDownloading = ref(false);
  const fontsError = ref<string | null>(null);

  watch(
    requiredFonts,
    async (ids) => {
      fontsChecking.value = true;
      missingFonts.value = await loadCachedFonts(ids);
      fontsChecking.value = false;
    },
    { immediate: true },
  );

  async function downloadMissingFonts() {
    fontsDownloading.value = true;
    fontsError.value = null;
    try {
      await downloadFonts(missingFonts.value);
      missingFonts.value = [];
    } catch {
      fontsError.value = m.fonts.failed;
      missingFonts.value = missingFonts.value.filter((fontId) => !isFontLoaded(fontId));
    } finally {
      fontsDownloading.value = false;
    }
  }

  const fontsReady = computed(() => {
    void fontsVersion.value;
    return requiredFonts.value.length > 0 && requiredFonts.value.every(isFontLoaded);
  });

  // —— 排版 ——
  const tree = computed<RenderTree | null>(() => {
    void fontsVersion.value;
    const doc = draft.value;
    if (!doc || !style.value || !fontsReady.value) return null;
    return style.value.layout({
      content: doc.content,
      size: signPixelSize(doc.size),
      shaper: createShaper(),
      tweaks: doc.tweaks,
    });
  });

  // —— 补字字体：牌面上有主字体没有的字时，沿字体链找下一款还没加载的中文字体 ——
  const fallbackCandidates = computed<FontId[]>(() => {
    void fontsVersion.value;
    const layout = tree.value;
    if (!layout) return [];
    const next = new Set<FontId>();
    for (const [primary, chars] of Object.entries(layout.missingByPrimary) as [
      FontId,
      string[],
    ][]) {
      const candidate =
        chars.length > 0 ? FALLBACKS[primary].find((id) => !isFontLoaded(id)) : undefined;
      if (candidate) next.add(candidate);
    }
    return [...next];
  });

  /** 补字字体能处理的缺字（字体链已经用尽的不算）。 */
  const fallbackChars = computed(() => {
    void fontsVersion.value;
    const layout = tree.value;
    if (!layout) return "";
    const chars = new Set<string>();
    for (const [primary, missing] of Object.entries(layout.missingByPrimary) as [
      FontId,
      string[],
    ][]) {
      if (FALLBACKS[primary].some((id) => !isFontLoaded(id)))
        missing.forEach((char) => chars.add(char));
    }
    return [...chars].join("");
  });

  /** 缓存里有就直接加载，剩下的才需要下载并提示。 */
  const fallbackToDownload = ref<FontId[]>([]);
  const fallbackDownloading = ref(false);
  const fallbackError = ref<string | null>(null);
  watch(
    fallbackCandidates,
    async (ids) => {
      fallbackToDownload.value = ids.length > 0 ? await loadCachedFonts(ids) : [];
    },
    { immediate: true },
  );

  async function downloadFallbackFonts() {
    fallbackDownloading.value = true;
    fallbackError.value = null;
    try {
      await downloadFonts(fallbackToDownload.value);
    } catch {
      fallbackError.value = m.fonts.failed;
    } finally {
      fallbackDownloading.value = false;
    }
  }

  // —— 检查：缺字和地图画小字 ——
  const checks = computed<EditorCheck[]>(() => {
    const doc = draft.value;
    const layout = tree.value;
    if (!doc || !style.value || !layout) return [];
    const labelOf = (moduleId: string) =>
      style.value!.modules.find((module) => module.id === moduleId)?.label ?? moduleId;
    // 自由尺寸做成地图画时还要再缩放一次。
    const mapScale =
      doc.size.mode === "grid"
        ? 1
        : placeSource(layout, gridPixelSize(doc.mapArt.gridForFree), doc.mapArt.fit).width /
          layout.width;
    const result: EditorCheck[] = [];
    for (const [moduleId, chars] of Object.entries(layout.missingGlyphs)) {
      result.push({
        kind: "missing-glyphs",
        module: moduleId,
        text: format(m.editor.missingGlyphs, { module: labelOf(moduleId), chars: chars.join("") }),
      });
    }
    for (const [moduleId, size] of Object.entries(layout.minTextSize)) {
      const effective = size * mapScale;
      if (effective < SMALL_TEXT_THRESHOLD) {
        result.push({
          kind: "small-text",
          module: moduleId,
          text: format(m.editor.smallText, {
            module: labelOf(moduleId),
            size: effective.toFixed(1),
          }),
        });
      }
    }
    return result;
  });

  // —— 自动保存与缩略图 ——
  let saveTimer: ReturnType<typeof setTimeout> | undefined;
  let savePending = false;
  let thumbnailTimer: ReturnType<typeof setTimeout> | undefined;
  const lastSavedAt = ref<number | null>(null);

  function scheduleSave(touch: boolean) {
    clearTimeout(saveTimer);
    savePending = true;
    saveTimer = setTimeout(() => flush(touch), 300);
    scheduleThumbnail();
  }

  function flush(touch = true) {
    clearTimeout(saveTimer);
    savePending = false;
    if (!draft.value) return;
    if (touch) {
      draft.value.updatedAt = Date.now();
      lastSavedAt.value = draft.value.updatedAt;
    }
    library.save(cloneData(draft.value));
  }

  function scheduleThumbnail() {
    clearTimeout(thumbnailTimer);
    thumbnailTimer = setTimeout(async () => {
      const layout = tree.value;
      const doc = draft.value;
      if (!layout || !doc) return;
      try {
        doc.thumbnail = await signThumbnail(layout, doc.lighting);
        library.save(cloneData(doc));
      } catch {
        // 缩略图只是锦上添花，生成失败不影响编辑。
      }
    }, 1200);
  }

  // 新建或导入的牌子还没有缩略图：排版结果一出来就补一张（字体可能早已在内存里就绪）。
  watch(
    tree,
    (layout) => {
      if (layout && draft.value && !draft.value.thumbnail) scheduleThumbnail();
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    clearTimeout(thumbnailTimer);
    if (savePending) flush(true);
  });

  return {
    draft,
    style,
    selected,
    tree,
    checks,
    commit,
    setField,
    setTweak,
    resetTweak,
    runAction,
    undo,
    redo,
    canUndo,
    canRedo,
    requiredFonts,
    missingFonts,
    fontsChecking,
    fontsDownloading,
    fontsError,
    fontsReady,
    downloadMissingFonts,
    fallbackToDownload,
    fallbackChars,
    fallbackDownloading,
    fallbackError,
    downloadFallbackFonts,
    lastSavedAt,
  };
}

export type SignEditor = ReturnType<typeof useSignEditor>;
