<script setup lang="ts">
import {
  PhArrowRight,
  PhArrowSquareOut,
  PhArrowUp,
  PhArrowUpRight,
  PhCircleHalf,
  PhInfo,
  PhMoon,
  PhSun,
} from "@phosphor-icons/vue";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useAppearance, type Appearance } from "@/composables/useAppearance";
import { messages as m } from "@/i18n";
import FetaruteWordmark from "./FetaruteWordmark.vue";

/**
 * 站牌灯箱式页头，形制对齐 Fetarute-Website：
 * 字标 + 产品名；导航是“标签 + 方向箭头 + 指示点”；
 * 蓝色服务台放外观与帮助，黄色出口放外部链接，展开的面板接在色块正下方、沿用色块颜色。
 */

type Menu = "service" | "exit";

// 编辑某块牌子时仍算在“作品库”里。
const navItems = [
  {
    to: "/",
    label: m.nav.library,
    arrow: PhArrowUp,
    matches: (path: string) => path === "/" || path.startsWith("/sign/"),
  },
  {
    to: "/map-art",
    label: m.nav.mapArt,
    arrow: PhArrowRight,
    matches: (path: string) => path === "/map-art",
  },
] as const;

const exitLinks = [
  { href: "https://fetarute.org", label: m.exit.website },
  { href: "https://wiki.fetarute.org", label: m.exit.wiki },
  { href: "https://github.com/Team-Cenlinc/FesGen", label: m.exit.github },
] as const;

const appearanceOptions = [
  { value: "system", label: m.serviceDesk.appearanceSystem, icon: PhCircleHalf },
  { value: "light", label: m.serviceDesk.appearanceLight, icon: PhSun },
  { value: "dark", label: m.serviceDesk.appearanceDark, icon: PhMoon },
] as const satisfies readonly { value: Appearance; label: string; icon: unknown }[];

