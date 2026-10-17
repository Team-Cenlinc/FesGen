<script setup lang="ts">
/** 颜色牌：色块 + 十六进制色号，点一下打开系统取色器。和牌子上的线路色牌同形。 */
defineProps<{ label: string }>();
const model = defineModel<string>({ required: true });
</script>

<template>
  <label class="chip">
    <span class="chip__swatch" :style="{ background: model }" aria-hidden="true" />
    <span class="chip__hex">{{ model.toUpperCase() }}</span>
    <input v-model="model" class="chip__input" type="color" :aria-label="label" />
  </label>
</template>

<style scoped>
.chip {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 40px;
  border: var(--border-plate);
  border-radius: 8px;
  background: var(--color-surface-raised);
  overflow: hidden;
  cursor: pointer;
  transition: transform var(--duration-press) var(--ease-out);
}

.chip:active {
  transform: scale(0.97);
}

.chip__swatch {
  align-self: stretch;
  width: 36px;
  border-right: var(--border-plate);
}

.chip__hex {
  padding: 0 12px;
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

/* 原生取色器铺满整个颜色牌但不可见，点哪里都能打开。 */
.chip__input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.chip:has(.chip__input:focus-visible) {
  outline: 2px solid var(--color-text);
  outline-offset: 2px;
}
</style>
