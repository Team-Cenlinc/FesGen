<script setup lang="ts">
import { PhArrowSquareOut } from "@phosphor-icons/vue";
import { messages as m } from "@/i18n";

/** 服务台里的上手指南与关于；网站服务台没有这两段，是 FesGen 作为工具补上的帮助。 */
defineProps<{ idPrefix: string }>();

const version = __APP_VERSION__;
</script>

<template>
  <section class="service-menu__group" :aria-labelledby="`${idPrefix}-guide`">
    <h2 :id="`${idPrefix}-guide`" class="service-menu__heading">{{ m.serviceDesk.guide }}</h2>
    <p class="service-menu__text">{{ m.serviceDesk.guideBody }}</p>
  </section>
  <section class="service-menu__group" :aria-labelledby="`${idPrefix}-about`">
    <h2 :id="`${idPrefix}-about`" class="service-menu__heading">{{ m.serviceDesk.about }}</h2>
    <p class="service-menu__text">{{ m.serviceDesk.aboutBody }}</p>
    <p class="service-menu__meta">{{ m.serviceDesk.version }} {{ version }}</p>
    <a
      class="service-menu__link"
      data-header-menu-link
      href="https://wiki.fetarute.org"
      target="_blank"
      rel="noreferrer"
      :aria-label="`${m.serviceDesk.wiki} (${m.exit.newTab})`"
    >
      <span>{{ m.serviceDesk.wiki }}</span>
      <PhArrowSquareOut weight="bold" aria-hidden="true" />
    </a>
  </section>
</template>
