<script setup lang="ts">
import { computed } from "vue";
import { messages as m } from "@/i18n";
import {
  clampGridSide,
  GRID_PRESETS,
  gridLabel,
  gridPixelSize,
  MAX_GRID_SIDE,
  sameGrid,
  type MapGrid,
} from "@/mapart/grid";

/** 选地图格子：常用预设一键选，其余用行列数自定义。 */
const props = defineProps<{ suggested?: MapGrid }>();
const grid = defineModel<MapGrid>({ required: true });

const isPreset = computed(() => GRID_PRESETS.some((preset) => sameGrid(preset, grid.value)));
const pixelSize = computed(() => gridPixelSize(grid.value));

function setSide(side: "rows" | "columns", event: Event) {
  const value = clampGridSide(Number((event.target as HTMLInputElement).value));
  grid.value = { ...grid.value, [side]: value };
}
</script>

<template>
  <div class="grid-picker">
    <div class="grid-picker__presets" role="radiogroup" :aria-label="m.mapArt.grid.heading">
      <button
        v-for="preset in GRID_PRESETS"
        :key="gridLabel(preset)"
        type="button"
        role="radio"
        class="grid-picker__preset"
        :aria-checked="sameGrid(preset, grid)"
        @click="grid = { ...preset }"
      >
        <span
          class="grid-picker__glyph"
          :style="{
            gridTemplateColumns: `repeat(${preset.columns}, 8px)`,
            gridTemplateRows: `repeat(${preset.rows}, 8px)`,
          }"
          aria-hidden="true"
        >
          <span v-for="cell in preset.rows * preset.columns" :key="cell" />
        </span>
        {{ gridLabel(preset) }}
      </button>
    </div>

    <div class="grid-picker__custom" :class="{ 'grid-picker__custom--active': !isPreset }">
      <label class="field">
        <span class="field__label">{{ m.mapArt.grid.rows }}</span>
        <input
          class="input"
          type="number"
          min="1"
          :max="MAX_GRID_SIDE"
          :value="grid.rows"
          @change="setSide('rows', $event)"
        />
      </label>
      <span class="grid-picker__times" aria-hidden="true">×</span>
      <label class="field">
        <span class="field__label">{{ m.mapArt.grid.columns }}</span>
        <input
          class="input"
          type="number"
          min="1"
          :max="MAX_GRID_SIDE"
          :value="grid.columns"
          @change="setSide('columns', $event)"
        />
      </label>
      <span class="grid-picker__size">{{ pixelSize.width }} × {{ pixelSize.height }} px</span>
    </div>

    <button
      v-if="props.suggested && !sameGrid(props.suggested, grid)"
      type="button"
      class="button button--small"
      @click="grid = { ...props.suggested }"
    >
      {{ m.mapArt.grid.suggested }}：{{ gridLabel(props.suggested) }}
    </button>
  </div>
</template>

<style scoped>
.grid-picker {
  display: grid;
  justify-items: start;
  gap: 12px;
}

.grid-picker__presets {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
  width: 100%;
}

.grid-picker__preset {
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 6px;
  min-height: 64px;
  padding: 8px 4px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  background: var(--color-surface-raised);
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
}

.grid-picker__preset:hover {
  border-color: var(--color-text);
}

.grid-picker__preset[aria-checked="true"] {
  border-color: var(--color-action);
  background: var(--color-action);
  color: var(--color-action-text);
}

.grid-picker__glyph {
  display: grid;
  gap: 2px;
}

.grid-picker__glyph > span {
  background: currentColor;
}

.grid-picker__custom--active .input {
  border-color: var(--color-text);
}

.grid-picker__custom {
  display: grid;
  grid-template-columns: 72px auto 72px 1fr;
  align-items: end;
  gap: 8px;
  width: 100%;
}

.grid-picker__times {
  padding-bottom: 8px;
  font-weight: 700;
}

.grid-picker__size {
  padding-bottom: 8px;
  font-size: 13px;
  color: var(--color-muted);
  font-variant-numeric: tabular-nums;
  text-align: right;
}
</style>
