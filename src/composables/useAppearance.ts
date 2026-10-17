import { ref, watch } from "vue";

/** 用户选择的界面外观；system 表示跟随系统的浅深色设置。 */
export type Appearance = "system" | "light" | "dark";

const storageKey = "fesgen.appearance";

/** 浏览器工具栏颜色（theme-color），即两套外观的画布色 --palette-canvas；index.html 首帧脚本里有同一份。 */
const THEME_COLORS = { light: "#F0F1F0", dark: "#111416" } as const;

/** 手动外观时两条 theme-color 都用选中的颜色；跟随系统时各自回到自己 media 对应的颜色。 */
function syncThemeColor(value: Appearance) {
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    const scheme = meta.dataset.colorScheme === "dark" ? "dark" : "light";
    meta.content = THEME_COLORS[value === "system" ? scheme : value];
  });
}

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
  syncThemeColor(value);
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
