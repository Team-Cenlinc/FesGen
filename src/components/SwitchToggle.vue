<script setup lang="ts">
/** 灯箱开关：开启时轨道反白成文字色，和分段选择的选中牌面一致。 */
const model = defineModel<boolean>({ required: true });
</script>

<template>
  <label class="switch">
    <input v-model="model" class="switch__input" type="checkbox" role="switch" />
    <span class="switch__track" aria-hidden="true"><span class="switch__knob" /></span>
    <span class="switch__label"><slot /></span>
  </label>
</template>

<style scoped>
.switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  user-select: none;
}

.switch__input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.switch__track {
  position: relative;
  width: 40px;
  height: 24px;
  flex: 0 0 auto;
  border: var(--border-plate);
  border-radius: var(--radius-pill);
  background: var(--color-surface-raised);
  transition: background-color var(--duration-feedback) ease;
}

.switch__knob {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-text);
  transition: transform var(--duration-move) var(--ease-out);
}

.switch__input:checked + .switch__track {
  background: var(--color-text);
}

.switch__input:checked + .switch__track .switch__knob {
  background: var(--color-surface);
  transform: translateX(16px);
}

.switch__input:focus-visible + .switch__track {
  outline: 2px solid var(--color-text);
  outline-offset: 2px;
}

.switch:active .switch__knob {
  width: 17px;
}

.switch:active .switch__input:checked + .switch__track .switch__knob {
  transform: translateX(13px);
}

@media (prefers-reduced-motion: reduce) {
  .switch__knob {
    transition: none;
  }
}
</style>
