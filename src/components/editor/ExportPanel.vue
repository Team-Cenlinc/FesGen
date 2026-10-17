<script setup lang="ts">
import { PhCheck, PhCopy, PhDownloadSimple, PhX } from "@phosphor-icons/vue";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import SegmentedControl from "@/components/SegmentedControl.vue";
import TypeText from "@/components/TypeText.vue";
import { format, messages as m } from "@/i18n";
import { exportSignJson } from "@/library/io";
import { gridLabel, gridPixelSize } from "@/mapart/grid";
import { imageFrameCreateCommand } from "@/mapart/imageFrame";
import { encodePng } from "@/mapart/raster";
import { signToBlob, signToMapArt } from "@/signs/rasterize";
import { renderTreeToSvg, type RenderTree } from "@/signs/render";
import type { SignDocument } from "@/signs/types";
import { downloadBlob, safeFileName } from "@/utils/download";

/** 导出：PNG / JPG（按倍率重新渲染矢量）、SVG、地图画 PNG、JSON。 */
const props = defineProps<{ doc: SignDocument; tree: RenderTree }>();
const emit = defineEmits<{ close: [] }>();

type Format = "png" | "jpg" | "svg" | "map" | "json";
const formatOptions: { value: Format; label: string }[] = [
  { value: "png", label: "PNG" },
  { value: "jpg", label: "JPG" },
  { value: "svg", label: "SVG" },
  { value: "map", label: m.editor.viewMapArt },
  { value: "json", label: "JSON" },
];
const scaleOptions = [
  { value: 1, label: "1×" },
  { value: 2, label: "2×" },
  { value: 4, label: "4×" },
];

const formatChoice = ref<Format>("png");
const scale = ref(props.doc.size.mode === "grid" ? 4 : 1);
const quality = ref(92);
const fileName = ref(safeFileName(props.doc.name));
const busy = ref(false);
const error = ref<string | null>(null);
const copied = ref(false);

const mapGrid = computed(() =>
  props.doc.size.mode === "grid" ? props.doc.size.grid : props.doc.mapArt.gridForFree,
);
const mapPixels = computed(() => gridPixelSize(mapGrid.value));
const outputSize = computed(
  () =>
    `${Math.round(props.tree.width * scale.value)} × ${Math.round(props.tree.height * scale.value)} px`,
);
const command = computed(() => imageFrameCreateCommand(props.doc.name, "", mapGrid.value));

async function download() {
  busy.value = true;
  error.value = null;
  const base = safeFileName(fileName.value, safeFileName(props.doc.name));
  try {
    switch (formatChoice.value) {
      case "png":
        downloadBlob(
          await signToBlob(props.tree, props.doc.lighting, scale.value, "image/png"),
          `${base}.png`,
        );
        break;
      case "jpg":
        downloadBlob(
          await signToBlob(
            props.tree,
            props.doc.lighting,
            scale.value,
            "image/jpeg",
            quality.value / 100,
          ),
          `${base}.jpg`,
        );
        break;
      case "svg":
        downloadBlob(
          new Blob([renderTreeToSvg(props.tree, { lighting: props.doc.lighting })], {
            type: "image/svg+xml",
          }),
          `${base}.svg`,
        );
        break;
      case "map": {
        const art = await signToMapArt(
          props.tree,
          props.doc.lighting,
          props.doc.size,
          props.doc.mapArt,
        );
        downloadBlob(
          await encodePng(art.image),
          `${base}-${art.grid.rows}x${art.grid.columns}.png`,
        );
        break;
      }
      case "json":
        downloadBlob(
          new Blob([exportSignJson(props.doc)], { type: "application/json" }),
          `${base}.json`,
        );
        break;
    }
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : String(cause);
  } finally {
    busy.value = false;
  }
}

let copiedTimer: ReturnType<typeof setTimeout> | undefined;
async function copyCommand() {
  await navigator.clipboard.writeText(command.value);
  copied.value = true;
  clearTimeout(copiedTimer);
  copiedTimer = setTimeout(() => (copied.value = false), 1500);
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === "Escape") emit("close");
}
onMounted(() => document.addEventListener("keydown", onKeyDown));
onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKeyDown);
  clearTimeout(copiedTimer);
});
</script>

