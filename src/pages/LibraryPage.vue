<script setup lang="ts">
import {
  PhCopy,
  PhGridNine,
  PhPencilSimple,
  PhPlus,
  PhStack,
  PhTrash,
  PhUploadSimple,
} from "@phosphor-icons/vue";
import { nextTick, ref } from "vue";
import { useRouter } from "vue-router";
import PageTitle from "@/components/PageTitle.vue";
import { messages as m } from "@/i18n";
import { importSignJson } from "@/library/io";
import { relativeTime, signMeta } from "@/library/labels";
import { useLibrary } from "@/library/store";

const library = useLibrary();
const router = useRouter();

const importInput = ref<HTMLInputElement>();
const notice = ref<{ kind: "ok" | "error"; text: string } | null>(null);
const renamingId = ref<string | null>(null);
const renameDraft = ref("");
const confirmingDeleteId = ref<string | null>(null);

function createSign() {
  const sign = library.create("kitajuku-dentetsu");
  router.push(`/sign/${sign.id}`);
}

async function onImport(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;
  const result = importSignJson(await file.text());
  if (!result.ok) {
    notice.value = { kind: "error", text: result.message };
    return;
  }
  library.add(result.sign);
  router.push(`/sign/${result.sign.id}`);
}

async function startRename(id: string, name: string) {
  confirmingDeleteId.value = null;
  renamingId.value = id;
  renameDraft.value = name;
  await nextTick();
  document.querySelector<HTMLInputElement>(`[data-rename="${id}"]`)?.select();
}

function finishRename() {
  if (renamingId.value) library.rename(renamingId.value, renameDraft.value);
  renamingId.value = null;
}
</script>

<template>
  <main class="library">
    <PageTitle :title="m.library.title" :subtitle="m.library.subtitle">
      <template #icon><PhStack :size="30" weight="bold" /></template>
    </PageTitle>

    <div class="library__toolbar">
      <button type="button" class="button button--primary" @click="createSign">
        <PhPlus :size="18" weight="bold" aria-hidden="true" />
        {{ m.library.create }}
      </button>
      <button type="button" class="button" @click="importInput?.click()">
        <PhUploadSimple :size="18" weight="bold" aria-hidden="true" />
        {{ m.library.import }}
      </button>
      <input
        ref="importInput"
        class="visually-hidden"
        type="file"
        accept="application/json,.json"
        tabindex="-1"
        @change="onImport"
      />
      <p class="hint">{{ m.library.comingSoon }}</p>
    </div>

    <p v-if="notice" class="notice" :class="`notice--${notice.kind}`" role="status">
      {{ notice.text }}
    </p>
    <p v-if="library.saveFailed" class="notice notice--error" role="alert">
      {{ m.library.saveFailed }}
    </p>

    <section v-if="library.sorted.length === 0" class="library__empty panel">
      <h2 class="library__empty-title">{{ m.library.emptyTitle }}</h2>
      <p>{{ m.library.emptyBody }}</p>
      <div class="library__empty-actions">
        <button type="button" class="button button--primary" @click="createSign">
          <PhPlus :size="18" weight="bold" aria-hidden="true" />
          {{ m.library.create }}
        </button>
        <RouterLink to="/map-art" class="button">
          <PhGridNine :size="18" weight="bold" aria-hidden="true" />
          {{ m.library.openMapArt }}
        </RouterLink>
      </div>
    </section>

    <ul v-else class="library__grid">
      <li v-for="sign in library.sorted" :key="sign.id" class="sign-card panel">
        <RouterLink :to="`/sign/${sign.id}`" class="sign-card__preview" :aria-label="sign.name">
          <img v-if="sign.thumbnail" :src="sign.thumbnail" alt="" />
          <span v-else class="sign-card__placeholder">{{ m.library.noThumbnail }}</span>
        </RouterLink>
        <div class="sign-card__body">
          <input
            v-if="renamingId === sign.id"
            v-model="renameDraft"
            class="input sign-card__rename"
            :data-rename="sign.id"
            :aria-label="m.library.nameLabel"
            maxlength="80"
            @keydown.enter="finishRename"
            @keydown.esc="renamingId = null"
            @blur="finishRename"
          />
          <RouterLink v-else :to="`/sign/${sign.id}`" class="sign-card__name">{{
            sign.name
          }}</RouterLink>
          <p class="sign-card__meta">{{ signMeta(sign) }} · {{ relativeTime(sign.updatedAt) }}</p>

          <div v-if="confirmingDeleteId === sign.id" class="sign-card__actions">
            <button
              type="button"
              class="button button--small button--danger"
              @click="library.remove(sign.id)"
            >
              {{ m.library.confirmDelete }}
            </button>
            <button type="button" class="button button--small" @click="confirmingDeleteId = null">
              {{ m.library.cancel }}
            </button>
          </div>
          <div v-else class="sign-card__actions">
            <button
              type="button"
              class="icon-button"
              :title="m.library.duplicate"
              @click="library.duplicate(sign.id)"
            >
              <PhCopy :size="18" weight="bold" aria-hidden="true" />
              <span class="visually-hidden">{{ m.library.duplicate }}</span>
            </button>
            <button
              type="button"
              class="icon-button"
              :title="m.library.rename"
              @click="startRename(sign.id, sign.name)"
            >
              <PhPencilSimple :size="18" weight="bold" aria-hidden="true" />
              <span class="visually-hidden">{{ m.library.rename }}</span>
            </button>
            <button
              type="button"
              class="icon-button"
              :title="m.library.delete"
              @click="((renamingId = null), (confirmingDeleteId = sign.id))"
            >
              <PhTrash :size="18" weight="bold" aria-hidden="true" />
              <span class="visually-hidden">{{ m.library.delete }}</span>
            </button>
          </div>
        </div>
      </li>
    </ul>
  </main>
