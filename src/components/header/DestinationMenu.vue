<script setup lang="ts">
import { PhArrowSquareOut } from "@phosphor-icons/vue";
import { useRoute } from "vue-router";
import { externalDestinations, primaryNavItems } from "@/header/site";
import { messages as m } from "@/i18n";

/**
 * 目的地菜单，完整出口、紧凑出口和小屏“菜单”共用，对应网站的 DestinationMenu.astro。
 * 小屏没有主导航，所以那里把站内导航也列进来，和外部服务分组。
 */
defineProps<{
  /** 菜单标题的 DOM id；多个响应式菜单同时存在，需要各自唯一。 */
  headingId: string;
  includePrimaryNavigation?: boolean;
}>();

const route = useRoute();
</script>

<template>
  <template v-if="includePrimaryNavigation">
    <div class="destination-menu__heading">
      <h2 :id="headingId" class="destination-menu__heading-label">{{ m.nav.more }}</h2>
      <p>{{ m.nav.moreHint }}</p>
    </div>
    <nav class="destination-menu__links" :aria-label="m.nav.label">
      <RouterLink
        v-for="item in primaryNavItems"
        :key="item.key"
        v-slot="{ href, navigate }"
        :to="item.to"
        custom
      >
        <a
          class="destination-menu__link"
          data-header-menu-link
          :href="href"
          :aria-current="item.matches(route.path) ? 'page' : undefined"
          @click="navigate"
        >
          <span>{{ item.label }}</span>
          <span class="destination-menu__link-arrow" aria-hidden="true">
            <component :is="item.arrow" weight="bold" />
          </span>
        </a>
      </RouterLink>
    </nav>
  </template>
  <div :class="{ 'destination-menu__external-group': includePrimaryNavigation }">
    <h3 v-if="includePrimaryNavigation" class="destination-menu__group-heading">
      {{ m.exit.label }}
    </h3>
    <div class="destination-menu__external-services">
      <a
        v-for="destination in externalDestinations"
        :key="destination.key"
        class="destination-menu__link destination-menu__link--external"
        data-header-menu-link
        :href="destination.href"
        target="_blank"
        rel="noreferrer"
        :aria-label="`${destination.label} (${m.exit.newTab})`"
      >
        <span class="destination-menu__link-label">
          <span class="destination-menu__link-icon" aria-hidden="true">
            <component :is="destination.icon" weight="bold" />
          </span>
          <span>{{ destination.label }}</span>
        </span>
        <span class="destination-menu__link-arrow" aria-hidden="true">
          <PhArrowSquareOut weight="bold" />
        </span>
      </a>
    </div>
  </div>
</template>