<template>
  <div class="export-backdrop" @click.self="emit('close')">
    <section class="export" role="dialog" aria-labelledby="export-title" aria-modal="true">
      <header class="export__head">
        <h2 id="export-title" class="export__title">{{ m.exporting.title }}</h2>
        <button
          type="button"
          class="export__close"
          :aria-label="m.exporting.close"
          @click="emit('close')"
        >
          <PhX :size="20" weight="bold" aria-hidden="true" />
        </button>
      </header>

      <div class="export__row">
        <span class="field__label">{{ m.exporting.format }}</span>
        <SegmentedControl
          v-model="formatChoice"
          :options="formatOptions"
          :label="m.exporting.format"
        />
      </div>

      <template v-if="formatChoice === 'png' || formatChoice === 'jpg'">
        <div class="export__row">
          <span class="field__label">{{ m.exporting.scale }}</span>
          <span class="export__inline">
            <SegmentedControl
              v-model="scale"
              size="sm"
              :options="scaleOptions"
              :label="m.exporting.scale"
            />
            <span class="hint"><TypeText :text="outputSize" /></span>
          </span>
        </div>
        <label v-if="formatChoice === 'jpg'" class="export__row">
          <span class="field__label">{{ m.exporting.quality }}</span>
          <span class="export__inline">
            <input
              v-model.number="quality"
              class="export__range"
              type="range"
              min="10"
              max="100"
              step="1"
            />
            <span class="export__value">{{ quality }}</span>
          </span>
        </label>
      </template>
      <template v-else-if="formatChoice === 'map'">
        <p class="hint">
          <TypeText
            :text="
              format(m.exporting.mapArtHint, {
                grid: gridLabel(mapGrid),
                size: `${mapPixels.width} × ${mapPixels.height} px`,
              })
            "
          />
        </p>
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
      </template>
      <p v-else-if="formatChoice === 'svg'" class="hint">{{ m.exporting.svgHint }}</p>
      <p v-else class="hint">{{ m.exporting.jsonHint }}</p>

      <label class="field">
        <span class="field__label">{{ m.exporting.fileName }}</span>
        <input v-model="fileName" class="input" type="text" spellcheck="false" />
      </label>

      <p v-if="error" class="export__error" role="alert">{{ error }}</p>

      <button
        type="button"
        class="button button--primary export__download"
        :disabled="busy"
        @click="download"
      >
        <PhDownloadSimple :size="18" weight="bold" aria-hidden="true" />
        {{ m.exporting.download }}
      </button>
    </section>
  </div>
</template>

<style scoped>
.export-backdrop {
  position: fixed;
  z-index: 40;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgb(10 12 13 / 0.42);
}

.export {
  display: grid;
  gap: 16px;
  width: min(520px, 100%);
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  padding: 24px;
  border: var(--border-sign);
  background: var(--color-surface);
  box-shadow: var(--shadow-feedback);
  transition:
    opacity 180ms var(--ease-out),
    transform 180ms var(--ease-out);

  @starting-style {
    opacity: 0;
    transform: scale(0.97);
  }
}

.export__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.export__title {
  font-size: 22px;
  font-weight: 790;
  letter-spacing: -0.03em;
}

.export__close {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 0;
  border-radius: var(--radius-control);
  background: transparent;
  cursor: pointer;
}

.export__row {
  display: grid;
  gap: 8px;
}

.export__inline {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.export__range {
  flex: 1 1 180px;
  accent-color: var(--color-text);
}

.export__value {
  min-width: 3ch;
  font-family: var(--font-fetarute-display);
  font-weight: 790;
  font-variant-numeric: tabular-nums;
}

.export__error {
  padding: 8px 12px;
  border-left: 4px solid var(--color-status-error);
  background: color-mix(in srgb, var(--color-status-error) 10%, transparent);
  font-size: 14px;
  font-weight: 650;
}

.export__download {
  justify-self: start;
}

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
  font-size: 13px;
  white-space: nowrap;
  scrollbar-width: none;
}

.terminal__copy {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 6px;
  min-height: 30px;
  padding: 0 10px;
  border: 0;
  border-radius: 5px;
  background: color-mix(in srgb, var(--color-action-text) 14%, transparent);
  color: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.terminal__copy--done {
  background: var(--color-status-ok);
  color: var(--color-status-ok-text);
}

@media (hover: hover) and (pointer: fine) {
  .export__close:hover {
    background: color-mix(in srgb, var(--color-text) 8%, transparent);
  }
}
</style>
