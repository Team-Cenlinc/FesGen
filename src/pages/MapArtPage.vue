<script setup lang="ts">
import { PhCheck, PhCopy, PhDownloadSimple, PhGridNine } from "@phosphor-icons/vue";
import { computed, onBeforeUnmount, ref, shallowRef, watch } from "vue";
import GridPicker from "@/components/mapart/GridPicker.vue";
import MapArtPreview from "@/components/mapart/MapArtPreview.vue";
import SourceDropzone from "@/components/mapart/SourceDropzone.vue";
import PageTitle from "@/components/PageTitle.vue";
import SegmentedControl from "@/components/SegmentedControl.vue";
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
const zoomOptions = [
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

const suggested = computed(() => (source.value ? suggestGrid(source.value.size) : undefined));
const isExact = computed(() => {
  const exact = source.value ? exactGrid(source.value.size) : null;
  return exact !== null && sameGrid(exact, grid.value);
});
const targetSize = computed(() => gridPixelSize(grid.value));
const shownImage = computed(() => (view.value === "map" ? result.value?.image : fitted.value));
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
  source.value = { bitmap, name: file.name, baseName, size };
}

// 参数一变就重新生成；只保留最后一次请求的结果，连续拖动时不会闪回旧图。
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

async function download() {
  if (!result.value) return;
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
        <section class="panel section">
          <h2 class="section__title">{{ m.mapArt.source.heading }}</h2>
          <SourceDropzone :file-name="source?.name" @file="onFile" />
          <p v-if="source" class="hint">{{ source.size.width }} × {{ source.size.height }} px</p>
          <p v-if="sourceError" class="section__error" role="alert">{{ sourceError }}</p>
        </section>

        <section class="panel section">
          <h2 class="section__title">{{ m.mapArt.grid.heading }}</h2>
          <GridPicker v-model="grid" :suggested="suggested" />
          <p v-if="isExact" class="hint">{{ m.mapArt.grid.exactMatch }}</p>
        </section>

        <section class="panel section">
          <h2 class="section__title">{{ m.mapArt.fit.heading }}</h2>
          <SegmentedControl v-model="fit" :options="fitOptions" :label="m.mapArt.fit.heading" />
          <p v-if="isExact" class="hint">{{ m.mapArt.fit.notNeeded }}</p>
          <div v-else-if="fit === 'contain'" class="section__row">
            <span class="field__label">{{ m.mapArt.fit.padding }}</span>
            <SegmentedControl
              v-model="paddingKind"
              :options="paddingOptions"
              :label="m.mapArt.fit.padding"
            />
            <input
              v-if="paddingKind === 'color'"
              v-model="paddingHex"
              class="section__color"
              type="color"
              :aria-label="m.mapArt.fit.padding"
            />
          </div>
        </section>

        <section class="panel section">
          <h2 class="section__title">{{ m.mapArt.dither.heading }}</h2>
          <SegmentedControl
            v-model="dither"
            :options="ditherOptions"
            :label="m.mapArt.dither.heading"
          />
          <p class="hint">{{ m.mapArt.dither.hint }}</p>
        </section>
      </aside>

      <section class="map-art__stage">
        <div class="panel section">
          <div class="stage__toolbar">
            <h2 class="section__title">{{ m.mapArt.preview.heading }}</h2>
            <SegmentedControl
              v-model="view"
              :options="viewOptions"
              :label="m.mapArt.preview.heading"
            />
            <label class="stage__zoom">
              <span class="field__label">{{ m.mapArt.preview.zoom }}</span>
              <select v-model.number="zoom" class="input">
                <option v-for="option in zoomOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>
            <label class="stage__toggle">
              <input v-model="showGrid" type="checkbox" />
              {{ m.mapArt.preview.gridLines }}
            </label>
          </div>

          <MapArtPreview
            v-if="shownImage"
            :image="shownImage"
            :grid="grid"
            :zoom="zoom"
            :show-grid="showGrid"
            :label="view === 'map' ? m.mapArt.preview.mapArt : m.mapArt.preview.original"
          />
          <p v-else class="stage__empty">{{ m.mapArt.preview.empty }}</p>
          <p v-if="working && source" class="hint" aria-live="polite">
            {{ m.mapArt.preview.working }}
          </p>

          <dl v-if="result" class="stats">
            <div>
              <dt>{{ m.mapArt.stats.size }}</dt>
              <dd>{{ result.image.width }} × {{ result.image.height }} px</dd>
            </div>
            <div>
              <dt>{{ m.mapArt.stats.maps }}</dt>
              <dd>{{ grid.rows * grid.columns }}（{{ gridLabel(grid) }}）</dd>
            </div>
            <div>
              <dt>{{ m.mapArt.stats.colors }}</dt>
              <dd>{{ result.colorsUsed }} / {{ paletteSize }}</dd>
            </div>
            <div>
              <dt>{{ m.mapArt.stats.transparent }}</dt>
              <dd>{{ result.transparentPixels }}</dd>
            </div>
          </dl>
        </div>

        <div class="panel section">
          <h2 class="section__title">{{ m.mapArt.export.heading }}</h2>
          <div class="export__row">
            <label class="field export__name">
              <span class="field__label">{{ m.mapArt.export.fileName }}</span>
              <input v-model="fileName" class="input" type="text" spellcheck="false" />
            </label>
            <button
              type="button"
              class="button button--primary"
              :disabled="!result || working"
              @click="download"
            >
              <PhDownloadSimple :size="18" weight="bold" aria-hidden="true" />
              {{ m.mapArt.export.download }}
            </button>
          </div>

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
          <div class="export__command">
            <code>{{ command }}</code>
            <button type="button" class="button button--small" @click="copyCommand">
              <component :is="copied ? PhCheck : PhCopy" :size="16" aria-hidden="true" />
              {{ copied ? m.mapArt.export.copied : m.mapArt.export.copy }}
            </button>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.map-art {
  display: grid;
  gap: 32px;
  max-width: 1440px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.map-art__layout {
  display: grid;
  grid-template-columns: minmax(300px, 360px) minmax(0, 1fr);
  align-items: start;
  gap: 20px;
}

.map-art__controls,
.map-art__stage {
  display: grid;
  gap: 16px;
}

.section {
  display: grid;
  gap: 14px;
  padding: 20px;
}

.section__title {
  font-size: 17px;
  font-weight: 750;
}

.section__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.section__color {
  width: 44px;
  height: 36px;
  padding: 2px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  background: var(--color-surface-raised);
}

.section__error {
  font-size: 14px;
  font-weight: 650;
  color: var(--color-status-error);
}

.stage__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
}

.stage__toolbar .section__title {
  margin-right: auto;
}

.stage__zoom {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stage__zoom .input {
  width: auto;
}

.stage__toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
}

.stage__empty {
  padding: 64px 16px;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-control);
  color: var(--color-muted);
  text-align: center;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin: 0;
}

.stats div {
  padding: 10px 12px;
  border-left: 3px solid var(--color-text);
  background: var(--color-surface-raised);
}

.stats dt {
  font-size: 12px;
  font-weight: 650;
  color: var(--color-muted);
}

.stats dd {
  margin: 0;
  font-size: 16px;
  font-weight: 750;
  font-variant-numeric: tabular-nums;
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

.export__subtitle {
  margin-top: 8px;
  font-size: 15px;
  font-weight: 750;
}

.export__command {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-control);
  background: var(--color-action);
  color: var(--color-action-text);
}

.export__command code {
  flex: 1 1 auto;
  min-width: 0;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 14px;
  white-space: nowrap;
}

.export__command .button {
  flex: 0 0 auto;
  border-color: var(--color-action-text);
  background: transparent;
  color: inherit;
}

@media (max-width: 900px) {
  .map-art {
    padding: 28px 12px 64px;
  }

  .map-art__layout {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
