/**
 * 导航指示点的线路信号，规则照搬 Fetarute-Website SiteHeader.astro 的首页信号：
 * 作品库（FesGen 的首页）每个会话随机取一条线路色，一半概率是两条不同线路的双色；
 * 同一个标签页内保持不变，避免每次切页颜色都跳。地图画固定用 DS 线，不参与随机。
 */

/** 参与随机的线路：去掉灰色主线和地图画固定使用的 DS 线，保证两个导航项颜色不同。 */
export const SIGNAL_LINE_VARIABLES = [
  "--line-fta-sl",
  "--line-surn-bs",
  "--line-surn-lt",
  "--line-surn-frn",
  "--line-surn-pn",
  "--line-surn-ws",
  "--line-surc-mt",
  "--line-surc-l",
] as const;

/** 地图画导航项的固定线路。 */
export const MAP_ART_LINE_VARIABLE = "--line-surc-ds";

const STORAGE_KEY = "fesgen.home-navigation-signal";
const DOUBLE_LINE_PROBABILITY = 0.5;

export interface NavigationSignal {
  cssVariables: string[];
  pattern: "single" | "double";
}

function random(): number {
  try {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0]! / 2 ** 32;
  } catch {
    return Math.random();
  }
}

export function isNavigationSignal(value: unknown): value is NavigationSignal {
  if (!value || typeof value !== "object") return false;
  const signal = value as Partial<NavigationSignal>;
  const allowed = SIGNAL_LINE_VARIABLES as readonly string[];
  return (
    Array.isArray(signal.cssVariables) &&
    signal.cssVariables.every((name) => typeof name === "string" && allowed.includes(name)) &&
    ((signal.pattern === "single" && signal.cssVariables.length === 1) ||
      (signal.pattern === "double" &&
        signal.cssVariables.length === 2 &&
        signal.cssVariables[0] !== signal.cssVariables[1]))
  );
}

export function createNavigationSignal(next: () => number = random): NavigationSignal {
  const pool = [...SIGNAL_LINE_VARIABLES];
  const primary = pool[Math.floor(next() * pool.length)]!;
  if (next() >= DOUBLE_LINE_PROBABILITY) {
    return { cssVariables: [primary], pattern: "single" };
  }
  const rest = pool.filter((name) => name !== primary);
  return { cssVariables: [primary, rest[Math.floor(next() * rest.length)]!], pattern: "double" };
}

/**
 * 读取或抽取本会话的信号，写到根节点的 CSS 变量上。
 * 存储不可用时不随机，保留 tokens.css 里的确定线路色。
 */
export function applyNavigationSignal(root: HTMLElement = document.documentElement): void {
  let signal: NavigationSignal | null = null;
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    try {
      const parsed: unknown = stored ? JSON.parse(stored) : null;
      if (isNavigationSignal(parsed)) signal = parsed;
    } catch {
      // 缓存损坏就重新抽取。
    }
    if (!signal) {
      const fresh = createNavigationSignal();
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      signal = fresh;
    }
  } catch {
    return;
  }
  root.style.setProperty("--home-nav-line-color", `var(${signal.cssVariables[0]})`);
  if (signal.pattern === "double") {
    root.style.setProperty("--home-nav-line-color-secondary", `var(${signal.cssVariables[1]})`);
  } else {
    root.style.removeProperty("--home-nav-line-color-secondary");
  }
  root.dataset.homeNavIndicatorPattern = signal.pattern;
}
