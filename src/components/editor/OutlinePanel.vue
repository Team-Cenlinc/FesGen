<script setup lang="ts">
import { PhEyeSlash, PhSquaresFour } from "@phosphor-icons/vue";
import { computed } from "vue";
import { messages as m } from "@/i18n";
import type { ModuleTweak, SignStyle } from "@/signs/types";

/** 大纲：整块牌子 + 按分区列出的模块。键盘也能选中，和点牌面等价。 */
const props = defineProps<{
  style: SignStyle<unknown>;
  selected: string | null;
  tweaks: Readonly<Record<string, ModuleTweak>>;
}>();
const emit = defineEmits<{ select: [id: string | null] }>();

const regions = computed(() =>
  props.style.regions
    .map((region) => ({
      ...region,
      modules: props.style.modules.filter((module) => module.region === region.id),
    }))
    .filter((region) => region.modules.length > 0),
);
</script>

<template>
  <nav class="outline" :aria-label="m.editor.outline">
    <h2 class="outline__title">{{ m.editor.outline }}</h2>
    <button
      type="button"
      class="outline__item outline__item--root"
      :aria-current="selected === null ? 'true' : undefined"
      @click="emit('select', null)"
    >
      <PhSquaresFour :size="18" weight="bold" aria-hidden="true" />
      {{ m.editor.global }}
    </button>
    <div v-for="region in regions" :key="region.id" class="outline__region">
      <p class="outline__region-label">{{ region.label }}</p>
      <button
        v-for="module in region.modules"
        :key="module.id"
        type="button"
        class="outline__item"
        :aria-current="selected === module.id ? 'true' : undefined"
        @click="emit('select', module.id)"
      >
        <span class="outline__name">{{ module.label }}</span>
        <PhEyeSlash
          v-if="tweaks[module.id]?.hidden"
          :size="16"
          weight="bold"
          :aria-label="m.editor.hiddenModule"
        />
      </button>
    </div>
  </nav>
</template>

<style scoped>
.outline {
  display: grid;
  align-content: start;
  gap: 4px;
}

.outline__title {
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 790;
  color: var(--color-muted);
}

.outline__region {
  display: grid;
  gap: 2px;
  margin-top: 10px;
}

.outline__region-label {
  padding: 0 10px 4px;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-muted);
}

.outline__item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 36px;
  padding: 0 10px;
  border: 0;
  border-radius: var(--radius-control);
  background: transparent;
  font-size: 14px;
  font-weight: 650;
  text-align: left;
  cursor: pointer;
  transition: background-color var(--duration-feedback) ease;
}

.outline__name {
  flex: 1 1 auto;
}

.outline__item--root {
  font-weight: 790;
}

.outline__item[aria-current="true"] {
  background: var(--color-text);
  color: var(--color-surface);
}

.outline__item:focus-visible {
  outline-offset: -2px;
}

@media (hover: hover) and (pointer: fine) {
  .outline__item:not([aria-current="true"]):hover {
    background: color-mix(in srgb, var(--color-text) 8%, transparent);
  }
}
</style>
