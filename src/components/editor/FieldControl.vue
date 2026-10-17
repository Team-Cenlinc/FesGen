<script setup lang="ts">
import ColorChip from "@/components/ColorChip.vue";
import NumberStepper from "@/components/NumberStepper.vue";
import SegmentedControl from "@/components/SegmentedControl.vue";
import SwitchToggle from "@/components/SwitchToggle.vue";
import type { FieldDef } from "@/signs/types";

/** 按字段描述渲染对应的控件；改动通过 update 事件交给编辑器统一提交。 */
defineProps<{ field: FieldDef; value: unknown }>();
const emit = defineEmits<{ update: [value: unknown] }>();
</script>

<template>
  <label v-if="field.type === 'text'" class="field">
    <span class="field__label">{{ field.label }}</span>
    <input
      class="input"
      type="text"
      :value="value"
      :placeholder="field.placeholder"
      spellcheck="false"
      @input="emit('update', ($event.target as HTMLInputElement).value)"
    />
  </label>

  <div v-else-if="field.type === 'color'" class="field-row">
    <span class="field__label">{{ field.label }}</span>
    <ColorChip
      :model-value="String(value)"
      :label="field.label"
      @update:model-value="emit('update', $event.toUpperCase())"
    />
  </div>

  <div v-else-if="field.type === 'toggle'" class="field-row">
    <SwitchToggle :model-value="Boolean(value)" @update:model-value="emit('update', $event)">
      {{ field.label }}
    </SwitchToggle>
  </div>

  <div v-else-if="field.type === 'number'" class="field-row">
    <span class="field__label">{{ field.label }}</span>
    <span class="field-row__control">
      <NumberStepper
        :model-value="Number(value)"
        :min="field.min"
        :max="field.max"
        :label="field.label"
        @update:model-value="emit('update', $event)"
      />
      <span v-if="field.unit" class="field-row__unit">{{ field.unit }}</span>
    </span>
  </div>

  <div v-else-if="field.type === 'choice'" class="field-row">
    <span class="field__label">{{ field.label }}</span>
    <SegmentedControl
      :model-value="String(value)"
      size="sm"
      :options="field.options"
      :label="field.label"
      @update:model-value="emit('update', $event)"
    />
  </div>
</template>

<style scoped>
.field-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  min-height: 40px;
}

.field-row__control {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.field-row__unit {
  font-size: 13px;
  font-weight: 650;
  color: var(--color-muted);
}
</style>
