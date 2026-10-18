<script setup lang="ts">
import { PhPlus } from "@phosphor-icons/vue";
import { computed } from "vue";
import { messages as m } from "@/i18n";
import { renderTreeToSvg, type Affordance, type RenderTree } from "@/signs/render";
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
const emit = defineEmits<{ select: [id: string | null]; action: [affordance: Affordance] }>();

// SVG 只由数字、校验过的颜色和路径数据拼成，不含任何用户输入的原文，可以安全地内联。
const svg = computed(() => renderTreeToSvg(props.tree, { lighting: props.lighting }));
/** 点选区域：先是模块，再是模块里的列表项（例如每段色带），列表项盖在模块上面，点哪段选哪段。 */
const hitAreas = computed(() => [
  ...Object.entries(props.tree.modules).map(([id, box]) => ({
    id,
    x: box.x - 3,
    y: box.y - 3,
    width: box.width + 6,
    height: box.height + 6,
  })),
  ...Object.entries(props.tree.items ?? {}).map(([id, box]) => ({ id, ...box })),
]);

/**
 * 牌面快捷按钮：锚点按牌子的百分比换算，按钮本身离锚点的距离用固定的屏幕像素（见样式），
 * 牌面缩放时按钮跟着锚点走，但不会越缩越远、跑出舞台。
 */
const affordances = computed(() =>
  (props.tree.affordances ?? []).map((item) => ({
    item,
    right: `${(1 - item.x / props.tree.width) * 100}%`,
    top: `${(item.y / props.tree.height) * 100}%`,
  })),
);

function labelOf(id: string): string {
  const [moduleId, index] = id.split("#");
  const label = props.labels[moduleId!] ?? moduleId!;
  return index === undefined ? label : `${label} · 第 ${Number(index) + 1} 项`;
}
</script>

<template>
  <div class="sign-canvas" @click.self="emit('select', null)">
    <div
      class="sign-canvas__frame"
      :style="{
        aspectRatio: `${tree.width} / ${tree.height}`,
        maxWidth: `${Math.max(tree.width, 900)}px`,
        // 竖条、方形牌子按高度收住，整块牌子和下面的按钮不用滚动就能看全。
        width: `min(100%, calc(62vh * ${tree.width / tree.height}))`,
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
          <title>{{ labelOf(area.id) }}</title>
        </rect>
      </svg>
      <button
        v-for="{ item, right, top } in affordances"
        :key="item.action"
        type="button"
        class="button button--small sign-canvas__affordance"
        :class="`sign-canvas__affordance--${item.placement}`"
        :style="{ right, top }"
        @click.stop="emit('action', item)"
      >
        <PhPlus :size="14" weight="bold" aria-hidden="true" />
        {{ item.label }}
      </button>
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

/*
 * 牌面快捷按钮（例如“添加线路”）：用和其他按钮一样的小号牌面按钮，带文字，不靠一个孤零零的“+”。
 * below-end：右边缘对齐锚点，挂在锚点下方 6px；舞台下边留了 40px，放得下 32px 高的按钮。
 */
.sign-canvas__affordance {
  position: absolute;
  z-index: 1;
  gap: 6px;
  font-size: 13px;
}

.sign-canvas__affordance--below-end {
  margin-top: 6px;
}

@media (hover: hover) and (pointer: fine) {
  .sign-canvas__hit:not(.sign-canvas__hit--selected):hover {
    stroke: color-mix(in srgb, var(--color-service) 70%, transparent);
  }
}
</style>
