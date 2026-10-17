import { ref, watch } from "vue";

/** 用户选择的界面外观；system 表示跟随系统的浅深色设置。 */
export type Appearance = "system" | "light" | "dark";

const storageKey = "fesgen.appearance";

function readStoredAppearance(): Appearance {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

const appearance = ref<Appearance>(readStoredAppearance());

watch(appearance, (value) => {
  const root = document.documentElement;
  if (value === "system") {
    delete root.dataset.appearance;
  } else {
    root.dataset.appearance = value;
  }
  try {
    if (value === "system") {
      localStorage.removeItem(storageKey);
    } else {
      localStorage.setItem(storageKey, value);
    }
  } catch {
    // 隐私模式下写不进去也不影响本次会话的外观。
  }
});

/** 全站共用一份外观状态；index.html 里的内联脚本负责首帧恢复。 */
export function useAppearance() {
  return appearance;
}
