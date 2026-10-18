import {
  PhArrowRight,
  PhArrowUp,
  PhBookOpenText,
  PhGitBranch,
  PhGlobeSimple,
} from "@phosphor-icons/vue";
import type { Component } from "vue";
import { messages as m } from "@/i18n";
import { MAP_ART_LINE_VARIABLE } from "./navigationSignal";

/** 页头主导航项；完整页头、紧凑信号和小屏“菜单”共用这一份。 */
export interface PrimaryNavItem {
  key: string;
  to: string;
  label: string;
  /** 方向箭头，和网站一样统一用 Phosphor Bold。 */
  arrow: Component;
  /** 固定线路色的 CSS 变量名；不填则使用本会话抽到的随机信号（见 navigationSignal.ts）。 */
  lineVariable?: string;
  matches(path: string): boolean;
}

export const primaryNavItems: readonly PrimaryNavItem[] = [
  {
    key: "library",
    to: "/",
    label: m.nav.library,
    arrow: PhArrowUp,
    // 编辑某块牌子时仍算在“作品库”里。
    matches: (path) => path === "/" || path.startsWith("/sign/"),
  },
  {
    key: "map-art",
    to: "/map-art",
    label: m.nav.mapArt,
    arrow: PhArrowRight,
    lineVariable: MAP_ART_LINE_VARIABLE,
    matches: (path) => path === "/map-art",
  },
];

/** 出口里的外部服务。图标按语义选，不把第三方品牌图形带进导航（与网站同一规则）。 */
export const externalDestinations = [
  { key: "website", href: "https://fetarute.org", label: m.exit.website, icon: PhGlobeSimple },
  { key: "wiki", href: "https://wiki.fetarute.org", label: m.exit.wiki, icon: PhBookOpenText },
  {
    key: "github",
    href: "https://github.com/Team-Cenlinc/FesGen",
    label: m.exit.github,
    icon: PhGitBranch,
  },
] as const;

/**
 * 导航项和紧凑信号共用的线路属性：fixed 是固定线路，session 是本会话的随机信号（可能是双色）。
 * 固定线路的导航项在自身覆盖线路色，避免继承根节点上的会话随机色。
 */
export function navSignalAttrs(item: PrimaryNavItem): {
  "data-home-nav-signal": "fixed" | "session";
  style?: Record<string, string>;
} {
  return item.lineVariable
    ? {
        "data-home-nav-signal": "fixed",
        style: { "--home-nav-line-color": `var(${item.lineVariable})` },
      }
    : { "data-home-nav-signal": "session" };
}
