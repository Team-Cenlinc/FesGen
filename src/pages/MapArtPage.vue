<script setup lang="ts">
import { PhCheck, PhCopy, PhDownloadSimple, PhGridNine } from "@phosphor-icons/vue";
import { computed, onBeforeUnmount, ref, shallowRef, watch } from "vue";
import ColorChip from "@/components/ColorChip.vue";
import GridPicker from "@/components/mapart/GridPicker.vue";
import MapArtPreview from "@/components/mapart/MapArtPreview.vue";
import SourceDropzone from "@/components/mapart/SourceDropzone.vue";
import PageTitle from "@/components/PageTitle.vue";
import SegmentedControl from "@/components/SegmentedControl.vue";
import StepSection from "@/components/StepSection.vue";
import SwitchToggle from "@/components/SwitchToggle.vue";
import { messages as m } from "@/i18n";
import { hexToRgb, rgbToHex } from "@/mapart/colors";
import { placeSource, type FitMode } from "@/mapart/fit";
import {
  exactGrid,
  gridLabel,
  gridPixelSize,
  sameGrid,
  suggestGrid,
  type MapGrid,
  type Size,
} from "@/mapart/grid";
import { imageFrameCreateCommand, sanitizeImageFrameName } from "@/mapart/imageFrame";
import { ALL_MAP_SHADES, MAP_BASE_COLORS } from "@/mapart/palette";
import type { DitherMode, QuantizedMapArt, RgbaImage } from "@/mapart/quantize";
import { quantizeInWorker } from "@/mapart/quantizeClient";
import {
  decodeImage,
  encodePng,
  rasterize,
  sampleCornerColor,
  type Padding,
} from "@/mapart/raster";

interface Source {
  bitmap: ImageBitmap;
  name: string;
  baseName: string;
  size: Size;
}

const paletteSize = MAP_BASE_COLORS.length * ALL_MAP_SHADES.length;

const fitOptions: { value: FitMode; label: string }[] = [
  { value: "contain", label: m.mapArt.fit.contain },
  { value: "cover", label: m.mapArt.fit.cover },
  { value: "stretch", label: m.mapArt.fit.stretch },
];
const paddingOptions: { value: Padding["kind"]; label: string }[] = [
  { value: "color", label: m.mapArt.fit.paddingColor },
  { value: "transparent", label: m.mapArt.fit.paddingTransparent },
];
const ditherOptions: { value: DitherMode; label: string }[] = [
  { value: "none", label: m.mapArt.dither.none },
  { value: "floyd-steinberg", label: m.mapArt.dither.floydSteinberg },
];
const viewOptions: { value: "map" | "original"; label: string }[] = [
  { value: "map", label: m.mapArt.preview.mapArt },
  { value: "original", label: m.mapArt.preview.original },
];
const zoomOptions: { value: number; label: string }[] = [
  { value: 0, label: m.mapArt.preview.zoomFit },
  { value: 1, label: "1×" },
  { value: 2, label: "2×" },
  { value: 4, label: "4×" },
  { value: 8, label: "8×" },
];

const source = shallowRef<Source | null>(null);
const sourceError = ref<string | null>(null);
const grid = ref<MapGrid>({ rows: 1, columns: 3 });
const fit = ref<FitMode>("contain");
const paddingKind = ref<Padding["kind"]>("color");
const paddingHex = ref("#FFFFFF");
const dither = ref<DitherMode>("none");
const view = ref<"map" | "original">("map");
const zoom = ref(0);
const showGrid = ref(true);
const fitted = shallowRef<RgbaImage | null>(null);
const result = shallowRef<QuantizedMapArt | null>(null);
const working = ref(false);
const fileNameOverride = ref<string | null>(null);
const mapName = ref("fesgen");
const imageUrl = ref("");
const copied = ref(false);
const downloadHint = ref(false);

