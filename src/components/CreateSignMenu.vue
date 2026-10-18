<script setup lang="ts">
import { PhCaretDown, PhPlus } from "@phosphor-icons/vue";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { messages as m } from "@/i18n";
import { SIGN_STYLES } from "@/signs/registry";
import type { SignStyleId } from "@/signs/types";

/** “新建牌子”：先选样式。点外面或按 Esc 收起。 */
const emit = defineEmits<{ create: [style: SignStyleId] }>();

const open = ref(false);
const root = ref<HTMLElement>();
const styles = Object.values(SIGN_STYLES);

function choose(style: SignStyleId) {
  open.value = false;
  emit("create", style);
}

function onPointerDown(event: PointerEvent) {
  if (open.value && !root.value?.contains(event.target as Node)) open.value = false;
}

function onKeyDown(event: KeyboardEvent) {
  if (open.value && event.key === "Escape") {
    event.preventDefault();
    open.value = false;
    root.value?.querySelector<HTMLButtonElement>(".create-menu__trigger")?.focus();
  }
}

onMounted(() => {
  document.addEventListener("pointerdown", onPointerDown);
  document.addEventListener("keydown", onKeyDown);
});
onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", onPointerDown);
  document.removeEventListener("keydown", onKeyDown);
});
</script>

<template>
  <div ref="root" class="create-menu">
    <button
      type="button"
      class="button button--primary create-menu__trigger"
      aria-haspopup="menu"
      :aria-expanded="open"
      @click="open = !open"
    >
      <PhPlus :size="18" weight="bold" aria-hidden="true" />
      {{ m.library.create }}
      <PhCaretDown :size="14" weight="bold" aria-hidden="true" />
    </button>
    <ul v-if="open" class="create-menu__list" role="menu" :aria-label="m.library.createMenu">
      <li v-for="style in styles" :key="style.id" role="none">
        <button type="button" role="menuitem" class="create-menu__item" @click="choose(style.id)">
          <span class="create-menu__label">{{ style.label }}</span>
          <span class="create-menu__desc">{{ style.description }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.create-menu {
  position: relative;
}

.create-menu__list {
  position: absolute;
  z-index: 20;
  top: calc(100% + 6px);
  left: 0;
  display: grid;
  gap: 2px;
  width: min(360px, calc(100vw - 32px));
  margin: 0;
  padding: 6px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-panel);
  background: var(--color-surface);
  box-shadow: var(--shadow-floating);
  list-style: none;
}

.create-menu__item {
  display: grid;
  gap: 2px;
  width: 100%;
  padding: 10px 12px;
  border: 0;
  border-radius: var(--radius-control);
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background-color var(--duration-feedback) ease;
}

.create-menu__label {
  font-size: 15px;
  font-weight: 790;
}

.create-menu__desc {
  font-size: 13px;
  line-height: 1.45;
  color: var(--color-muted);
}

.create-menu__item:focus-visible {
  outline-offset: -2px;
}

@media (hover: hover) and (pointer: fine) {
  .create-menu__item:hover {
    background: color-mix(in srgb, var(--color-text) 7%, transparent);
  }
}
</style>
