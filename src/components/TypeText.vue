<script setup lang="ts">
import { computed } from "vue";
import { typeRuns } from "@/utils/typeset";

/**
 * 中西混排的短标签。Noto Sans SC 的汉字几乎占满字身，和 Noto Sans Display 的数字放在一起，
 * 同字号同字重时汉字大一圈、黑一档，乘号 × 只有数字的六成高，显得又小又低。
 * 这里把三类字符分开，由外层用 --type-cjk-weight、--type-latin-size 微调（不设就继承）；
 * 乘号统一放大并保持在数字中线上。样式在 base.css 的 .type-* 规则里。
 */
const props = defineProps<{ text: string }>();
const runs = computed(() => typeRuns(props.text));
</script>

<template>
  <template v-for="(run, index) in runs" :key="index">
    <span v-if="run.kind === 'cjk'" class="type-cjk">{{ run.text }}</span>
    <span v-else-if="run.kind === 'latin'" class="type-latin">{{ run.text }}</span>
    <span v-else-if="run.kind === 'times'" class="type-times">{{ run.text }}</span>
    <template v-else>{{ run.text }}</template>
  </template>
</template>