const appearance = useAppearance();
const appearanceIcon = computed(
  () => appearanceOptions.find((option) => option.value === appearance.value)!.icon,
);
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
    <RouterLink to="/" class="brand" :aria-label="m.app.homeLabel">
      <FetaruteWordmark class="brand__wordmark" />
      <span class="brand__divider" aria-hidden="true" />
      <span class="brand__product">
        <span class="brand__name">{{ m.app.name }}</span>
        <span class="brand__tagline">{{ m.app.tagline }}</span>
      </span>
    </RouterLink>

    <nav class="site-nav" :aria-label="m.nav.label">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ 'nav-item--active': item.matches(route.path) }"
        :aria-current="item.matches(route.path) ? 'page' : undefined"
      >
        <span class="nav-item__primary">
          <span class="nav-item__stack">
            <span class="nav-item__label">{{ item.label }}</span>
            <span class="nav-item__indicator" aria-hidden="true">
              <span class="nav-item__dot" />
              <span class="nav-item__band" />
            </span>
          </span>
          <component :is="item.arrow" class="nav-item__arrow" weight="bold" aria-hidden="true" />
        </span>
      </RouterLink>
    </nav>

    <div class="header-menu header-menu--service" :data-open="openMenu === 'service' || undefined">
      <button
        type="button"
        class="header-menu__summary"
        :aria-expanded="openMenu === 'service'"
        aria-controls="service-desk-panel"
        :aria-label="m.serviceDesk.label"
        @click="toggleMenu('service')"
      >
        <span class="header-menu__copy">
          <span class="header-menu__label">{{ m.serviceDesk.label }}</span>
          <span class="header-menu__markers" aria-hidden="true">
            <component :is="appearanceIcon" weight="bold" />
          </span>
        </span>
        <PhInfo class="header-menu__reveal" weight="bold" aria-hidden="true" />
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
          <div class="appearance" role="radiogroup" :aria-label="m.serviceDesk.appearance">
            <button
              v-for="option in appearanceOptions"
              :key="option.value"
              type="button"
              role="radio"
              class="appearance__option"
              :aria-checked="appearance === option.value"
              @click="appearance = option.value"
            >
              <component :is="option.icon" :size="20" weight="bold" aria-hidden="true" />
              {{ option.label }}
            </button>
          </div>
        </section>
        <section class="desk-section">
          <h2 class="desk-section__title">{{ m.serviceDesk.guide }}</h2>
          <p>{{ m.serviceDesk.guideBody }}</p>
        </section>
        <section class="desk-section">
          <h2 class="desk-section__title">{{ m.serviceDesk.about }}</h2>
          <p>{{ m.serviceDesk.aboutBody }}</p>
          <p class="desk-section__meta">{{ m.serviceDesk.version }} {{ version }}</p>
        </section>
        <a class="panel-link" href="https://wiki.fetarute.org" target="_blank" rel="noopener">
          {{ m.serviceDesk.wiki }}
          <PhArrowSquareOut :size="18" weight="bold" aria-hidden="true" />
        </a>
      </div>
    </div>

    <div class="header-menu header-menu--exit" :data-open="openMenu === 'exit' || undefined">
      <button
        type="button"
        class="header-menu__summary"
        :aria-expanded="openMenu === 'exit'"
        aria-controls="exit-panel"
        :aria-label="m.exit.label"
        @click="toggleMenu('exit')"
      >
        <span class="header-menu__copy">
          <span class="header-menu__label">{{ m.exit.label }}</span>
          <span class="header-menu__hint">{{ m.exit.subtitle }}</span>
        </span>
        <PhArrowUpRight class="header-menu__reveal" weight="bold" aria-hidden="true" />
      </button>
      <ul
        v-show="openMenu === 'exit'"
        id="exit-panel"
        class="header-menu__panel header-menu__panel--links"
        :aria-label="m.exit.label"
      >
        <li v-for="link in exitLinks" :key="link.href">
          <a class="panel-link" :href="link.href" target="_blank" rel="noopener">
            {{ link.label }}
            <PhArrowSquareOut :size="18" weight="bold" aria-hidden="true" />
          </a>
        </li>
      </ul>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  --header-label-size: 22px;
  --header-marker-size: 18px;
  --header-stack-gap: 4px;
  --header-reveal-size: 22px;

  position: sticky;
  z-index: 20;
  top: 12px;
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr) max-content max-content;
  width: min(calc(100% - 32px), 1392px);
  min-height: 76px;
  margin: 12px auto 0;
  background: var(--color-surface);
  box-shadow: var(--shadow-floating);
}

/* 吸顶后遮住页头上方的空隙，滚动中的内容不会从页头上沿露出来。 */
.site-header::before {
  content: "";
  position: absolute;
  z-index: -1;
  right: -16px;
  bottom: 100%;
  left: -16px;
  height: 12px;
  background: var(--color-background);
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

/* —— 品牌：Fetarute 字标 | FesGen —— */

.brand {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 24px 0 28px;
  text-decoration: none;
}

.brand__wordmark {
  display: block;
  width: 112px;
  height: auto;
  flex: 0 0 auto;
}

.brand__divider {
  width: 3px;
  height: 34px;
  background: currentColor;
}

.brand__product {
  display: grid;
  gap: 3px;
  line-height: 1;
}

.brand__name {
  font-family: var(--font-fetarute-display);
  font-size: var(--header-label-size);
  font-weight: 790;
  letter-spacing: -0.045em;
}

.brand__tagline {
  font-size: 12px;
  font-weight: 650;
  letter-spacing: -0.02em;
  color: var(--color-muted);
}

/* —— 导航：标签 + 方向箭头，下方指示点；当前页实心，悬停时点变成色带 —— */

.site-nav {
  display: flex;
  justify-content: flex-end;
  align-items: stretch;
  padding: 0 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0 16px;
  text-decoration: none;
}

/* 箭头和标签同在一行顶部对齐，指示点挂在标签下方，与网站导航同构。 */
.nav-item__primary {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  transition: transform var(--duration-press) var(--ease-out);
}

.nav-item__stack {
  display: grid;
  gap: var(--header-stack-gap);
}

.nav-item__label {
  font-size: var(--header-label-size);
  font-weight: 790;
  letter-spacing: -0.045em;
  line-height: 1.04;
}

.nav-item__arrow {
  width: var(--header-reveal-size);
  height: var(--header-reveal-size);
  flex: 0 0 auto;
  margin-top: calc((var(--header-label-size) * 1.04 - var(--header-reveal-size)) / 2);
}

.nav-item__indicator {
  position: relative;
  width: 100%;
  height: 12px;
}

.nav-item__dot,
.nav-item__band {
  position: absolute;
  transition:
    opacity var(--duration-feedback) ease,
    transform 180ms var(--ease-out);
}

.nav-item__dot {
  top: 0;
  right: calc(50% - 6px);
  width: 12px;
  height: 12px;
  border: 2.5px solid var(--color-muted);
  border-radius: 50%;
}

.nav-item--active .nav-item__dot {
  border-color: currentColor;
  background: currentColor;
}

/* 色带从标签一直延伸到箭头下方。 */
.nav-item__band {
  top: 3px;
  bottom: 3px;
  left: 0;
  right: calc(-4px - var(--header-reveal-size));
  background: currentColor;
  opacity: 0;
  transform: scaleY(0.3);
}

.nav-item:active .nav-item__primary {
  transform: translateY(1px);
}

.nav-item:focus-visible {
  outline-offset: -6px;
}

@media (hover: hover) and (pointer: fine) {
  .nav-item:hover .nav-item__dot {
    opacity: 0;
    transform: scale(0.7);
  }

  .nav-item:hover .nav-item__band {
    opacity: 1;
    transform: scaleY(1);
  }
}

/* —— 服务台与出口：色块按钮，展开的面板接在色块正下方 —— */

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
  height: 100%;
  padding: 0 22px;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition: background-color var(--duration-feedback) ease;
}

