<script setup lang="ts">
import { PhMinus, PhPlus } from "@phosphor-icons/vue";
import { messages as m } from "@/i18n";

/** 站号牌式的整数步进器：中间是可直接输入的号码，两侧加减；方向键也能调。 */
const props = withDefaults(defineProps<{ min?: number; max?: number; label: string }>(), {
  min: 1,
  max: 99,
});

const model = defineModel<number>({ required: true });

function set(value: number) {
  if (!Number.isFinite(value)) return;
  model.value = Math.min(props.max, Math.max(props.min, Math.round(value)));
}

function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
  set(Number(target.value));
  // 输入非法时把显示值改回当前值。
  target.value = String(model.value);
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === "ArrowUp") {
    event.preventDefault();
    set(model.value + 1);
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    set(model.value - 1);
  }
}
</script>

<template>
  <div class="stepper" role="group" :aria-label="label">
    <button
      type="button"
      class="stepper__button"
      :aria-label="`${label}：${m.controls.decrease}`"
      :aria-disabled="model <= min"
      @click="set(model - 1)"
    >
      <PhMinus :size="16" weight="bold" aria-hidden="true" />
    </button>
    <input
      class="stepper__value"
      type="text"
      inputmode="numeric"
      :aria-label="label"
      :value="model"
      @change="onInput"
      @keydown="onKeyDown"
    />
    <button
      type="button"
      class="stepper__button"
      :aria-label="`${label}：${m.controls.increase}`"
      :aria-disabled="model >= max"
      @click="set(model + 1)"
    >
      <PhPlus :size="16" weight="bold" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
.stepper {
  display: inline-grid;
  grid-template-columns: 34px 44px 34px;
  height: 40px;
  border: var(--border-plate);
  border-radius: 8px;
  background: var(--color-surface-raised);
  overflow: hidden;
}

.stepper__button {
  display: grid;
  place-items: center;
  border: 0;
  background: transparent;
  cursor: pointer;
  transition: background-color var(--duration-feedback) ease;
}

.stepper__button:active svg {
  transform: scale(0.85);
}

.stepper__button svg {
  transition: transform var(--duration-press) var(--ease-out);
}

.stepper__button[aria-disabled="true"] {
  color: var(--color-border);
  cursor: default;
}

.stepper__button:focus-visible,
.stepper__value:focus-visible {
  outline: 2px solid var(--color-text);
  outline-offset: -4px;
}

/* 中间的号码像站号牌：等宽数字、粗体，两侧有牌框分隔线。 */
.stepper__value {
  width: 100%;
  min-width: 0;
  border: 0;
  border-inline: var(--border-plate);
  background: transparent;
  font-family: var(--font-fetarute-display);
  font-size: 18px;
  font-weight: 790;
  font-variant-numeric: tabular-nums;
  text-align: center;
}

@media (hover: hover) and (pointer: fine) {
  .stepper__button:not([aria-disabled="true"]):hover {
    background: color-mix(in srgb, var(--color-text) 8%, transparent);
  }
}
</style>
