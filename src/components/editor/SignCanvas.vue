<script setup lang="ts">
import { computed } from "vue";
import { messages as m } from "@/i18n";
import { renderTreeToSvg, type RenderTree } from "@/signs/render";
import type { Lighting } from "@/signs/types";

/**
 * 牌面：上层是透明的点选区域，下层是渲染好的 SVG。
 * 点模块选中它，点空白处回到“整块牌子”。
 */
const props = defineProps<{
  tree: RenderTree;
  lighting: Lighting;
  selected: string | null;
  labels: Readonly<Record<string, string>>;
}>();
const emit = defineEmits<{ select: [id: string | null] }>();

// SVG 只由数字、校验过的颜色和路径数据拼成，不含任何用户输入的原文，可以安全地内联。
const svg = computed(() => renderTreeToSvg(props.tree, { lighting: props.lighting }));
const hitAreas = computed(() =>
  Object.entries(props.tree.modules).map(([id, box]) => ({
    id,
    x: box.x - 3,
    y: box.y - 3,
    width: box.width + 6,
    height: box.height + 6,
  })),
);
</script>

<template>
  <div class="sign-canvas" @click.self="emit('select', null)">
    <div
      class="sign-canvas__frame"
      :style="{
        aspectRatio: `${tree.width} / ${tree.height}`,
        maxWidth: `${Math.max(tree.width, 900)}px`,
      }"
      @click.self="emit('select', null)"
    >
      <div class="sign-canvas__art" aria-hidden="true" v-html="svg" />
      <svg
        class="sign-canvas__hits"
        :viewBox="`0 0 ${tree.width} ${tree.height}`"
        role="img"
        :aria-label="m.editor.canvasLabel"
        @click.self="emit('select', null)"
      >
        <rect
          v-for="area in hitAreas"
          :key="area.id"
          class="sign-canvas__hit"
          :class="{ 'sign-canvas__hit--selected': selected === area.id }"
          :x="area.x"
          :y="area.y"
          :width="area.width"
          :height="area.height"
          rx="2"
          @click.stop="emit('select', area.id)"
        >
          <title>{{ labels[area.id] ?? area.id }}</title>
        </rect>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.sign-canvas {
  display: grid;
  place-items: center;
  min-height: 320px;
  padding: 40px 32px;
  border-radius: 8px;
  background-color: var(--color-surface-raised);
  background-image: radial-gradient(var(--color-border) 1px, transparent 1px);
  background-size: 16px 16px;
}

.sign-canvas__frame {
  position: relative;
  width: 100%;
  box-shadow:
    0 1px 2px rgb(0 0 0 / 0.16),
    0 10px 30px -12px rgb(0 0 0 / 0.35);
}

.sign-canvas__art,
.sign-canvas__art :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.sign-canvas__hits {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* 点选区域平时不可见，悬停显示细框，选中显示虚线粗框。描边不随牌子缩放。 */
.sign-canvas__hit {
  fill: transparent;
  stroke: transparent;
  stroke-width: 1.5;
  vector-effect: non-scaling-stroke;
  cursor: pointer;
  transition: stroke var(--duration-feedback) ease;
}

.sign-canvas__hit--selected {
  stroke: var(--color-service);
  stroke-width: 2;
  stroke-dasharray: 6 4;
}

@media (hover: hover) and (pointer: fine) {
  .sign-canvas__hit:not(.sign-canvas__hit--selected):hover {
    stroke: color-mix(in srgb, var(--color-service) 70%, transparent);
  }
}
</style>