.header-menu[data-open] .header-menu__summary,
.header-menu__summary:active {
  background: color-mix(in srgb, currentColor 12%, transparent);
}

.header-menu__summary:focus-visible {
  outline-color: currentColor;
  outline-offset: -6px;
}

.header-menu__copy {
  display: grid;
  justify-items: end;
  gap: var(--header-stack-gap);
  text-align: right;
  transition: transform var(--duration-press) var(--ease-out);
}

.header-menu__summary:active .header-menu__copy {
  transform: translateY(1px);
}

.header-menu__label {
  font-size: var(--header-label-size);
  font-weight: 790;
  letter-spacing: -0.045em;
  line-height: 1.04;
}

.header-menu__markers {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  height: var(--header-marker-size);
}

.header-menu__markers svg {
  width: var(--header-marker-size);
  height: var(--header-marker-size);
}

.header-menu__hint {
  font-size: 12px;
  font-weight: 650;
  letter-spacing: -0.04em;
  line-height: var(--header-marker-size);
}

/* 悬停或展开时，右侧滑出方向提示：服务台 ⓘ，出口 ↗。 */
.header-menu__reveal {
  width: 0;
  height: var(--header-reveal-size);
  margin-inline-start: 0;
  flex: 0 0 auto;
  opacity: 0;
  transform: translateX(6px);
  transition:
    width 180ms var(--ease-out),
    margin-inline-start 180ms var(--ease-out),
    opacity var(--duration-feedback) ease,
    transform var(--duration-feedback) var(--ease-out);
}

.header-menu[data-open] .header-menu__reveal,
.header-menu__summary:focus-visible .header-menu__reveal {
  width: var(--header-reveal-size);
  margin-inline-start: 8px;
  opacity: 1;
  transform: none;
}

@media (hover: hover) and (pointer: fine) {
  .header-menu__summary:hover {
    background: color-mix(in srgb, currentColor 8%, transparent);
  }

  .header-menu__summary:hover .header-menu__reveal {
    width: var(--header-reveal-size);
    margin-inline-start: 8px;
    opacity: 1;
    transform: none;
  }
}

/* 面板从色块下沿展开，略微下滑淡入。 */
.header-menu__panel {
  position: absolute;
  z-index: 3;
  top: 100%;
  right: 0;
  display: grid;
  gap: 22px;
  width: min(320px, calc(100vw - 24px));
  margin: 0;
  padding: 22px;
  border: var(--border-sign);
  border-top: 0;
  background: inherit;
  color: inherit;
  box-shadow: var(--shadow-feedback);
  list-style: none;
  transition:
    opacity 160ms var(--ease-out),
    transform 160ms var(--ease-out);

  @starting-style {
    opacity: 0;
    transform: translateY(-6px);
  }
}