const suggested = computed(() => (source.value ? suggestGrid(source.value.size) : undefined));
const isExact = computed(() => {
  const exact = source.value ? exactGrid(source.value.size) : null;
  return exact !== null && sameGrid(exact, grid.value);
});
const targetSize = computed(() => gridPixelSize(grid.value));
const shownImage = computed(() => (view.value === "map" ? result.value?.image : fitted.value));
const sourceDetail = computed(() =>
  source.value ? `${source.value.size.width} × ${source.value.size.height} px` : undefined,
);
const defaultFileName = computed(
  () => `${source.value?.baseName ?? "fesgen"}-${grid.value.rows}x${grid.value.columns}`,
);
const fileName = computed({
  get: () => fileNameOverride.value ?? defaultFileName.value,
  set: (value: string) => {
    fileNameOverride.value = value;
  },
});
const command = computed(() => imageFrameCreateCommand(mapName.value, imageUrl.value, grid.value));

async function onFile(file: File) {
  sourceError.value = null;
  if (!file.type.startsWith("image/")) {
    sourceError.value = m.mapArt.source.unsupported;
    return;
  }
  let bitmap: ImageBitmap;
  try {
    bitmap = await decodeImage(file);
  } catch {
    sourceError.value = m.mapArt.source.readError;
    return;
  }
  source.value?.bitmap.close();
  const baseName = file.name.replace(/\.[^.]+$/, "") || "fesgen";
  const size = { width: bitmap.width, height: bitmap.height };
  grid.value = exactGrid(size) ?? suggestGrid(size);
  paddingHex.value = rgbToHex(sampleCornerColor(bitmap));
  fileNameOverride.value = null;
  mapName.value = sanitizeImageFrameName(baseName);
  downloadHint.value = false;
  source.value = { bitmap, name: file.name, baseName, size };
}

// 参数一变就重新生成；只保留最后一次请求的结果，连续调整时不会闪回旧图。
let latestRun = 0;
watch([source, grid, fit, paddingKind, paddingHex, dither], async () => {
  const current = source.value;
  if (!current) return;
  const run = ++latestRun;
  working.value = true;
  const rgb = hexToRgb(paddingHex.value);
  const padding: Padding =
    paddingKind.value === "color" && rgb !== null
      ? { kind: "color", rgb }
      : { kind: "transparent" };
  const placement = placeSource(current.size, targetSize.value, fit.value);
  const raster = rasterize(current.bitmap, targetSize.value, placement, padding);
  fitted.value = raster;
  const quantized = await quantizeInWorker(raster, dither.value);
  if (run !== latestRun) return;
  result.value = quantized;
  working.value = false;
});

