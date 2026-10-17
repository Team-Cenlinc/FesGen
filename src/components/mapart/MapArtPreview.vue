<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import type { MapGrid } from "@/mapart/grid";
import type { RgbaImage } from "@/mapart/quantize";
import { paintImage } from "@/mapart/raster";

/**
 * 按像素放大显示位图（不做平滑），可叠加每张地图的分格线。
 * zoom 为 0 时自适应容器宽度，其余为整数倍放大。
 */
const props = defineProps<{
  image: RgbaImage;
  grid: MapGrid;
  zoom: number;
  showGrid: boolean;
  label: string;
}>();

const canvas = ref<HTMLCanvasElement>();

watchEffect(() => {
  if (canvas.value) paintImage(canvas.value, props.image);
});

const frameStyle = computed(() => {
  const ratio = `${props.image.width} / ${props.image.height}`;
  return props.zoom === 0
    ? { aspectRatio: ratio, width: "100%", maxWidth: `${props.image.width * 8}px` }
    : { aspectRatio: ratio, width: `${props.image.width * props.zoom}px` };
});

const gridStyle = computed(() => ({
  backgroundSize: `calc(100% / ${props.grid.columns}) calc(100% / ${props.grid.rows})`,
}));
</script>

<template>
  <div class="preview">
    <div class="preview__frame" :style="frameStyle">
      <canvas ref="canvas" class="preview__canvas" role="img" :aria-label="label" />
      <div v-if="showGrid" class="preview__grid" :style="gridStyle" aria-hidden="true" />
    </div>
  </div>
</template>

<style scoped>
.preview {
  overflow: auto;
  max-height: 70vh;
  padding: 16px;
  border-radius: var(--radius-control);
  /* 棋盘格底，透明像素一眼可见。 */
  background-color: var(--color-surface-raised);
  background-image:
    linear-gradient(45deg, var(--color-border) 25%, transparent 25%),
    linear-gradient(-45deg, var(--color-border) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--color-border) 75%),
    linear-gradient(-45deg, transparent 75%, var(--color-border) 75%);
  background-position:
    0 0,
    0 8px,
    8px -8px,
    -8px 0;
  background-size: 16px 16px;
}

.preview__frame {
  position: relative;
  margin: 0 auto;
}

.preview__canvas {
  display: block;
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
}

/* 分格线画在每张地图的右边和下边，再补一圈外框。 */
.preview__grid {
  position: absolute;
  inset: 0;
  outline: 1px solid var(--color-service);
  background-image:
    linear-gradient(to right, transparent calc(100% - 1px), var(--color-service) 0),
    linear-gradient(to bottom, transparent calc(100% - 1px), var(--color-service) 0);
  pointer-events: none;
}
</style>
