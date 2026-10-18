<script setup lang="ts">
import { computed } from "vue";
import NumberStepper from "@/components/NumberStepper.vue";
import TypeText from "@/components/TypeText.vue";
import { messages as m } from "@/i18n";
import {
  GRID_PRESETS,
  gridLabel,
  gridPixelSize,
  MAX_GRID_SIDE,
  sameGrid,
  type MapGrid,
} from "@/mapart/grid";

/**
 * 选地图格子。每个预设画成一面挂着地图的墙：一格就是一张 128×128 的地图，
 * 选中后整块反白；其余尺寸用行、列步进器自定义。
 */
const props = defineProps<{ suggested?: MapGrid }>();
const grid = defineModel<MapGrid>({ required: true });

const pixelSize = computed(() => gridPixelSize(grid.value));
const rows = computed({
  get: () => grid.value.rows,
  set: (rows: number) => (grid.value = { ...grid.value, rows }),
});
const columns = computed({
  get: () => grid.value.columns,
  set: (columns: number) => (grid.value = { ...grid.value, columns }),
});
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
        <span class="grid-picker__wall" aria-hidden="true">
          <span
            class="grid-picker__tiles"
            :style="{
              gridTemplateColumns: `repeat(${preset.columns}, 9px)`,
              gridTemplateRows: `repeat(${preset.rows}, 9px)`,
            }"
          >
            <span v-for="cell in preset.rows * preset.columns" :key="cell" />
          </span>
        </span>
        <span class="grid-picker__label"><TypeText :text="gridLabel(preset)" /></span>
      </button>
    </div>

    <div class="grid-picker__custom">
      <div class="grid-picker__side">
        <span class="field__label">{{ m.mapArt.grid.rows }}</span>
        <NumberStepper v-model="rows" :min="1" :max="MAX_GRID_SIDE" :label="m.mapArt.grid.rows" />
      </div>
      <span class="grid-picker__times times-separator" aria-hidden="true">×</span>
      <div class="grid-picker__side">
        <span class="field__label">{{ m.mapArt.grid.columns }}</span>
        <NumberStepper
          v-model="columns"
          :min="1"
          :max="MAX_GRID_SIDE"
          :label="m.mapArt.grid.columns"
        />
      </div>
      <span class="grid-picker__size">
        <TypeText :text="`${pixelSize.width} × ${pixelSize.height} px`" />
      </span>
    </div>

    <button
      v-if="props.suggested && !sameGrid(props.suggested, grid)"
      type="button"
      class="grid-picker__suggest"
      @click="grid = { ...props.suggested }"
    >
      {{ m.mapArt.grid.suggested }}
      <span class="grid-picker__suggest-value"
        ><TypeText :text="gridLabel(props.suggested)"
      /></span>
    </button>
  </div>
</template>

<style scoped>
.grid-picker {
  display: grid;
  gap: 16px;
}

.grid-picker__presets {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
}

.grid-picker__preset {
  display: grid;
  grid-template-rows: 32px auto;
  justify-items: center;
  align-items: center;
  gap: 6px;
  padding: 10px 4px 8px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface-raised);
  cursor: pointer;
  transition:
    border-color var(--duration-feedback) ease,
    transform var(--duration-press) var(--ease-out);
}

.grid-picker__preset:active {
  transform: scale(0.96);
}

.grid-picker__tiles {
  display: grid;
  gap: 2px;
}

/* 每格是一张挂在墙上的地图：空心描边，选中时填实。 */
.grid-picker__tiles > span {
  border: 1.5px solid currentColor;
  border-radius: 1.5px;
  background: transparent;
  transition: background-color var(--duration-feedback) ease;
}

.grid-picker__label {
  font-family: var(--font-fetarute-display);
  font-size: 13px;
  font-weight: 790;
  font-variant-numeric: tabular-nums;
}

.grid-picker__preset[aria-checked="true"] {
  border-color: var(--color-action);
  background: var(--color-action);
  color: var(--color-action-text);
}

.grid-picker__preset[aria-checked="true"] .grid-picker__tiles > span {
  background: currentColor;
}

@media (hover: hover) and (pointer: fine) {
  .grid-picker__preset:hover {
    border-color: var(--color-text);
  }
}

.grid-picker__custom {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 8px 10px;
}

.grid-picker__side {
  display: grid;
  gap: 6px;
}

/* 乘号在 40px 高的步进器中线上居中。 */
.grid-picker__times {
  display: grid;
  height: 40px;
  place-items: center;
}

.grid-picker__size {
  margin-left: auto;
  padding-bottom: 10px;
  font-family: var(--font-fetarute-display);
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-muted);
}

.grid-picker__suggest {
  display: inline-flex;
  align-items: center;
  justify-self: start;
  gap: 8px;
  padding: 4px 4px 4px 12px;
  border: 1px dashed var(--color-text);
  border-radius: var(--radius-pill);
  background: transparent;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: transform var(--duration-press) var(--ease-out);
}

.grid-picker__suggest:active {
  transform: scale(0.97);
}

.grid-picker__suggest-value {
  padding: 2px 10px;
  border-radius: var(--radius-pill);
  background: var(--color-action);
  color: var(--color-action-text);
  font-family: var(--font-fetarute-display);
  font-weight: 790;
}
</style>
