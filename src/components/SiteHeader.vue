<script setup lang="ts">
import {
  PhArrowUpRight,
  PhCircleHalf,
  PhDotsThree,
  PhInfo,
  PhList,
  PhQuestion,
} from "@phosphor-icons/vue";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { createHeaderController, type HeaderController } from "@/header/controller";
import { navSignalAttrs, primaryNavItems } from "@/header/site";
import { messages as m } from "@/i18n";
import FesGenMark from "./FesGenMark.vue";
import AppearanceChoices from "./header/AppearanceChoices.vue";
import DestinationMenu from "./header/DestinationMenu.vue";
import ServiceDeskNotes from "./header/ServiceDeskNotes.vue";

/**
 * 站牌灯箱式页头，结构、类名与 Fetarute-Website 的 SiteHeader.astro 一一对应，样式在
 * src/styles/site-header.css，交互在 src/header/controller.ts。和网站的差别只有三处：
 * 品牌是 FesGen 标志；主导航两项（作品库用会话随机线路色，地图画固定 DS 线）；
 * 小屏三个触发牌是外观、服务台和菜单（FesGen 暂时只有简体，没有语言切换）。
 */

const route = useRoute();
const header = ref<HTMLElement>();
let controller: HeaderController | undefined;

onMounted(() => {
  controller = createHeaderController(header.value!);
});

onBeforeUnmount(() => {
  controller?.dispose();
});

// 换页后不应看到上一页展开的菜单。
watch(
  () => route.fullPath,
  () => controller?.closeAllMenus(),
);
</script>

<template>
  <header ref="header" class="site-header" :aria-label="m.header.label">
    <RouterLink to="/" class="brand" :aria-label="m.app.homeLabel">
      <FesGenMark class="brand__mark" />
      <span class="brand__names" aria-hidden="true">
        <span class="brand__name">{{ m.app.name }}</span>
        <span class="brand__tagline">{{ m.app.tagline }}</span>
      </span>
    </RouterLink>

    <div class="mobile-header-tools">
      <details class="mobile-header-tool mobile-header-tool--service" data-header-menu>
        <summary class="mobile-header-tool__summary" :aria-label="m.serviceDesk.appearance">
          <span class="mobile-header-tool__icon" aria-hidden="true">
            <PhCircleHalf weight="bold" />
          </span>
        </summary>
        <div class="mobile-header-tool__menu" data-header-menu-panel>
          <AppearanceChoices heading-id="mobile-appearance-menu-label" />
        </div>
      </details>
      <details class="mobile-header-tool mobile-header-tool--service" data-header-menu>
        <summary class="mobile-header-tool__summary" :aria-label="m.serviceDesk.label">
          <span class="mobile-header-tool__icon" aria-hidden="true">
            <PhInfo weight="bold" />
          </span>
        </summary>
        <div
          class="mobile-header-tool__menu"
          data-header-menu-panel
          :aria-label="m.serviceDesk.label"
        >
          <ServiceDeskNotes id-prefix="mobile-service" />
        </div>
      </details>
      <details class="mobile-header-tool mobile-header-tool--destination" data-header-menu>
        <summary class="mobile-header-tool__summary" :aria-label="m.nav.more">
          <span class="mobile-header-tool__icon" aria-hidden="true">
            <PhDotsThree weight="bold" />
          </span>
        </summary>
        <div
          class="mobile-header-tool__menu destination-menu__panel"
          data-header-menu-panel
          aria-labelledby="mobile-destination-menu-label"
        >
          <DestinationMenu heading-id="mobile-destination-menu-label" include-primary-navigation />
        </div>
      </details>
    </div>

    <span class="site-header__spacer" aria-hidden="true" />

    <!-- 紧凑态只展示连续线路信号；它不是导航入口，进入页头后才还原完整可操作导航。 -->
    <span class="home-nav-compact-signal" aria-hidden="true">
      <span
        v-for="item in primaryNavItems"
        :key="item.key"
        class="home-nav-compact-signal__route"
        v-bind="navSignalAttrs(item)"
      >
        <span class="home-nav-compact-signal__dot" />
        <span class="home-nav-compact-signal__dot home-nav-compact-signal__dot--secondary" />
      </span>
    </span>

    <RouterLink
      v-for="item in primaryNavItems"
      :key="item.key"
      v-slot="{ href, navigate }"
      :to="item.to"
      custom
    >
      <a
        class="home-nav"
        :href="href"
        :aria-label="item.label"
        :aria-current="item.matches(route.path) ? 'page' : undefined"
        v-bind="navSignalAttrs(item)"
        @click="navigate"
      >
        <span class="home-nav__primary">
          <span class="home-nav__text-stack">
            <span class="home-nav__label">{{ item.label }}</span>
            <span class="home-nav__indicator" aria-hidden="true">
              <span class="home-nav__indicator-dot" />
              <span class="home-nav__indicator-band" />
            </span>
          </span>
          <span class="home-nav__arrow" aria-hidden="true">
            <component :is="item.arrow" weight="bold" />
          </span>
        </span>
      </a>
    </RouterLink>

    <details class="service-desk" data-header-menu>
      <summary class="service-desk__summary" :aria-label="m.serviceDesk.label">
        <span class="service-desk__direction">
          <span class="service-desk__copy">
            <span class="service-desk__label">{{ m.serviceDesk.label }}</span>
            <span class="service-desk__marker-row" aria-hidden="true">
              <span class="service-desk__marker"><PhCircleHalf weight="bold" /></span>
              <span class="service-desk__marker"><PhQuestion weight="bold" /></span>
            </span>
          </span>
          <span class="service-desk__information" aria-hidden="true">
            <PhInfo weight="bold" />
          </span>
        </span>
      </summary>
      <div class="service-desk__menu" data-header-menu-panel :aria-label="m.serviceDesk.label">
        <AppearanceChoices heading-id="appearance-menu-label" />
        <ServiceDeskNotes id-prefix="service-desk" />
      </div>
    </details>

    <details class="exit-menu" data-header-menu>
      <summary class="exit-menu__summary" :aria-label="m.exit.label">
        <span class="exit-menu__direction">
          <span class="exit-menu__copy">
            <span class="exit-menu__primary">
              <span class="exit-menu__label">{{ m.exit.label }}</span>
            </span>
            <span class="exit-menu__hint">{{ m.exit.subtitle }}</span>
          </span>
          <span class="exit-menu__arrow" aria-hidden="true">
            <PhArrowUpRight weight="bold" />
          </span>
        </span>
      </summary>
      <div
        class="exit-menu__menu destination-menu__panel"
        data-header-menu-panel
        :aria-label="m.exit.subtitle"
      >
        <DestinationMenu heading-id="expanded-destination-menu-label" />
      </div>
    </details>

    <details class="compact-exit-menu" data-header-menu>
      <summary class="compact-exit-menu__summary" :aria-label="m.exit.label">
        <span class="compact-exit-menu__icon" aria-hidden="true">
          <PhList weight="bold" />
        </span>
      </summary>
      <div
        class="compact-exit-menu__menu destination-menu__panel"
        data-header-menu-panel
        :aria-label="m.exit.subtitle"
      >
        <DestinationMenu heading-id="desktop-destination-menu-label" />
      </div>
    </details>
  </header>
</template>