.header-menu__panel--links {
  gap: 2px;
  width: min(280px, calc(100vw - 24px));
  padding: 10px;
}

.desk-section {
  display: grid;
  gap: 10px;
}

.desk-section__title {
  font-size: 15px;
  font-weight: 790;
  letter-spacing: -0.02em;
}

.desk-section p {
  font-size: 14px;
  line-height: 1.6;
}

.desk-section__meta {
  font-family: var(--font-fetarute-display);
  font-size: 13px !important;
  font-weight: 700;
}

.appearance {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.appearance__option {
  display: grid;
  justify-items: center;
  gap: 4px;
  padding: 10px 4px;
  border: 2px solid color-mix(in srgb, currentColor 45%, transparent);
  border-radius: var(--radius-control);
  background: transparent;
  color: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color var(--duration-feedback) ease,
    transform var(--duration-press) var(--ease-out);
}

.appearance__option:active {
  transform: scale(0.96);
}

/* 选中项反白：服务台蓝上的浅色实底。 */
.appearance__option[aria-checked="true"] {
  border-color: var(--color-service-text);
  background: var(--color-service-text);
  color: var(--color-service);
}

.appearance__option:focus-visible {
  outline-color: currentColor;
}

.panel-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 44px;
  padding: 0 12px;
  border-radius: var(--radius-control);
  font-size: 15px;
  font-weight: 750;
  text-decoration: none;
  transition: background-color var(--duration-feedback) ease;
}

.panel-link:focus-visible {
  outline-color: currentColor;
  outline-offset: -3px;
}

@media (hover: hover) and (pointer: fine) {
  .appearance__option[aria-checked="false"]:hover,
  .panel-link:hover {
    background: color-mix(in srgb, currentColor 12%, transparent);
  }
}

/* —— 中等宽度：收小字号，去掉产品副标题 —— */

@media (max-width: 1023px) {
  .site-header {
    --header-label-size: 19px;
    --header-reveal-size: 20px;
  }

  .brand {
    padding: 0 18px 0 22px;
    gap: 12px;
  }

  .brand__wordmark {
    width: 92px;
  }

  .brand__tagline {
    display: none;
  }

  .nav-item {
    padding: 0 10px;
  }

  .header-menu__summary {
    padding: 0 16px;
  }
}

/* —— 手机：品牌和两个色块占一行，导航另起一行；色块只留图标 —— */

@media (max-width: 719px) {
  .site-header {
    --header-label-size: 18px;
    grid-template-columns: minmax(0, 1fr) max-content max-content;
    width: calc(100% - 16px);
    min-height: 0;
    margin-top: 8px;
    top: 8px;
  }

  .site-header::before {
    height: 8px;
  }

  .brand {
    min-height: 56px;
    padding: 0 14px 0 16px;
  }

  .brand__wordmark {
    width: 78px;
  }

  .brand__divider {
    height: 24px;
  }

  .site-nav {
    grid-column: 1 / -1;
    grid-row: 2;
    justify-content: flex-start;
    min-height: 52px;
    padding: 0 4px;
    border-top: var(--border-sign);
  }

  .header-menu__copy {
    display: none;
  }

  .header-menu__summary {
    padding: 0 16px;
  }

  .header-menu__reveal {
    width: var(--header-reveal-size);
    margin-inline-start: 0;
    opacity: 1;
    transform: none;
  }

  .header-menu[data-open] .header-menu__reveal,
  .header-menu__summary:hover .header-menu__reveal {
    margin-inline-start: 0;
  }

  /* 面板改以整个页头为基准，全宽展开在页头下方，不会被挤出屏幕。 */
  .header-menu {
    position: static;
  }

  .header-menu__panel,
  .header-menu__panel--links {
    left: 0;
    width: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nav-item__dot,
  .nav-item__band,
  .header-menu__reveal,
  .header-menu__panel {
    transition: none;
  }
}
</style>
