<script setup lang="ts">
import { PhGridNine, PhStack } from "@phosphor-icons/vue";
import PageTitle from "@/components/PageTitle.vue";
import { messages as m } from "@/i18n";
</script>

<template>
  <main class="library">
    <PageTitle :title="m.library.title" :subtitle="m.library.subtitle">
      <template #icon><PhStack :size="30" weight="bold" /></template>
    </PageTitle>

    <section class="library__empty panel">
      <h2 class="library__empty-title">{{ m.library.emptyTitle }}</h2>
      <p>{{ m.library.emptyBody }}</p>
      <RouterLink to="/map-art" class="button button--primary">
        <PhGridNine :size="18" weight="bold" aria-hidden="true" />
        {{ m.library.openMapArt }}
      </RouterLink>
    </section>
  </main>
</template>

<style scoped>
.library {
  display: grid;
  gap: 32px;
  width: min(calc(100% - 32px), 1392px);
  margin: 0 auto;
  padding: 40px 0 80px;
}

.library__empty {
  display: grid;
  justify-items: start;
  gap: 12px;
  padding: 32px;
}

.library__empty-title {
  font-size: 20px;
  font-weight: 750;
}
</style>
