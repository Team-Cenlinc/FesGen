<script setup lang="ts">
import { PhFileArrowUp } from "@phosphor-icons/vue";
import { ref } from "vue";
import { messages as m } from "@/i18n";

/** 选择或拖入一张图片。点击和拖放都能用（旧版只有拖放能用）。 */
defineProps<{ fileName?: string }>();
const emit = defineEmits<{ file: [file: File] }>();

const input = ref<HTMLInputElement>();
const dragDepth = ref(0);

function pick(files: FileList | null | undefined) {
  const file = files?.[0];
  if (file) emit("file", file);
}

function onChange(event: Event) {
  const target = event.target as HTMLInputElement;
  pick(target.files);
  // 清空后再次选择同一个文件也能触发 change。
  target.value = "";
}

function onDrop(event: DragEvent) {
  dragDepth.value = 0;
  pick(event.dataTransfer?.files);
}
</script>

<template>
  <div
    class="dropzone"
    :class="{ 'dropzone--active': dragDepth > 0 }"
    @dragenter.prevent="dragDepth++"
    @dragover.prevent
    @dragleave.prevent="dragDepth = Math.max(0, dragDepth - 1)"
    @drop.prevent="onDrop"
  >
    <PhFileArrowUp :size="32" aria-hidden="true" />
    <p v-if="dragDepth > 0" class="dropzone__title">{{ m.mapArt.source.dropActive }}</p>
    <template v-else>
      <p v-if="fileName" class="dropzone__file">{{ fileName }}</p>
      <button type="button" class="button button--primary" @click="input?.click()">
        {{ fileName ? m.mapArt.source.replace : m.mapArt.source.choose }}
      </button>
      <p class="hint">{{ m.mapArt.source.dropHint }}</p>
    </template>
    <input
      ref="input"
      class="visually-hidden"
      type="file"
      accept="image/*"
      tabindex="-1"
      @change="onChange"
    />
  </div>
</template>

<style scoped>
.dropzone {
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: 24px 16px;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-panel);
  text-align: center;
  transition:
    border-color var(--duration-feedback) ease,
    background-color var(--duration-feedback) ease;
}

.dropzone--active {
  border-color: var(--color-text);
  background: color-mix(in srgb, var(--color-text) 6%, transparent);
}

.dropzone__title {
  font-weight: 700;
}

.dropzone__file {
  max-width: 100%;
  overflow: hidden;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
