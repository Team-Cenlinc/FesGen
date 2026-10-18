<script setup lang="ts">
import {
  PhArrowLeft,
  PhArrowUUpLeft,
  PhArrowUUpRight,
  PhExport,
  PhTextAa,
} from "@phosphor-icons/vue";
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
import { useRouter } from "vue-router";
import ExportPanel from "@/components/editor/ExportPanel.vue";
import FontDependencyDialog from "@/components/editor/FontDependencyDialog.vue";
import OutlinePanel from "@/components/editor/OutlinePanel.vue";
import PropertyPanel from "@/components/editor/PropertyPanel.vue";
import SignCanvas from "@/components/editor/SignCanvas.vue";
import MapArtPreview from "@/components/mapart/MapArtPreview.vue";
import SegmentedControl from "@/components/SegmentedControl.vue";
import SwitchToggle from "@/components/SwitchToggle.vue";
import TypeText from "@/components/TypeText.vue";
import { useSignEditor } from "@/composables/useSignEditor";
import { format, messages as m } from "@/i18n";
import { sizeLabel } from "@/library/labels";
import { signToMapArt, type SignMapArt } from "@/signs/rasterize";
import type { Affordance } from "@/signs/render";
import type { Lighting, MapArtSettings, ModuleTweak, SignSize } from "@/signs/types";

const props = defineProps<{ id: string }>();
const router = useRouter();
const editor = useSignEditor(props.id);
const { draft, style, tree, selected, checks } = editor;

const view = ref<"vector" | "map">("vector");
const showGrid = ref(true);
const exportOpen = ref(false);
const hasRendered = ref(false);
watch(tree, (value) => {
  if (value) hasRendered.value = true;
});

const moduleLabels = computed<Record<string, string>>(() =>
  Object.fromEntries((style.value?.modules ?? []).map((module) => [module.id, module.label])),
);
const viewOptions = [
  { value: "vector", label: m.editor.viewVector },
  { value: "map", label: m.editor.viewMapArt },
] as const;

const fallbackOpen = ref(false);
const showFallback = computed(
  () =>
    !!tree.value && editor.fallbackToDownload.value.length > 0 && editor.fallbackChars.value !== "",
);
// 补字字体下载完、或者缺字都改掉了，就收起对话框。
watch(showFallback, (visible) => {
  if (!visible) fallbackOpen.value = false;
});

const showFontDialog = computed(
  () => !editor.fontsChecking.value && editor.missingFonts.value.length > 0,
);

function cancelFonts() {
  // 已经显示过牌面，说明是刚打开的选项（如汉字强调）需要新字体：撤销这次改动即可。
  if (hasRendered.value) editor.undo();
  else router.push("/");
}

// —— 地图画预览 ——
const mapArt = shallowRef<SignMapArt | null>(null);
const mapArtWorking = ref(false);
let mapArtRun = 0;
watch(
  [view, tree, () => draft.value?.lighting, () => draft.value?.size, () => draft.value?.mapArt],
  async () => {
    const doc = draft.value;
    const layout = tree.value;
    if (view.value !== "map" || !doc || !layout) return;
    const run = ++mapArtRun;
    mapArtWorking.value = true;
    const result = await signToMapArt(layout, doc.lighting, doc.size, doc.mapArt);
    if (run !== mapArtRun) return;
    mapArt.value = result;
    mapArtWorking.value = false;
  },
  { deep: true },
);

// —— 修改 ——
function setName(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  editor.commit((doc) => {
    doc.name = value.slice(0, 80);
  }, "name");
}

function fixName(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.value.trim() && draft.value && style.value) {
    editor.commit((doc) => {
      doc.name = style.value!.label;
    });
  }
}

function setSize(size: SignSize) {
  editor.commit((doc) => {
    doc.size = size;
  }, "size");
}

function setLighting(lighting: Lighting) {
  editor.commit((doc) => {
    doc.lighting = lighting;
  });
}

function setMapArt(patch: Partial<MapArtSettings>) {
  editor.commit(
    (doc) => {
      doc.mapArt = { ...doc.mapArt, ...patch };
    },
    `map-art:${Object.keys(patch).join()}`,
  );
}

function setTweak(moduleId: string, patch: Partial<ModuleTweak>) {
  editor.setTweak(moduleId, patch);
}

// —— 列表（例如线路）：插入后选中新的一项，删除后回到模块本身 ——
function selectedModuleId(): string | null {
  return selected.value?.split("#")[0] ?? null;
}

function insertListItem(path: string, index: number) {
  const moduleId = selectedModuleId();
  if (editor.insertListItem(path, index) && moduleId) selected.value = `${moduleId}#${index}`;
}

function removeListItem(path: string, index: number) {
  const moduleId = selectedModuleId();
  if (editor.removeListItem(path, index) && moduleId) selected.value = moduleId;
}

