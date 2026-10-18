<script setup lang="ts">
import { PhArrowDown, PhArrowUp, PhDotsSixVertical, PhPlus, PhTrash } from "@phosphor-icons/vue";
import { computed, nextTick, ref, watch } from "vue";
import { format, messages as m } from "@/i18n";
import type { FieldDef } from "@/signs/types";
import { getAtPath, isFieldVisible } from "@/signs/values";
import FieldControl from "./FieldControl.vue";

type ListFieldDef = Extract<FieldDef, { type: "list" }>;

/**
 * 列表字段（例如 FTA 的线路）：每项一张可展开的卡片，可以在任意位置插入、删除、上下移动或拖动排序。
 * 展开的那一项和牌面上选中的那一段同步。
 */
const props = defineProps<{
  field: ListFieldDef;
  items: readonly unknown[];
  /** 展开的项；和牌面上选中的列表项同步。 */
  active: number | null;
}>();
const emit = defineEmits<{
  select: [index: number | null];
  update: [path: string, value: unknown];
  insert: [index: number];
  remove: [index: number];
  move: [from: number, to: number];
}>();

const root = ref<HTMLElement>();
const dragging = ref<number | null>(null);
const dropTarget = ref<number | null>(null);
const atMinimum = computed(() => props.items.length <= props.field.min);

function title(item: unknown, index: number): string {
  const parts = props.field.itemTitle
    .map((path) => String(getAtPath(item, path) ?? "").trim())
    .filter(Boolean);
  return parts.length > 0
    ? parts.join(" · ")
    : format(m.editor.listUntitled, { item: props.field.itemLabel, n: index + 1 });
}

function swatch(item: unknown): string | null {
  const color = getAtPath(item, "color");
  return typeof color === "string" ? color : null;
}

function toggle(index: number) {
  emit("select", props.active === index ? null : index);
}

/** 标题字段全空的项，例如刚加的新线路。 */
function isBlank(index: number): boolean {
  const item = props.items[index];
  return props.field.itemTitle.every((path) => !String(getAtPath(item, path) ?? "").trim());
}

// 展开一项还空着的列表项（刚从面板或牌面上的“+”加的）时，光标直接落在它的第一个输入框里。
// 用“空着”来判断而不是比较列表长度：从牌面加线路时，属性面板是新挂载的，看不到长度变化。
watch(
  () => [props.active, props.items.length] as const,
  async ([active]) => {
    if (active === null || !isBlank(active)) return;
    await nextTick();
    root.value
      ?.querySelector<HTMLInputElement>(`[data-list-item="${active}"] input[type="text"]`)
      ?.focus();
  },
  { immediate: true },
);

function onDragStart(event: DragEvent, index: number) {
  dragging.value = index;
  event.dataTransfer?.setData("text/plain", String(index));
  if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
}

function onDragOver(event: DragEvent, index: number) {
  if (dragging.value === null) return;
  event.preventDefault();
  dropTarget.value = index;
}

function onDrop(index: number) {
  if (dragging.value !== null && dragging.value !== index) emit("move", dragging.value, index);
  dragging.value = null;
  dropTarget.value = null;
}

function onDragEnd() {
  dragging.value = null;
  dropTarget.value = null;
}
</script>

