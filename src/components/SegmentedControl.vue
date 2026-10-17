<script setup lang="ts" generic="T extends string | number">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import TypeText from "./TypeText.vue";

/**
 * 互斥选项。选中项是一块反白的牌面，切换时牌面滑到新位置；
 * 用键盘切换时直接跳过去，不播放动画（键盘操作频繁，动画只会显得迟钝）。
 * 放得下时各项等宽（取最宽的一项），牌面滑动时宽度不跳，“适应 1× 2×”这样中西混排的一组也排得齐。
 */
const props = withDefaults(
  defineProps<{
    options: readonly { value: T; label: string }[];
    label: string;
    size?: "md" | "sm";
  }>(),
  { size: "md" },
);

const model = defineModel<T>({ required: true });

const root = ref<HTMLElement>();
const buttons: HTMLButtonElement[] = [];
const plate = ref({ x: 0, width: 0, visible: false });
// 首次定位和键盘切换都不播放滑动。
const instant = ref(true);

function measure() {
  const index = props.options.findIndex((option) => option.value === model.value);
  const button = buttons[index];
  if (!button) {
    plate.value = { ...plate.value, visible: false };
    return;
  }
  plate.value = { x: button.offsetLeft, width: button.offsetWidth, visible: true };
}

function select(value: T, fromKeyboard = false) {
  instant.value = fromKeyboard;
  model.value = value;
}

function onKeyDown(event: KeyboardEvent) {
  const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
  if (!step) return;
  event.preventDefault();
  const current = props.options.findIndex((option) => option.value === model.value);
  const next = (current + step + props.options.length) % props.options.length;
  select(props.options[next]!.value, true);
  nextTick(() => buttons[next]?.focus());
}

watch([model, () => props.options], () => nextTick(measure));

let observer: ResizeObserver | undefined;
onMounted(() => {
  measure();
  observer = new ResizeObserver(() => {
    instant.value = true;
    measure();
  });
  if (root.value) observer.observe(root.value);
  // 首帧定位完成后再允许点击切换时的滑动。
  requestAnimationFrame(() => (instant.value = false));
});
onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <div
    ref="root"
    class="segmented"
    :class="`segmented--${size}`"
    role="radiogroup"
    :aria-label="label"
    @keydown="onKeyDown"
  >
    <span
      class="segmented__plate"
      :class="{ 'segmented__plate--instant': instant }"
      :style="{
        width: `${plate.width}px`,
        transform: `translateX(${plate.x}px)`,
        opacity: plate.visible ? 1 : 0,
      }"
      aria-hidden="true"
    />
    <button
      v-for="(option, index) in options"
      :key="String(option.value)"
      :ref="(el) => (buttons[index] = el as HTMLButtonElement)"
      type="button"
      role="radio"
      class="segmented__option"
      :aria-checked="model === option.value"
      :tabindex="model === option.value ? 0 : -1"
      @click="select(option.value)"
    >
      <TypeText :text="option.label" />
    </button>
  </div>
</template>

<style scoped>
.segmented {
  position: relative;
  display: inline-grid;
  /* 放得下时各项等宽；放不下时每项至少保留自己的内容宽，不会把整组撑出容器。 */
  grid-auto-columns: minmax(max-content, 1fr);
  grid-auto-flow: column;
  max-width: 100%;
  padding: 3px;
  border: var(--border-plate);
  border-radius: 8px;
  background: var(--color-surface-raised);
  isolation: isolate;
}

.segmented__plate {
  position: absolute;
  z-index: -1;
  top: 3px;
  bottom: 3px;
  left: 0;
  border-radius: 5px;
  background: var(--color-text);
  transition:
    transform var(--duration-move) var(--ease-out),
    width var(--duration-move) var(--ease-out);
}

.segmented__plate--instant {
  transition: none;
}

/* 汉字减一点字重、西文和数字放大一点，两种文字在同一组里看起来一样大、一样黑。 */
.segmented__option {
  --type-cjk-weight: 620;
  --type-latin-size: 1.075em;
  min-height: 34px;
  padding: 0 14px;
  border: 0;
  border-radius: 5px;
  background: transparent;
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
  white-space: nowrap;
  cursor: pointer;
  transition: color var(--duration-feedback) ease;
}

.segmented--sm .segmented__option {
  min-height: 28px;
  padding: 0 10px;
  font-size: 13px;
}

.segmented__option[aria-checked="true"] {
  color: var(--color-surface);
}

.segmented__option:focus-visible {
  outline-offset: 1px;
}

@media (hover: hover) and (pointer: fine) {
  .segmented__option[aria-checked="false"]:hover {
    background: color-mix(in srgb, var(--color-text) 8%, transparent);
  }
}

@media (prefers-reduced-motion: reduce) {
  .segmented__plate {
    transition: none;
  }
}
</style>
