<script setup lang="ts">
import { PhCircleHalf, PhMoon, PhSun } from "@phosphor-icons/vue";
import { useAppearance, type Appearance } from "@/composables/useAppearance";
import { messages as m } from "@/i18n";

/** 服务台里的外观选择：三行列表，当前项用 aria-pressed 标出，与网站同构。 */
defineProps<{ headingId: string }>();

const options = [
  { value: "system", label: m.serviceDesk.appearanceSystem, icon: PhCircleHalf },
  { value: "light", label: m.serviceDesk.appearanceLight, icon: PhSun },
  { value: "dark", label: m.serviceDesk.appearanceDark, icon: PhMoon },
] as const satisfies readonly { value: Appearance; label: string; icon: unknown }[];

const appearance = useAppearance();
</script>

<template>
  <section class="service-menu__group" :aria-labelledby="headingId">
    <h2 :id="headingId" class="service-menu__heading">{{ m.serviceDesk.appearance }}</h2>
    <div class="appearance-options">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="appearance-choice"
        :aria-pressed="appearance === option.value"
        @click="appearance = option.value"
      >
        <span class="appearance-choice__icon" aria-hidden="true">
          <component :is="option.icon" weight="bold" />
        </span>
        <span>{{ option.label }}</span>
      </button>
    </div>
  </section>
</template>
