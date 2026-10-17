<script setup lang="ts">
/** 页面标题：图标方块 + 大号中文标题 + 斜体英文副标题，形制取自网站的玩家资讯页。 */
defineProps<{
  title: string;
  subtitle: string;
}>();
</script>

<template>
  <div class="page-title">
    <span class="page-title__icon" aria-hidden="true"><slot name="icon" /></span>
    <div>
      <h1 class="page-title__text">{{ title }}</h1>
      <p class="page-title__subtitle">{{ subtitle }}</p>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title__icon {
  display: grid;
  width: 56px;
  height: 56px;
  flex: 0 0 auto;
  place-items: center;
  background: var(--color-action);
  color: var(--color-action-text);
}

.page-title__text {
  font-size: clamp(32px, 4vw, 44px);
  font-weight: 790;
  letter-spacing: -0.045em;
  line-height: 1.05;
}

.page-title__subtitle {
  font-family: var(--font-fetarute-display);
  font-size: 14px;
  font-style: italic;
  font-weight: 650;
  color: var(--color-muted);
}
</style>
