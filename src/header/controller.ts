/**
 * 页头交互控制器，移植自 Fetarute-Website src/components/SiteHeader.astro 的页头脚本，行为与网站保持一致：
 *
 * - 菜单（服务台、出口等 details）：精细指针悬停即预览，点击固定；从导视牌底边裁切向下揭示（220ms），
 *   收起时沿原路反向（160ms），播放途中可随时反转；Esc 收起并把焦点还给触发牌；点页面其他地方收起。
 * - 阅读收束：桌面精细指针下，向下阅读超过 160px 后收成窄条，向上滚或回到顶部立即恢复；
 *   指针移入窄条时临时展开，离开 180ms 后收回；键盘焦点进入时立即展开。
 *   收束与展开按“内容退场 → 外壳变形 → 内容入场”三段交接，避免两种密度的文字在同一帧重叠。
 *
 * 去掉了网站独有的首页长廊固定（Gallery pinned）与深链锚点校准：FesGen 用 hash 路由，没有正文锚点。
 * 网站那边改了交互，这里也要同步。
 */

type HeaderContentPhase = "contracting" | "compact-entering" | "expanding" | "expanded-entering";

const COMPACT_SCROLL_THRESHOLD = 160;
const COMPACT_SCROLL_DIRECTION_THRESHOLD = 8;
const COMPACT_HOVER_CONTRACT_DELAY = 180;
const MENU_REVEAL_DURATION = 220;
const MENU_CLOSE_DURATION = 160;
const HOVER_CLOSE_DELAY = MENU_REVEAL_DURATION + 100;

export interface HeaderController {
  dispose(): void;
  /** 路由切换后立即收起所有菜单（不播放动画，新页面不应看到上一页的展开状态）。 */
  closeAllMenus(): void;
}

