import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import type { SignDocument, SignStyleId } from "@/signs/types";
import { createSign, duplicateSign } from "./document";
import { readLibrary, writeLibrary } from "./storage";

/** 作品库：所有牌子的列表，改动后自动写回 localStorage。 */
export const useLibrary = defineStore("library", () => {
  const signs = ref<SignDocument[]>(readLibrary());
  const saveFailed = ref(false);

  const sorted = computed(() => [...signs.value].sort((a, b) => b.updatedAt - a.updatedAt));

  let timer: ReturnType<typeof setTimeout> | undefined;
  watch(
    signs,
    (value) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        saveFailed.value = !writeLibrary(value);
      }, 250);
    },
    { deep: true },
  );

  function get(id: string): SignDocument | undefined {
    return signs.value.find((sign) => sign.id === id);
  }

  function add(sign: SignDocument): SignDocument {
    signs.value.push(sign);
    return sign;
  }

  function create(style: SignStyleId): SignDocument {
    return add(createSign(style));
  }

  function duplicate(id: string): SignDocument | undefined {
    const source = get(id);
    return source ? add(duplicateSign(source)) : undefined;
  }

  /** 用编辑器里的最新状态覆盖存档。“最近修改”时间由编辑器维护，只更新缩略图时不会改动它。 */
  function save(sign: SignDocument) {
    const index = signs.value.findIndex((item) => item.id === sign.id);
    if (index === -1) signs.value.push(sign);
    else signs.value[index] = sign;
  }

  function rename(id: string, name: string) {
    const sign = get(id);
    const trimmed = name.trim();
    if (sign && trimmed) {
      sign.name = trimmed.slice(0, 80);
      sign.updatedAt = Date.now();
    }
  }

  function remove(id: string) {
    signs.value = signs.value.filter((sign) => sign.id !== id);
  }

  return { signs, sorted, saveFailed, get, add, create, duplicate, save, rename, remove };
});
