<script setup lang="ts">
import { PhArrowSquareOut, PhInfo } from "@phosphor-icons/vue";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useAppearance, type Appearance } from "@/composables/useAppearance";
import { messages as m } from "@/i18n";
import SegmentedControl from "./SegmentedControl.vue";

/**
 * 站牌灯箱式页头，沿用 Fetarute-Website 的导视语言：
 * 左侧站名式品牌，中间导航，右侧蓝色“服务台”放设置与帮助，黄色“出口”放外部链接。
 */

type Menu = "service" | "exit";

const navItems = [
  { to: "/", label: m.nav.library },
  { to: "/map-art", label: m.nav.mapArt },
] as const;

const exitLinks = [
  { href: "https://fetarute.org", label: m.exit.website },
  { href: "https://wiki.fetarute.org", label: m.exit.wiki },
  { href: "https://github.com/Team-Cenlinc/FesGen", label: m.exit.github },
] as const;

const appearanceOptions: { value: Appearance; label: string }[] = [
  { value: "system", label: m.serviceDesk.appearanceSystem },
  { value: "light", label: m.serviceDesk.appearanceLight },
  { value: "dark", label: m.serviceDesk.appearanceDark },
];

const appearance = useAppearance();
const version = __APP_VERSION__;
const route = useRoute();
const header = ref<HTMLElement>();
const openMenu = ref<Menu | null>(null);

function toggleMenu(menu: Menu) {
  openMenu.value = openMenu.value === menu ? null : menu;
}

function onPointerDown(event: PointerEvent) {
  if (openMenu.value && !header.value?.contains(event.target as Node)) {
    openMenu.value = null;
  }
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    openMenu.value = null;
  }
}

watch(
  () => route.fullPath,
  () => {
    openMenu.value = null;
  },
);

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
  <header ref="header" class="site-header">
    <RouterLink to="/" class="brand">
      <span class="brand__name">{{ m.app.name }}</span>
      <span class="brand__tagline">{{ m.app.tagline }}</span>
    </RouterLink>

    <nav class="site-nav" :aria-label="m.nav.label">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="site-nav__item"
        exact-active-class="site-nav__item--active"
      >
        {{ item.label }}
      </RouterLink>
    </nav>

    <div class="header-menu header-menu--service">
      <button
        type="button"
        class="header-menu__summary"
        :aria-expanded="openMenu === 'service'"
        aria-controls="service-desk-panel"
        :aria-label="m.serviceDesk.label"
        @click="toggleMenu('service')"
      >
        <span class="header-menu__label">{{ m.serviceDesk.label }}</span>
        <PhInfo :size="22" weight="bold" aria-hidden="true" />
      </button>
      <div
        v-show="openMenu === 'service'"
        id="service-desk-panel"
        class="header-menu__panel"
        role="region"
        :aria-label="m.serviceDesk.label"
      >
        <section class="desk-section">
          <h2 class="desk-section__title">{{ m.serviceDesk.appearance }}</h2>
          <SegmentedControl
            v-model="appearance"
            :options="appearanceOptions"
            :label="m.serviceDesk.appearance"
          />
        </section>
        <section class="desk-section">
          <h2 class="desk-section__title">{{ m.serviceDesk.guide }}</h2>
          <p>{{ m.serviceDesk.guideBody }}</p>
        </section>
        <section class="desk-section">
          <h2 class="desk-section__title">{{ m.serviceDesk.about }}</h2>
          <p>{{ m.serviceDesk.aboutBody }}</p>
          <p class="hint">{{ m.serviceDesk.version }} {{ version }}</p>
        </section>
        <a class="desk-link" href="https://wiki.fetarute.org" target="_blank" rel="noopener">
          {{ m.serviceDesk.wiki }}
          <PhArrowSquareOut :size="16" aria-hidden="true" />
        </a>
      </div>
    </div>

    <div class="header-menu header-menu--exit">
      <button
        type="button"
        class="header-menu__summary"
        :aria-expanded="openMenu === 'exit'"
        aria-controls="exit-panel"
        :aria-label="m.exit.label"
        @click="toggleMenu('exit')"
      >
        <span class="header-menu__stack">
          <span class="header-menu__label">{{ m.exit.label }}</span>
          <span class="header-menu__subtitle">{{ m.exit.subtitle }}</span>
        </span>
        <PhArrowSquareOut
          class="header-menu__mobile-icon"
          :size="22"
          weight="bold"
          aria-hidden="true"
        />
      </button>
      <ul
        v-show="openMenu === 'exit'"
        id="exit-panel"
        class="header-menu__panel exit-links"
        :aria-label="m.exit.label"
      >
        <li v-for="link in exitLinks" :key="link.href">
          <a class="desk-link" :href="link.href" target="_blank" rel="noopener">
            {{ link.label }}
            <PhArrowSquareOut :size="16" aria-hidden="true" />
          </a>
        </li>
      </ul>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  z-index: 20;
  top: 12px;
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr) max-content max-content;
  min-height: 64px;
  margin: 12px 16px 0;
  background: var(--color-surface);
  box-shadow: var(--shadow-floating);
}

