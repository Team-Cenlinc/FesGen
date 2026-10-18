<script setup lang="ts">
import { PhDownloadSimple, PhTextAa } from "@phosphor-icons/vue";
import { computed } from "vue";
import { FONT_CATALOG, formatBytes, type FontId } from "@/fonts/catalog";
import { fontProgress } from "@/fonts/manager";
import { format, messages as m } from "@/i18n";

/**
 * 字体依赖确认：列出要下载的字体和大小，用户同意后才开始下载，下载时显示进度。
 * - initial：打开牌子时缺主字体，牌面还画不出来；
 * - extra：牌子已经能显示，只是新打开的选项（如汉字强调）还缺字体；
 * - fallback：牌面上有主字体没有的字，需要简体或繁体中文补字字体。
 */
const props = defineProps<{
  fonts: readonly FontId[];
  styleLabel: string;
  mode: "initial" | "extra" | "fallback";
  /** fallback 模式下缺的字。 */
  chars?: string;
  downloading: boolean;
  error: string | null;
}>();

const body = computed(() => {
  if (props.mode === "fallback") return format(m.fonts.fallbackBody, { chars: props.chars ?? "" });
  if (props.mode === "extra") return m.fonts.extraBody;
  return format(m.fonts.body, { style: props.styleLabel });
});
defineEmits<{ download: []; cancel: [] }>();

const total = computed(() =>
  props.fonts.reduce((sum, id) => sum + FONT_CATALOG[id].approxBytes, 0),
);
</script>

<template>
  <section class="font-dialog" role="dialog" aria-labelledby="font-dialog-title">
    <div class="font-dialog__head">
      <span class="font-dialog__icon" aria-hidden="true"
        ><PhTextAa :size="22" weight="bold"
      /></span>
      <h2 id="font-dialog-title" class="font-dialog__title">
        {{ mode === "fallback" ? m.fonts.fallbackTitle : m.fonts.title }}
      </h2>
    </div>
    <p class="font-dialog__body">{{ body }}</p>

    <ul class="font-dialog__list">
      <li v-for="id in fonts" :key="id" class="font-row">
        <div class="font-row__text">
          <span class="font-row__name">{{ FONT_CATALOG[id].label }}</span>
          <span class="font-row__meta">
            {{ formatBytes(FONT_CATALOG[id].approxBytes) }} · {{ m.fonts.license }}
            {{ FONT_CATALOG[id].license }}
          </span>
        </div>
        <span
          v-if="downloading || fontProgress[id].status === 'downloading'"
          class="font-row__bar"
          role="progressbar"
          :aria-valuenow="Math.round((fontProgress[id].loaded / fontProgress[id].total) * 100)"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <span
            :style="{ transform: `scaleX(${fontProgress[id].loaded / fontProgress[id].total})` }"
          />
        </span>
      </li>
    </ul>

    <p class="font-dialog__total">{{ m.fonts.total }} {{ formatBytes(total) }}</p>
    <p v-if="error" class="font-dialog__error" role="alert">{{ error }}</p>

    <div class="font-dialog__actions">
      <button
        type="button"
        class="button button--primary"
        :disabled="downloading"
        @click="$emit('download')"
      >
        <PhDownloadSimple :size="18" weight="bold" aria-hidden="true" />
        {{ downloading ? m.fonts.downloading : error ? m.fonts.retry : m.fonts.download }}
      </button>
      <button type="button" class="button" :disabled="downloading" @click="$emit('cancel')">
        {{ mode === "initial" ? m.fonts.back : m.fonts.later }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.font-dialog {
  display: grid;
  gap: 14px;
  width: min(460px, 100%);
  padding: 24px;
  border: var(--border-sign);
  background: var(--color-surface);
  box-shadow: var(--shadow-feedback);
}

.font-dialog__head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.font-dialog__icon {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  background: var(--color-service);
  color: var(--color-service-text);
}

.font-dialog__title {
  font-size: 20px;
  font-weight: 790;
  letter-spacing: -0.03em;
}

.font-dialog__body {
  font-size: 14px;
  line-height: 1.6;
}

.font-dialog__list {
  display: grid;
  margin: 0;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  list-style: none;
}

.font-row {
  display: grid;
  gap: 8px;
  padding: 10px 14px;
}

.font-row + .font-row {
  border-top: 1px solid var(--color-border);
}

.font-row__text {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 4px 12px;
}

.font-row__name {
  font-weight: 750;
}

.font-row__meta {
  font-size: 13px;
  color: var(--color-muted);
  font-variant-numeric: tabular-nums;
}

.font-row__bar {
  display: block;
  height: 6px;
  border-radius: var(--radius-pill);
  background: var(--color-surface-raised);
  overflow: hidden;
}

.font-row__bar > span {
  display: block;
  height: 100%;
  background: var(--color-text);
  transform-origin: left;
  transition: transform 120ms linear;
}

.font-dialog__total {
  font-family: var(--font-fetarute-display);
  font-weight: 790;
  font-variant-numeric: tabular-nums;
}

.font-dialog__error {
  padding: 8px 12px;
  border-left: 4px solid var(--color-status-error);
  background: color-mix(in srgb, var(--color-status-error) 10%, transparent);
  font-size: 14px;
  font-weight: 650;
}

.font-dialog__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