// 下载按钮始终可点：还没有图时说明原因，而不是给一个灰掉、不知道为什么点不了的按钮。
async function download() {
  if (!result.value) {
    downloadHint.value = true;
    return;
  }
  const blob = await encodePng(result.value.image);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName.value.trim() || defaultFileName.value}.png`;
  link.click();
  // 立刻回收会让部分浏览器的下载失败，留够时间再释放。
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

let copiedTimer: ReturnType<typeof setTimeout> | undefined;
async function copyCommand() {
  await navigator.clipboard.writeText(command.value);
  copied.value = true;
  clearTimeout(copiedTimer);
  copiedTimer = setTimeout(() => (copied.value = false), 1500);
}

onBeforeUnmount(() => {
  clearTimeout(copiedTimer);
  source.value?.bitmap.close();
});
</script>

<template>
  <main class="map-art">
    <PageTitle :title="m.mapArt.title" :subtitle="m.mapArt.subtitle">
      <template #icon><PhGridNine :size="30" weight="bold" /></template>
    </PageTitle>

    <div class="map-art__layout">
      <aside class="map-art__controls">
        <StepSection :title="m.mapArt.source.heading">
          <SourceDropzone :file-name="source?.name" :detail="sourceDetail" @file="onFile" />
          <p v-if="sourceError" class="notice notice--error" role="alert">{{ sourceError }}</p>
        </StepSection>

        <StepSection :title="m.mapArt.grid.heading">
          <GridPicker v-model="grid" :suggested="suggested" />
          <p v-if="isExact" class="notice notice--ok">{{ m.mapArt.grid.exactMatch }}</p>
        </StepSection>

        <StepSection :title="m.mapArt.fit.heading">
          <SegmentedControl v-model="fit" :options="fitOptions" :label="m.mapArt.fit.heading" />
          <p v-if="isExact" class="hint">{{ m.mapArt.fit.notNeeded }}</p>
          <div v-else-if="fit === 'contain'" class="control-row">
            <span class="field__label">{{ m.mapArt.fit.padding }}</span>
            <SegmentedControl
              v-model="paddingKind"
              size="sm"
              :options="paddingOptions"
              :label="m.mapArt.fit.padding"
            />
            <ColorChip
              v-if="paddingKind === 'color'"
              v-model="paddingHex"
              :label="m.mapArt.fit.padding"
            />
          </div>
        </StepSection>

        <StepSection :title="m.mapArt.dither.heading">
          <SegmentedControl
            v-model="dither"
            :options="ditherOptions"
            :label="m.mapArt.dither.heading"
          />
          <p class="hint">{{ m.mapArt.dither.hint }}</p>
        </StepSection>
      </aside>

      <section class="map-art__stage">
        <StepSection :title="m.mapArt.preview.heading">
          <template #aside>
            <SegmentedControl
              v-model="view"
              size="sm"
              :options="viewOptions"
              :label="m.mapArt.preview.heading"
            />
            <SegmentedControl
              v-model="zoom"
              size="sm"
              :options="zoomOptions"
              :label="m.mapArt.preview.zoom"
            />
            <SwitchToggle v-model="showGrid">{{ m.mapArt.preview.gridLines }}</SwitchToggle>
          </template>

          <MapArtPreview
            v-if="shownImage"
            :image="shownImage"
            :grid="grid"
            :zoom="zoom"
            :show-grid="showGrid"
            :label="view === 'map' ? m.mapArt.preview.mapArt : m.mapArt.preview.original"
          />
          <div v-else class="stage__empty">
            <span class="stage__empty-wall" aria-hidden="true">
              <span v-for="cell in 3" :key="cell" />
            </span>
            <p>{{ m.mapArt.preview.empty }}</p>
          </div>

          <dl v-if="result" class="stats" :class="{ 'stats--working': working }">
            <div>
              <dt>{{ m.mapArt.stats.size }}</dt>
              <dd>{{ result.image.width }} × {{ result.image.height }}</dd>
            </div>
            <div>
              <dt>{{ m.mapArt.stats.maps }}</dt>
              <dd>
                {{ grid.rows * grid.columns }}
                <span class="stats__aside">{{ gridLabel(grid) }}</span>
              </dd>
            </div>
            <div>
              <dt>{{ m.mapArt.stats.colors }}</dt>
              <dd>
                {{ result.colorsUsed }}
                <span class="stats__aside">/ {{ paletteSize }}</span>
              </dd>
            </div>
            <div>
              <dt>{{ m.mapArt.stats.transparent }}</dt>
              <dd>{{ result.transparentPixels }}</dd>
            </div>
          </dl>
          <p v-if="working && source" class="visually-hidden" aria-live="polite">
            {{ m.mapArt.preview.working }}
          </p>
        </StepSection>

        <StepSection :title="m.mapArt.export.heading">
          <div class="export__row">
            <label class="field export__name">
              <span class="field__label">{{ m.mapArt.export.fileName }}</span>
              <input v-model="fileName" class="input" type="text" spellcheck="false" />
            </label>
            <button type="button" class="button button--primary export__download" @click="download">
              <PhDownloadSimple :size="18" weight="bold" aria-hidden="true" />
              {{ m.mapArt.export.download }}
            </button>
          </div>
          <p v-if="downloadHint && !result" class="notice notice--caution" role="status">
            {{ m.mapArt.export.needsSource }}
          </p>

          <div class="export__command-block">
            <h3 class="export__subtitle">{{ m.mapArt.export.command }}</h3>
            <p class="hint">{{ m.mapArt.export.commandHint }}</p>
            <div class="export__row">
              <label class="field">
                <span class="field__label">{{ m.mapArt.export.mapName }}</span>
                <input v-model="mapName" class="input" type="text" spellcheck="false" />
              </label>
              <label class="field export__url">
                <span class="field__label">{{ m.mapArt.export.imageUrl }}</span>
                <input
                  v-model="imageUrl"
                  class="input"
                  type="url"
                  placeholder="https://"
                  spellcheck="false"
                />
              </label>
            </div>
            <div class="terminal">
              <code class="terminal__line">{{ command }}</code>
              <button
                type="button"
                class="terminal__copy"
                :class="{ 'terminal__copy--done': copied }"
                @click="copyCommand"
              >
                <component
                  :is="copied ? PhCheck : PhCopy"
                  :size="16"
                  weight="bold"
                  aria-hidden="true"
                />
                {{ copied ? m.mapArt.export.copied : m.mapArt.export.copy }}
              </button>
            </div>
          </div>
        </StepSection>
      </section>
    </div>
  </main>
</template>

<style scoped>
.map-art {
  display: grid;
  gap: 32px;
  width: var(--page-width);
  margin: 0 auto;
  padding: 40px 0 80px;
}

.map-art__layout {
  display: grid;
  grid-template-columns: minmax(320px, 380px) minmax(0, 1fr);
  align-items: start;
  gap: 20px;
}

.map-art__controls,
.map-art__stage {
  display: grid;
  gap: 16px;
}

.control-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

/* 空预览：一面还没挂地图的墙。 */
.stage__empty {
  display: grid;
  justify-items: center;
  gap: 16px;
  padding: 56px 16px;
  border-radius: 8px;
  background: var(--color-surface-raised);
  color: var(--color-muted);
  text-align: center;
}

.stage__empty-wall {
  display: grid;
  grid-template-columns: repeat(3, 44px);
  gap: 6px;
}

.stage__empty-wall > span {
  height: 44px;
  border: 2px dashed var(--color-border);
  border-radius: 3px;
}

/* 统计像站牌上的信息格：小标签在上，粗体等宽数字在下。 */
.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0;
  border: var(--border-plate);
  border-radius: 8px;
  overflow: hidden;
  transition: opacity var(--duration-feedback) ease;
}

.stats--working {
  opacity: 0.55;
}

.stats div {
  padding: 10px 14px;
}

.stats div + div {
  border-left: var(--border-plate);
}

.stats dt {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-muted);
}

.stats dd {
  margin: 0;
  font-family: var(--font-fetarute-display);
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}

.stats__aside {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-muted);
}

.export__row {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 12px;
}

.export__row .field {
  flex: 1 1 180px;
}

.export__url {
  flex-grow: 3 !important;
}

.export__download {
  min-height: 40px;
}

.export__command-block {
  display: grid;
  gap: 12px;
  padding-top: 18px;
  border-top: 1px solid var(--color-border);
}

.export__subtitle {
  font-size: 15px;
  font-weight: 790;
}

/* 命令行：像游戏聊天栏一样的深色条，复制按钮在右侧。 */
.terminal {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 6px 6px 14px;
  border-radius: 8px;
  background: var(--color-action);
  color: var(--color-action-text);
}

.terminal__line {
  flex: 1 1 auto;
  min-width: 0;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 14px;
  white-space: nowrap;
  scrollbar-width: none;
}

.terminal__copy {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  padding: 0 12px;
  border: 0;
  border-radius: 5px;
  background: color-mix(in srgb, var(--color-action-text) 14%, transparent);
  color: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color var(--duration-feedback) ease,
    transform var(--duration-press) var(--ease-out);
}

.terminal__copy:active {
  transform: scale(0.96);
}

.terminal__copy--done {
  background: var(--color-status-ok);
  color: var(--color-status-ok-text);
}

.terminal__copy:focus-visible {
  outline-color: var(--color-action-text);
}

@media (hover: hover) and (pointer: fine) {
  .terminal__copy:not(.terminal__copy--done):hover {
    background: color-mix(in srgb, var(--color-action-text) 24%, transparent);
  }
}

@media (max-width: 1023px) {
  .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .stats div:nth-child(3) {
    border-left: 0;
  }

  .stats div:nth-child(n + 3) {
    border-top: var(--border-plate);
  }
}

@media (max-width: 900px) {
  .map-art {
    padding: 28px 0 64px;
  }

  .map-art__layout {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
