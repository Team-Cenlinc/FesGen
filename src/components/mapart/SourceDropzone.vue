<script setup lang="ts">
import { PhImageSquare } from "@phosphor-icons/vue";
import { ref } from "vue";
import TypeText from "@/components/TypeText.vue";
import { messages as m } from "@/i18n";

/**
 * 选择或拖入一张图片。外观是一个空的地图框：四角取景标记，拖进来时角标向内收拢。
 * 点击和拖放都能用（旧版只有拖放能用）。
 */
defineProps<{ fileName?: string; detail?: string }>();
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
    :class="{ 'dropzone--active': dragDepth > 0, 'dropzone--loaded': fileName }"
    @dragenter.prevent="dragDepth++"
    @dragover.prevent
    @dragleave.prevent="dragDepth = Math.max(0, dragDepth - 1)"
    @drop.prevent="onDrop"
  >
    <span class="dropzone__corner dropzone__corner--tl" aria-hidden="true" />
    <span class="dropzone__corner dropzone__corner--tr" aria-hidden="true" />
    <span class="dropzone__corner dropzone__corner--bl" aria-hidden="true" />
    <span class="dropzone__corner dropzone__corner--br" aria-hidden="true" />

    <PhImageSquare class="dropzone__icon" :size="30" weight="bold" aria-hidden="true" />
    <p v-if="dragDepth > 0" class="dropzone__title">{{ m.mapArt.source.dropActive }}</p>
    <template v-else>
      <div v-if="fileName" class="dropzone__file">
        <p class="dropzone__name">{{ fileName }}</p>
        <p v-if="detail" class="dropzone__detail"><TypeText :text="detail" /></p>
      </div>
      <button
        type="button"
        class="button"
        :class="{ 'button--primary': !fileName }"
        @click="input?.click()"
      >
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
  --corner-color: var(--color-text);

  position: relative;
  display: grid;
  justify-items: center;
  gap: 10px;
  padding: 28px 20px 24px;
  border-radius: 4px;
  background: var(--color-surface-raised);
  text-align: center;
  transition: background-color var(--duration-feedback) ease;
}

.dropzone--active {
  background: color-mix(in srgb, var(--color-text) 8%, var(--color-surface-raised));
}

/* 四角的取景标记：像一个等着挂图的空地图框。 */
.dropzone__corner {
  position: absolute;
  width: 18px;
  height: 18px;
  border: 0 solid var(--corner-color);
  transition:
    border-color var(--duration-feedback) ease,
    transform var(--duration-move) var(--ease-out);
}

.dropzone__corner--tl {
  top: 0;
  left: 0;
  border-width: 3px 0 0 3px;
}

.dropzone__corner--tr {
  top: 0;
  right: 0;
  border-width: 3px 3px 0 0;
}

.dropzone__corner--bl {
  bottom: 0;
  left: 0;
  border-width: 0 0 3px 3px;
}

.dropzone__corner--br {
  right: 0;
  bottom: 0;
  border-width: 0 3px 3px 0;
}

.dropzone--active .dropzone__corner--tl {
  transform: translate(4px, 4px);
}

.dropzone--active .dropzone__corner--tr {
  transform: translate(-4px, 4px);
}

.dropzone--active .dropzone__corner--bl {
  transform: translate(4px, -4px);
}

.dropzone--active .dropzone__corner--br {
  transform: translate(-4px, -4px);
}

.dropzone__icon {
  color: var(--color-muted);
}

.dropzone--loaded .dropzone__icon {
  color: var(--color-text);
}

.dropzone__title {
  font-weight: 790;
}

.dropzone__file {
  display: grid;
  gap: 2px;
  max-width: 100%;
}

.dropzone__name {
  overflow: hidden;
  font-weight: 790;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropzone__detail {
  font-family: var(--font-fetarute-display);
  font-size: 13px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  color: var(--color-muted);
}

@media (prefers-reduced-motion: reduce) {
  .dropzone__corner {
    transition: border-color var(--duration-feedback) ease;
  }

  .dropzone--active .dropzone__corner {
    transform: none;
  }
}
</style>