function moveListItem(path: string, from: number, to: number) {
  editor.moveListItem(path, from, to);
  const moduleId = selectedModuleId();
  if (moduleId && selected.value === `${moduleId}#${from}`) selected.value = `${moduleId}#${to}`;
}

/** 牌面上的快捷按钮（例如色带右端的“+”）：执行动作，再选中它指定的元素。 */
function runAffordance(affordance: Affordance) {
  editor.runAction(affordance.action);
  if (affordance.select) selected.value = affordance.select;
}

// —— 快捷键：撤销、重做、Esc 取消选择。输入框里交给浏览器自己的撤销。 ——
function onKeyDown(event: KeyboardEvent) {
  // 页头菜单等已经处理过的按键（比如用 Esc 收起菜单）不再当作编辑器快捷键。
  if (event.defaultPrevented) return;
  const target = event.target;
  const typing =
    target instanceof Element && target.closest("input, textarea, [contenteditable]") !== null;
  const mod = event.metaKey || event.ctrlKey;
  if (mod && !typing && event.key.toLowerCase() === "z") {
    event.preventDefault();
    if (event.shiftKey) editor.redo();
    else editor.undo();
  } else if (mod && !typing && event.key.toLowerCase() === "y") {
    event.preventDefault();
    editor.redo();
  } else if (event.key === "Escape" && !exportOpen.value && !typing) {
    selected.value = null;
  }
}
onMounted(() => document.addEventListener("keydown", onKeyDown));
onBeforeUnmount(() => document.removeEventListener("keydown", onKeyDown));
</script>

<template>
  <main v-if="draft && style" class="editor">
    <header class="editor__bar">
      <RouterLink to="/" class="button button--small">
        <PhArrowLeft :size="16" weight="bold" aria-hidden="true" />
        {{ m.editor.back }}
      </RouterLink>
      <input
        class="editor__name"
        type="text"
        :value="draft.name"
        :aria-label="m.library.nameLabel"
        maxlength="80"
        spellcheck="false"
        @input="setName"
        @blur="fixName"
      />
      <span class="editor__meta">
        <TypeText :text="`${style.label} · ${sizeLabel(draft.size)}`" />
      </span>
      <span v-if="editor.lastSavedAt.value" class="editor__saved">{{ m.editor.saved }}</span>
      <div class="editor__bar-actions">
        <button
          type="button"
          class="icon-button"
          :aria-disabled="!editor.canUndo.value"
          :title="`${m.editor.undo}（⌘Z）`"
          @click="editor.undo()"
        >
          <PhArrowUUpLeft :size="18" weight="bold" aria-hidden="true" />
          <span class="visually-hidden">{{ m.editor.undo }}</span>
        </button>
        <button
          type="button"
          class="icon-button"
          :aria-disabled="!editor.canRedo.value"
          :title="`${m.editor.redo}（⇧⌘Z）`"
          @click="editor.redo()"
        >
          <PhArrowUUpRight :size="18" weight="bold" aria-hidden="true" />
          <span class="visually-hidden">{{ m.editor.redo }}</span>
        </button>
        <button
          type="button"
          class="button button--primary"
          :disabled="!tree"
          @click="exportOpen = true"
        >
          <PhExport :size="18" weight="bold" aria-hidden="true" />
          {{ m.editor.export }}
        </button>
      </div>
    </header>

    <div class="editor__layout">
      <aside class="editor__outline panel">
        <OutlinePanel
          :style="style"
          :selected="selected"
          :tweaks="draft.tweaks"
          @select="selected = $event"
        />
      </aside>

      <section class="editor__stage panel">
        <div class="editor__stage-bar">
          <SegmentedControl
            v-model="view"
            size="sm"
            :options="viewOptions"
            :label="m.editor.viewMapArt"
          />
          <SwitchToggle v-if="view === 'map'" v-model="showGrid">{{
            m.mapArt.preview.gridLines
          }}</SwitchToggle>
          <span v-if="view === 'map' && mapArtWorking" class="hint" aria-live="polite">
            {{ m.editor.mapArtWorking }}
          </span>
        </div>

        <div v-if="showFontDialog" class="editor__font-gate">
          <FontDependencyDialog
            :fonts="editor.missingFonts.value"
            :style-label="style.label"
            :mode="hasRendered ? 'extra' : 'initial'"
            :downloading="editor.fontsDownloading.value"
            :error="editor.fontsError.value"
            @download="editor.downloadMissingFonts()"
            @cancel="cancelFonts"
          />
        </div>
        <template v-else-if="tree">
          <div v-if="showFallback" class="editor__fallback">
            <FontDependencyDialog
              v-if="fallbackOpen"
              :fonts="editor.fallbackToDownload.value"
              :style-label="style.label"
              mode="fallback"
              :chars="editor.fallbackChars.value"
              :downloading="editor.fallbackDownloading.value"
              :error="editor.fallbackError.value"
              @download="editor.downloadFallbackFonts()"
              @cancel="fallbackOpen = false"
            />
            <div v-else class="notice notice--caution editor__fallback-bar" role="status">
              <span>{{
                format(m.fonts.fallbackBanner, { chars: editor.fallbackChars.value })
              }}</span>
              <button type="button" class="button button--small" @click="fallbackOpen = true">
                {{ m.fonts.fallbackAction }}
              </button>
            </div>
          </div>
          <SignCanvas
            v-if="view === 'vector'"
            :tree="tree"
            :lighting="draft.lighting"
            :selected="selected"
            :labels="moduleLabels"
            @select="selected = $event"
            @action="runAffordance"
          />
          <MapArtPreview
            v-else-if="mapArt"
            :image="mapArt.image"
            :grid="mapArt.grid"
            :zoom="0"
            :show-grid="showGrid"
            :label="m.editor.viewMapArt"
          />
        </template>
        <div v-else-if="!editor.fontsChecking.value" class="editor__waiting">
          <PhTextAa :size="28" weight="bold" aria-hidden="true" />
          <p>{{ m.editor.fontsNeeded }}</p>
        </div>
      </section>

      <aside class="editor__properties panel">
        <PropertyPanel
          :style="style"
          :doc="draft"
          :selected="selected"
          :checks="checks"
          @select="selected = $event"
          @list-insert="insertListItem"
          @list-remove="removeListItem"
          @list-move="moveListItem"
          @field="editor.setField"
          @tweak="setTweak"
          @reset-tweak="editor.resetTweak"
          @action="editor.runAction"
          @size="setSize"
          @lighting="setLighting"
          @map-art="setMapArt"
        />
      </aside>
    </div>

    <ExportPanel v-if="exportOpen && tree" :doc="draft" :tree="tree" @close="exportOpen = false" />
  </main>

  <main v-else class="editor-missing">
    <p>{{ m.editor.notFound }}</p>
    <RouterLink to="/" class="button button--primary">
      <PhArrowLeft :size="16" weight="bold" aria-hidden="true" />
      {{ m.editor.back }}
    </RouterLink>
  </main>