<template>
  <div ref="root" class="list-field">
    <p class="field__label">{{ field.label }}</p>
    <ol class="list-field__items">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="list-item"
        :class="{
          'list-item--open': active === index,
          'list-item--dragging': dragging === index,
          'list-item--drop': dropTarget === index && dragging !== index,
        }"
        :data-list-item="index"
        @dragover="onDragOver($event, index)"
        @drop.prevent="onDrop(index)"
      >
        <div class="list-item__head">
          <span
            class="list-item__handle"
            draggable="true"
            :title="m.editor.listDrag"
            @dragstart="onDragStart($event, index)"
            @dragend="onDragEnd"
          >
            <PhDotsSixVertical :size="18" weight="bold" aria-hidden="true" />
          </span>
          <button
            type="button"
            class="list-item__title"
            :aria-expanded="active === index"
            @click="toggle(index)"
          >
            <span
              v-if="swatch(item)"
              class="list-item__swatch"
              :style="{ background: swatch(item)! }"
              aria-hidden="true"
            />
            <span class="list-item__name">{{ title(item, index) }}</span>
          </button>
          <button
            type="button"
            class="list-item__icon"
            :aria-disabled="index === 0"
            :title="m.editor.listMoveUp"
            @click="index > 0 && emit('move', index, index - 1)"
          >
            <PhArrowUp :size="17" weight="bold" aria-hidden="true" />
            <span class="visually-hidden">{{ m.editor.listMoveUp }}</span>
          </button>
          <button
            type="button"
            class="list-item__icon"
            :aria-disabled="index === items.length - 1"
            :title="m.editor.listMoveDown"
            @click="index < items.length - 1 && emit('move', index, index + 1)"
          >
            <PhArrowDown :size="17" weight="bold" aria-hidden="true" />
            <span class="visually-hidden">{{ m.editor.listMoveDown }}</span>
          </button>
          <button
            type="button"
            class="list-item__icon list-item__icon--danger"
            :aria-disabled="atMinimum"
            :title="
              atMinimum
                ? format(m.editor.listMinimum, { min: field.min, item: field.itemLabel })
                : m.editor.listRemove
            "
            @click="!atMinimum && emit('remove', index)"
          >
            <PhTrash :size="17" weight="bold" aria-hidden="true" />
            <span class="visually-hidden">{{ m.editor.listRemove }}</span>
          </button>
        </div>
        <div v-if="active === index" class="list-item__body">
          <template v-for="sub in field.fields" :key="sub.path">
            <FieldControl
              v-if="isFieldVisible(item, sub.visibleWhen)"
              :field="sub"
              :value="getAtPath(item, sub.path)"
              @update="emit('update', `${field.path}.${index}.${sub.path}`, $event)"
            />
          </template>
          <button
            type="button"
            class="button button--small list-item__insert"
            @click="emit('insert', index + 1)"
          >
            <PhPlus :size="14" weight="bold" aria-hidden="true" />
            {{ format(m.editor.listInsertBelow, { item: field.itemLabel }) }}
          </button>
        </div>
      </li>
    </ol>
    <button
      type="button"
      class="button button--small list-field__add"
      @click="emit('insert', items.length)"
    >
      <PhPlus :size="16" weight="bold" aria-hidden="true" />
      {{ format(m.editor.listAdd, { item: field.itemLabel }) }}
    </button>
  </div>
</template>

<style scoped>
.list-field {
  display: grid;
  gap: 8px;
}

.list-field__items {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.list-field__add {
  justify-self: start;
}

.list-item {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  background: var(--color-surface-raised);
  transition:
    border-color var(--duration-feedback) ease,
    opacity var(--duration-feedback) ease;
}

.list-item--open {
  border-color: var(--color-text);
}

.list-item--dragging {
  opacity: 0.5;
}

.list-item--drop {
  border-color: var(--color-text);
  box-shadow: inset 0 2px 0 var(--color-text);
}

.list-item__head {
  display: flex;
  align-items: center;
  gap: 2px;
  min-height: 40px;
  padding-right: 4px;
}

.list-item__handle {
  display: grid;
  place-items: center;
  width: 28px;
  align-self: stretch;
  color: var(--color-muted);
  cursor: grab;
}

.list-item__title {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: 8px;
  min-width: 0;
  min-height: 36px;
  padding: 0 6px 0 0;
  border: 0;
  background: transparent;
  font-size: 14px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}

.list-item__swatch {
  flex: 0 0 auto;
  width: 14px;
  height: 14px;
  border-radius: 2px;
  box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.18);
}

.list-item__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-item__icon {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: var(--radius-control);
  background: transparent;
  color: var(--color-muted);
  cursor: pointer;
  transition:
    background-color var(--duration-feedback) ease,
    color var(--duration-feedback) ease;
}

.list-item__icon[aria-disabled="true"] {
  opacity: 0.35;
  cursor: default;
}

@media (hover: hover) and (pointer: fine) {
  .list-item__icon:not([aria-disabled="true"]):hover {
    background: color-mix(in srgb, var(--color-text) 8%, transparent);
    color: var(--color-text);
  }

  .list-item__icon--danger:not([aria-disabled="true"]):hover {
    color: var(--color-status-error);
  }
}

.list-item__body {
  display: grid;
  gap: 10px;
  padding: 4px 12px 12px;
}

.list-item__insert {
  justify-self: start;
}
</style>