/* 灯箱外框画在最上层，色块延伸到边框下面也不会露缝。 */
.site-header::after {
  content: "";
  position: absolute;
  z-index: 2;
  inset: 0;
  border: var(--border-sign);
  pointer-events: none;
}

.brand {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 0 24px;
  align-self: center;
  text-decoration: none;
}

.brand__name {
  font-family: var(--font-fetarute-display);
  font-size: 26px;
  font-weight: 790;
  letter-spacing: -0.045em;
}

.brand__tagline {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-muted);
}

.site-nav {
  display: flex;
  justify-content: flex-end;
  align-items: stretch;
  padding: 0 8px;
}

.site-nav__item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 16px;
  font-size: 18px;
  font-weight: 750;
  letter-spacing: -0.02em;
  text-decoration: none;
}

/* 当前页用一条无彩指示带标出，和网站导航悬停时的色带同形。 */
.site-nav__item::after {
  content: "";
  position: absolute;
  right: 12px;
  bottom: 12px;
  left: 12px;
  height: 4px;
  background: currentColor;
  opacity: 0;
  transform: scaleX(0.4);
  transition:
    opacity var(--duration-feedback) ease,
    transform 180ms var(--motion-standard);
}

.site-nav__item:hover::after {
  opacity: 0.35;
  transform: scaleX(1);
}

.site-nav__item--active::after {
  opacity: 1;
  transform: scaleX(1);
}

.header-menu {
  position: relative;
}

.header-menu--service {
  background: var(--color-service);
  color: var(--color-service-text);
}

.header-menu--exit {
  background: var(--color-exit);
  color: var(--color-exit-text);
}

.header-menu__summary {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 100%;
  padding: 0 20px;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.header-menu__summary:hover,
.header-menu__summary[aria-expanded="true"] {
  background: color-mix(in srgb, currentColor 10%, transparent);
}

.header-menu__summary:focus-visible {
  outline-color: currentColor;
  outline-offset: -6px;
}

.header-menu__stack {
  display: grid;
  justify-items: end;
  line-height: 1.1;
}

.header-menu__label {
  font-size: 18px;
  font-weight: 790;
  letter-spacing: -0.02em;
}

.header-menu__subtitle {
  font-size: 11px;
  font-weight: 650;
}

.header-menu__mobile-icon {
  display: none;
}

.header-menu__panel {
  position: absolute;
  z-index: 3;
  top: calc(100% + 8px);
  right: 0;
  display: grid;
  gap: 16px;
  width: min(360px, calc(100vw - 32px));
  margin: 0;
  padding: 20px;
  border: var(--border-sign);
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: var(--shadow-feedback);
  list-style: none;
}

.exit-links {
  gap: 4px;
  width: min(280px, calc(100vw - 32px));
  padding: 8px;
}

.desk-section {
  display: grid;
  gap: 8px;
}

.desk-section__title {
  font-size: 14px;
  font-weight: 750;
}

.desk-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 40px;
  padding: 0 12px;
  border-radius: var(--radius-control);
  font-weight: 650;
  text-decoration: none;
}

.desk-link:hover {
  background: color-mix(in srgb, var(--color-text) 8%, transparent);
}

@media (max-width: 720px) {
  .site-header {
    grid-template-columns: minmax(0, 1fr) max-content max-content;
    margin: 8px 8px 0;
    top: 8px;
  }

  .brand {
    padding: 0 16px;
  }

  .brand__tagline,
  .header-menu__label,
  .header-menu__subtitle {
    display: none;
  }

  .site-nav {
    grid-column: 1 / -1;
    grid-row: 2;
    justify-content: flex-start;
    min-height: 44px;
    border-top: 2px solid var(--color-text);
  }

  .header-menu__summary {
    padding: 0 16px;
  }

  .header-menu__mobile-icon {
    display: block;
  }
}
</style>
