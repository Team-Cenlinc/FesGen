<script setup lang="ts">
/** 内容面板：标题行右侧可放这一块的工具（slot aside）。 */
defineProps<{ title: string }>();
</script>

<template>
  <section class="step panel">
    <header class="step__head">
      <h2 class="step__title">{{ title }}</h2>
      <div v-if="$slots.aside" class="step__aside"><slot name="aside" /></div>
    </header>
    <slot />
  </section>
</template>

<style scoped>
.step {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
  padding: 20px;
}

.step__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 12px;
  min-height: 32px;
}

.step__title {
  font-size: 18px;
  font-weight: 790;
  letter-spacing: -0.03em;
}

.step__aside {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
  margin-left: auto;
}
</style>