</template>

<style scoped>
.library {
  display: grid;
  gap: 24px;
  width: min(calc(100% - 32px), 1392px);
  margin: 0 auto;
  padding: 40px 0 80px;
}

.library__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 12px;
}

.library__toolbar .hint {
  margin-left: 4px;
}

.library__empty {
  display: grid;
  justify-items: start;
  gap: 12px;
  padding: 32px;
}

.library__empty-title {
  font-size: 20px;
  font-weight: 790;
  letter-spacing: -0.03em;
}

.library__empty-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
}

.library__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.sign-card {
  display: grid;
  overflow: hidden;
}

/* 预览区：棋盘格底上放缩略图，像一块挂在墙上的牌子。 */
.sign-card__preview {
  display: grid;
  aspect-ratio: 3 / 1.4;
  place-items: center;
  padding: 18px;
  background: var(--color-surface-raised);
  border-bottom: 1px solid var(--color-border);
  text-decoration: none;
}

.sign-card__preview img {
  display: block;
  max-width: 100%;
  max-height: 100%;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.18);
}

.sign-card__placeholder {
  font-size: 13px;
  font-weight: 650;
  color: var(--color-muted);
}

.sign-card__body {
  display: grid;
  gap: 4px;
  padding: 14px 16px 12px;
}

.sign-card__name {
  overflow: hidden;
  font-size: 17px;
  font-weight: 790;
  letter-spacing: -0.02em;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sign-card__rename {
  min-height: 32px;
  font-weight: 700;
}

.sign-card__meta {
  font-size: 13px;
  color: var(--color-muted);
}

.sign-card__actions {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}

.icon-button {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  background: transparent;
  cursor: pointer;
  transition:
    border-color var(--duration-feedback) ease,
    transform var(--duration-press) var(--ease-out);
}

.icon-button:active {
  transform: scale(0.94);
}

.button--danger {
  border-color: var(--color-status-error);
  background: var(--color-status-error);
  color: var(--color-status-error-text);
}

@media (hover: hover) and (pointer: fine) {
  .icon-button:hover {
    border-color: var(--color-text);
  }

  .sign-card__preview:hover img {
    box-shadow: 0 2px 8px rgb(0 0 0 / 0.22);
  }
}
</style>
