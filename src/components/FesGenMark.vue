<script setup lang="ts">
/**
 * FesGen 标志：由旧版 favicon（一块缩小的北宿电铁站牌）深化而来——方向箭头、站名、
 * 带站点标记的线路色带。外框与字形跟随文字色，牌面跟随表面色，深色模式下自然反转；
 * 线路蓝 #7297DD 是北宿电铁的默认线路色，深浅模式都不变。
 * 静态版本见 src/assets/brand/fesgen-mark.svg 与 public/favicon.svg，三处保持同一几何。
 */
</script>

<template>
  <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect
      x="3"
      y="3"
      width="58"
      height="58"
      rx="7"
      fill="var(--fesgen-mark-plate, var(--color-surface))"
    />
    <rect x="6" y="39" width="52" height="11" fill="#7297DD" />
    <path
      d="M25.5 39 L38.5 39 L35.2 44.4 Q32 49.2 28.8 44.4 Z"
      fill="var(--fesgen-mark-plate, var(--color-surface))"
    />
    <path
      d="M10 22.5 L19 13.5 L24.5 13.5 L17.5 20.5 L29 20.5 L29 24.5 L17.5 24.5 L24.5 31.5 L19 31.5 Z"
      fill="currentColor"
    />
    <rect x="34" y="13" width="19" height="8.5" rx="1.5" fill="currentColor" />
    <rect x="34" y="25" width="13" height="3.5" rx="1" fill="currentColor" />
    <rect
      x="3"
      y="3"
      width="58"
      height="58"
      rx="7"
      fill="none"
      stroke="currentColor"
      stroke-width="6"
    />
  </svg>
</template>
