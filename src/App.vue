<script setup lang="ts">
import SiteHeader from "./components/SiteHeader.vue";
</script>

<template>
  <SiteHeader />
  <!-- 页头是 fixed 定位，这里在文档流里替它占位。 -->
  <div class="site-header-offset" aria-hidden="true" />
  <RouterView />
</template>
