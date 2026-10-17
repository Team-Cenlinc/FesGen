<script setup lang="ts" generic="T extends string">
/** 一组互斥选项，用法同单选框组；选中项以 action 色实底标出。 */
defineProps<{
  options: readonly { value: T; label: string }[];
  label: string;
}>();

const model = defineModel<T>({ required: true });
</script>

<template>
  <div class="segmented" role="radiogroup" :aria-label="label">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="radio"
      class="segmented__option"
      :aria-checked="model === option.value"
      @click="model = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.segmented {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 2px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  background: var(--color-background);
}

.segmented__option {
  flex: 1 1 auto;
  min-height: 32px;
  padding: 0 12px;
  border: 0;
  border-radius: calc(var(--radius-control) - 2px);
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color var(--duration-feedback) ease;
}

.segmented__option:hover {
  background: color-mix(in srgb, var(--color-text) 8%, transparent);
}

.segmented__option[aria-checked="true"] {
  background: var(--color-action);
  color: var(--color-action-text);
}
</style>