export function createHeaderController(header: HTMLElement): HeaderController {
  const root = document.documentElement;
  const listeners = new AbortController();
  const { signal } = listeners;
  const menus = Array.from(header.querySelectorAll<HTMLDetailsElement>("[data-header-menu]"));
  const compactLayoutQuery = window.matchMedia(
    "(min-width: 761px) and (hover: hover) and (pointer: fine)",
  );

  const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supportsHoverPreview = () =>
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const motionEasing = () =>
    getComputedStyle(root).getPropertyValue("--motion-header-standard-spatial").trim() ||
    "ease-out";

  // —— 菜单 ——

  const menuAnimations = new WeakMap<
    HTMLDetailsElement,
    { direction: "opening" | "closing"; animation: Animation }
  >();
  const hoverCloseTimers = new WeakMap<HTMLDetailsElement, number>();
  const hoverPreviewMenus = new WeakSet<HTMLDetailsElement>();
  const pinnedMenus = new WeakSet<HTMLDetailsElement>();

  const panelOf = (menu: HTMLDetailsElement) =>
    menu.querySelector<HTMLElement>("[data-header-menu-panel]");

  function cancelHoverClose(menu: HTMLDetailsElement) {
    const timer = hoverCloseTimers.get(menu);
    if (timer === undefined) return;
    window.clearTimeout(timer);
    hoverCloseTimers.delete(menu);
  }

  function scheduleHoverClose(menu: HTMLDetailsElement) {
    cancelHoverClose(menu);
    if (pinnedMenus.has(menu)) return;
    const timer = window.setTimeout(() => {
      hoverCloseTimers.delete(menu);
      if (pinnedMenus.has(menu) || menu.matches(":hover") || menu.contains(document.activeElement))
        return;
      closeMenu(menu);
    }, HOVER_CLOSE_DELAY);
    hoverCloseTimers.set(menu, timer);
  }

  function reopenMenu(menu: HTMLDetailsElement) {
    const active = menuAnimations.get(menu);
    if (active?.direction !== "closing") return;
    active.direction = "opening";
    delete menu.dataset.closing;
    active.animation.reverse();
  }

  function openMenu(menu: HTMLDetailsElement) {
    if (!menu.open) return;
    menus.forEach((other) => {
      if (other !== menu && other.open) closeMenu(other);
    });
    if (reducedMotion()) return;
    const panel = panelOf(menu);
    if (!panel) return;
    const active = menuAnimations.get(menu);
    if (active?.direction === "closing") {
      reopenMenu(menu);
      return;
    }
    active?.animation.cancel();
    const animation = panel.animate([{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0)" }], {
      duration: MENU_REVEAL_DURATION,
      easing: motionEasing(),
      fill: "both",
    });
    const record = { direction: "opening" as const, animation };
    menuAnimations.set(menu, record);
    animation.finished
      .catch(() => undefined)
      .then(() => {
        if (menuAnimations.get(menu) !== record || record.direction !== "opening") return;
        animation.cancel();
        menuAnimations.delete(menu);
      });
  }

  function closeMenu(menu: HTMLDetailsElement, restoreFocus = false) {
    cancelHoverClose(menu);
    if (!menu.open) {
      hoverPreviewMenus.delete(menu);
      pinnedMenus.delete(menu);
      return;
    }
    const finish = () => {
      const shouldRestoreFocus = restoreFocus && menu.contains(document.activeElement);
      menu.removeAttribute("open");
      delete menu.dataset.closing;
      menuAnimations.delete(menu);
      hoverPreviewMenus.delete(menu);
      pinnedMenus.delete(menu);
      if (shouldRestoreFocus) menu.querySelector<HTMLElement>("summary")?.focus();
    };
    if (reducedMotion()) {
      finish();
      return;
    }
    const active = menuAnimations.get(menu);
    if (active?.direction === "closing") return;
    menu.dataset.closing = "true";
    if (active?.direction === "opening") {
      active.direction = "closing";
      active.animation.reverse();
      active.animation.finished
        .catch(() => undefined)
        .then(() => {
          if (menuAnimations.get(menu) === active && active.direction === "closing") finish();
        });
      return;
    }
    const panel = panelOf(menu);
    if (!panel) {
      finish();
      return;
    }
    const animation = panel.animate([{ clipPath: "inset(0)" }, { clipPath: "inset(0 0 100% 0)" }], {
      duration: MENU_CLOSE_DURATION,
      easing: motionEasing(),
      fill: "forwards",
    });
    const record = { direction: "closing" as const, animation };
    menuAnimations.set(menu, record);
    animation.finished
      .catch(() => undefined)
      .then(() => {
        if (menuAnimations.get(menu) === record && record.direction === "closing") finish();
      });
  }

  menus.forEach((menu) => {
    menu.addEventListener(
      "toggle",
      () => {
        if (menu.open) openMenu(menu);
      },
      { signal },
    );

    menu.addEventListener(
      "pointerenter",
      () => {
        if (!supportsHoverPreview() || pinnedMenus.has(menu)) return;
        cancelHoverClose(menu);
        hoverPreviewMenus.add(menu);
        if (menu.open) reopenMenu(menu);
        else menu.open = true;
      },
      { signal },
    );

    menu.addEventListener(
      "pointerleave",
      () => {
        if (supportsHoverPreview()) scheduleHoverClose(menu);
      },
      { signal },
    );

    menu.addEventListener(
      "focusout",
      (event) => {
        const next = event.relatedTarget;
        if (next instanceof Node && menu.contains(next)) return;
        if (hoverPreviewMenus.has(menu)) scheduleHoverClose(menu);
      },
      { signal },
    );

    menu.querySelector<HTMLElement>("summary")?.addEventListener(
      "click",
      (event) => {
        if (!menu.open) {
          // 触摸、键盘或没有先悬停的点击：打开并固定。
          pinnedMenus.add(menu);
          return;
        }
        event.preventDefault();
        cancelHoverClose(menu);
        if (hoverPreviewMenus.has(menu)) {
          // 悬停预览之后的第一次点击用来固定菜单，而不是把它关掉。
          hoverPreviewMenus.delete(menu);
          pinnedMenus.add(menu);
          return;
        }
        if (menuAnimations.get(menu)?.direction === "closing") reopenMenu(menu);
        else closeMenu(menu);
      },
      { signal },
    );

    // 点了菜单里的链接（站内跳转或新标签页）就收起，回来时不会看到过期的展开状态。
    menu.querySelectorAll<HTMLAnchorElement>("[data-header-menu-link]").forEach((link) => {
      link.addEventListener("click", () => closeMenu(menu), { signal });
    });
  });

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      menus.forEach((menu) => {
        if (menu.open && !menu.contains(target)) closeMenu(menu);
      });
    },
    { signal },
  );

  // Esc 在整个文档上监听：Safari 点 summary 不会聚焦，焦点可能根本不在菜单里。
  // 捕获阶段先于页面自己的快捷键执行；收起了菜单就 preventDefault，页面（例如编辑器取消选中）据此跳过这一次 Esc。
  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      const open = menus.filter(
        (menu) => menu.open && menuAnimations.get(menu)?.direction !== "closing",
      );
      if (open.length === 0) return;
      event.preventDefault();
      open.forEach((menu) => closeMenu(menu, true));
    },
    { capture: true, signal },
  );

  // —— 阅读收束 ——

  let lastScrollPosition = window.scrollY;
  let syncFrame: number | undefined;
  let hasSynced = false;
  let scrollDirection: "up" | "down" | undefined;
  let scrollDirectionDistance = 0;
  let hoverContractTimer: number | undefined;
  let layoutIntent: { compact: boolean; hoverExpanded: boolean } | undefined;
  let handoffRun = 0;
  let handoffController: AbortController | undefined;

  function cancelHoverContract() {
    if (hoverContractTimer === undefined) return;
    window.clearTimeout(hoverContractTimer);
    hoverContractTimer = undefined;
  }

  const mustStayExpanded = () => window.scrollY < COMPACT_SCROLL_THRESHOLD;

  function applyLayoutState(compact: boolean, hoverExpanded: boolean) {
    root.toggleAttribute("data-header-compact", compact);
    root.toggleAttribute("data-header-hover-expanded", compact && hoverExpanded);
  }

  const canStageHandoff = () => !reducedMotion() && window.matchMedia("(min-width: 761px)").matches;

  const isVisuallyCompact = () =>
    root.hasAttribute("data-header-compact") && !root.hasAttribute("data-header-hover-expanded");

  function setContentPhase(phase: HeaderContentPhase | undefined, ready = false) {
    if (!phase) {
      delete root.dataset.headerContentPhase;
      root.removeAttribute("data-header-content-ready");
      return;
    }
    root.dataset.headerContentPhase = phase;
    root.toggleAttribute("data-header-content-ready", ready);
  }

  function cancelHandoff() {
    handoffRun += 1;
    handoffController?.abort();
    handoffController = undefined;
    return handoffRun;
  }

  /** 等目标内容的透明度过渡结束；元素不存在时直接继续，不用定时器兜底跳变。 */
  function waitForOpacity(element: Element | null, run: number) {
    if (!element) return Promise.resolve();
    const controller = new AbortController();
    handoffController = controller;
    return new Promise<void>((resolve) => {
      const complete = () => {
        if (handoffController === controller) handoffController = undefined;
        resolve();
      };
      const onEnd = (event: Event) => {
        if (
          event.target === element &&
          event instanceof TransitionEvent &&
          event.propertyName === "opacity"
        ) {
          complete();
        }
      };
      controller.signal.addEventListener("abort", complete, { once: true });
      element.addEventListener("transitionend", onEnd, { signal: controller.signal });
      element.addEventListener("transitioncancel", onEnd, { signal: controller.signal });
      if (run !== handoffRun) controller.abort();
    });
  }

  function revealContent(
    phase: "compact-entering" | "expanded-entering",
    selector: string,
    run: number,
  ) {
    setContentPhase(phase);
    const completion = waitForOpacity(header.querySelector(selector), run);
    window.requestAnimationFrame(() => {
      if (run === handoffRun) setContentPhase(phase, true);
    });
    void completion.then(() => {
      if (run === handoffRun) setContentPhase(undefined);
    });
  }

  function setLayoutState(compact: boolean, hoverExpanded: boolean, animate = true) {
    const normalizedHover = compact && hoverExpanded;
    const isCompact = root.hasAttribute("data-header-compact");
    const isHoverExpanded = root.hasAttribute("data-header-hover-expanded");
    if (layoutIntent?.compact === compact && layoutIntent.hoverExpanded === normalizedHover) return;
    layoutIntent = { compact, hoverExpanded: normalizedHover };

    // 完整出口牌即将被紧凑态替代时先收起，避免回到完整态时遗留展开状态。
    if (compact && !normalizedHover) {
      const fullExit = header.querySelector<HTMLDetailsElement>(".exit-menu");
      if (fullExit) closeMenu(fullExit);
    }

    if (!animate || !canStageHandoff()) {
      cancelHandoff();
      setContentPhase(undefined);
      if (isCompact === compact && isHoverExpanded === normalizedHover) return;
      root.dataset.headerLayoutInitializing = "true";
      applyLayoutState(compact, normalizedHover);
      window.requestAnimationFrame(() => {
        delete root.dataset.headerLayoutInitializing;
      });
      return;
    }

    const run = cancelHandoff();
    const currentPhase = root.dataset.headerContentPhase as HeaderContentPhase | undefined;
    const currentReady = root.hasAttribute("data-header-content-ready");
    const nextVisuallyCompact = compact && !normalizedHover;
    if (nextVisuallyCompact === isVisuallyCompact()) {
      setContentPhase(undefined);
      applyLayoutState(compact, normalizedHover);
      return;
    }

    if (nextVisuallyCompact) {
      if (currentPhase === "expanded-entering" && !currentReady) {
        applyLayoutState(compact, normalizedHover);
        revealContent("compact-entering", ".home-nav-compact-signal", run);
        return;
      }
      setContentPhase("contracting");
      void waitForOpacity(header.querySelector(".exit-menu"), run).then(() => {
        if (run !== handoffRun) return;
        applyLayoutState(compact, normalizedHover);
        revealContent("compact-entering", ".home-nav-compact-signal", run);
      });
      return;
    }

    if (currentPhase === "compact-entering" && !currentReady) {
      applyLayoutState(compact, normalizedHover);
      revealContent("expanded-entering", ".exit-menu", run);
      return;
    }
    setContentPhase("expanding");
    void waitForOpacity(header.querySelector(".compact-exit-menu"), run).then(() => {
      if (run !== handoffRun) return;
      applyLayoutState(compact, normalizedHover);
      revealContent("expanded-entering", ".exit-menu", run);
    });
  }

  function syncCompact() {
    syncFrame = undefined;
    if (!compactLayoutQuery.matches) {
      setLayoutState(false, false, false);
      return;
    }
    const position = window.scrollY;
    const delta = position - lastScrollPosition;
    const direction = delta > 0 ? "down" : delta < 0 ? "up" : undefined;
    if (direction) {
      if (direction === scrollDirection) scrollDirectionDistance += Math.abs(delta);
      else {
        scrollDirection = direction;
        scrollDirectionDistance = Math.abs(delta);
      }
    }
    if (position < COMPACT_SCROLL_THRESHOLD) {
      setLayoutState(false, false, hasSynced);
      cancelHoverContract();
      scrollDirection = undefined;
      scrollDirectionDistance = 0;
    } else if (scrollDirection === "up") {
      setLayoutState(false, false, hasSynced);
      cancelHoverContract();
    } else if (
      scrollDirection === "down" &&
      scrollDirectionDistance >= COMPACT_SCROLL_DIRECTION_THRESHOLD
    ) {
      setLayoutState(true, false, hasSynced);
    } else if (scrollDirection === undefined) {
      // 刷新或回退时直接落在页面中部：以紧凑态作为初始状态。
      setLayoutState(true, false, hasSynced);
    }
    lastScrollPosition = position;
    hasSynced = true;
  }

  function scheduleSync() {
    if (!compactLayoutQuery.matches || syncFrame !== undefined) return;
    syncFrame = window.requestAnimationFrame(syncCompact);
  }

  /** 指针进入窄条时临时展开；服务台和紧凑出口除外，保持它们的位置稳定。 */
  function expandOnHover(event: PointerEvent) {
    if (!supportsHoverPreview() || !root.hasAttribute("data-header-compact")) return;
    cancelHoverContract();
    if (
      event.target instanceof Element &&
      event.target.closest(".service-desk, .compact-exit-menu")
    )
      return;
    setLayoutState(true, true);
  }

  /** 键盘焦点进入时立即展开，避免下一个 Tab 落到视觉上被收起的入口。 */
  function expandOnFocus() {
    const focused = document.activeElement;
    if (focused?.closest(".compact-exit-menu")) return;
    // 鼠标点服务台也会触发 focusin，此时不能移动面板，否则随后的 click 会丢失目标。
    if (focused?.closest(".service-desk") && !focused.matches(":focus-visible")) return;
    if (!compactLayoutQuery.matches || !root.hasAttribute("data-header-compact")) return;
    cancelHoverContract();
    setLayoutState(true, true, false);
  }

  function scheduleHoverContract() {
    cancelHoverContract();
    if (mustStayExpanded()) {
      setLayoutState(false, false);
      return;
    }
    hoverContractTimer = window.setTimeout(() => {
      hoverContractTimer = undefined;
      if (header.matches(":hover")) return;
      if (mustStayExpanded()) setLayoutState(false, false);
      else setLayoutState(true, false);
    }, COMPACT_HOVER_CONTRACT_DELAY);
  }

  header.addEventListener("pointerover", expandOnHover, { signal });
  header.addEventListener("pointerleave", scheduleHoverContract, { signal });
  header.addEventListener("focusin", expandOnFocus, { signal });
  window.addEventListener("scroll", scheduleSync, { passive: true, signal });
  compactLayoutQuery.addEventListener(
    "change",
    () => {
      if (syncFrame !== undefined) {
        window.cancelAnimationFrame(syncFrame);
        syncFrame = undefined;
      }
      layoutIntent = undefined;
      lastScrollPosition = window.scrollY;
      scrollDirection = undefined;
      scrollDirectionDistance = 0;
      hasSynced = false;
      syncCompact();
    },
    { signal },
  );

  syncCompact();

  return {
    dispose() {
      listeners.abort();
      cancelHoverContract();
      cancelHandoff();
      if (syncFrame !== undefined) window.cancelAnimationFrame(syncFrame);
      setContentPhase(undefined);
      root.removeAttribute("data-header-compact");
      root.removeAttribute("data-header-hover-expanded");
    },
    closeAllMenus() {
      menus.forEach((menu) => {
        cancelHoverClose(menu);
        menuAnimations.get(menu)?.animation.cancel();
        menuAnimations.delete(menu);
        hoverPreviewMenus.delete(menu);
        pinnedMenus.delete(menu);
        menu.removeAttribute("open");
        delete menu.dataset.closing;
      });
    },
  };
}