</template>

<style scoped>
.editor {
  display: grid;
  gap: 16px;
  width: var(--page-width-wide);
  margin: 0 auto;
  padding: 24px 0 64px;
}

.editor__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 14px;
}

.editor__name {
  flex: 0 1 320px;
  min-width: 140px;
  padding: 4px 8px;
  border: 1px solid transparent;
  border-radius: var(--radius-control);
  background: transparent;
  font-size: 22px;
  font-weight: 790;
  letter-spacing: -0.03em;
  transition: border-color var(--duration-feedback) ease;
}

.editor__name:focus-visible {
  border-color: var(--color-text);
  outline: 1px solid var(--color-text);
  outline-offset: 0;
}

.editor__meta {
  font-size: 13px;
  font-weight: 650;
  color: var(--color-muted);
}

.editor__saved {
  font-size: 12px;
  font-weight: 650;
  color: var(--color-status-ok);
}

.editor__bar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.editor__layout {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr) 340px;
  align-items: start;
  gap: 16px;
}

.editor__outline,
.editor__properties {
  position: sticky;
  top: calc(var(--site-header-bottom) + 12px);
  max-height: calc(100vh - var(--site-header-bottom) - 28px);
  overflow-y: auto;
  padding: 16px;
}

.editor__stage {
  display: grid;
  gap: 14px;
  padding: 16px;
}

.editor__stage-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 16px;
}

.editor__fallback {
  display: grid;
  justify-items: center;
}

.editor__fallback-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  width: 100%;
}

.editor__font-gate {
  display: grid;
  place-items: center;
  min-height: 320px;
  padding: 24px 0;
}

.editor__waiting {
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: 64px 16px;
  color: var(--color-muted);
  text-align: center;
}

.icon-button {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  background: var(--color-surface);
  cursor: pointer;
  transition:
    border-color var(--duration-feedback) ease,
    transform var(--duration-press) var(--ease-out);
}

.icon-button:active {
  transform: scale(0.94);
}

.icon-button[aria-disabled="true"] {
  color: var(--color-border);
  cursor: default;
}

.editor-missing {
  display: grid;
  justify-items: start;
  gap: 16px;
  width: var(--page-width);
  margin: 0 auto;
  padding: 64px 0;
}

@media (hover: hover) and (pointer: fine) {
  .icon-button:not([aria-disabled="true"]):hover {
    border-color: var(--color-text);
  }
}

@media (max-width: 1100px) {
  .editor__layout {
    grid-template-columns: 200px minmax(0, 1fr);
  }

  .editor__properties {
    grid-column: 1 / -1;
    position: static;
    max-height: none;
  }
}

@media (max-width: 760px) {
  .editor__layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .editor__outline {
    position: static;
    max-height: none;
    order: 2;
  }

  .editor__stage {
    order: 1;
  }

  .editor__properties {
    order: 3;
  }
}
</style>
