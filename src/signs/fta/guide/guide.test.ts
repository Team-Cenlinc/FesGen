import { readFileSync } from "node:fs";
import { parse } from "opentype.js";
import { describe, expect, it } from "vitest";
import { OpentypeShaper } from "@/fonts/shaper";
import type { FontId } from "@/fonts/stacks";
import { getSignStyle } from "../../registry";
import type { RenderNode, RenderTree } from "../../render";
import { ftaGuideStyle } from ".";
import {
  FTA_GUIDE_ARROWS,
  ftaGuideDefaults,
  ftaGuidePanel,
  normalizeFtaGuide,
  type FtaGuideContent,
} from "./content";
import { arrowPolygon, centroidX, FTA_GUIDE_EXIT, FTA_GUIDE_MODULES as M } from "./layout";

function load(path: string) {
  const bytes = readFileSync(path);
  return parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), {
    lowMemory: true,
  });
}

const shaper = new OpentypeShaper(
  new Map<FontId, ReturnType<typeof parse>>([
    [
      "noto-sans-display-500",
      load("src/assets/fonts/noto-sans-display/NotoSansDisplay-Medium.ttf"),
    ],
    ["noto-sans-display-700", load("src/assets/fonts/noto-sans-display/NotoSansDisplay-Bold.ttf")],
    [
      "noto-sans-display-800",
      load("src/assets/fonts/noto-sans-display/NotoSansDisplay-ExtraBold.ttf"),
    ],
    [
      "noto-sans-sc-700",
      load("node_modules/@expo-google-fonts/noto-sans-sc/700Bold/NotoSansSC_700Bold.ttf"),
    ],
    [
      "noto-sans-sc-800",
      load("node_modules/@expo-google-fonts/noto-sans-sc/800ExtraBold/NotoSansSC_800ExtraBold.ttf"),
    ],
  ]),
);

function layout(content: FtaGuideContent, width = 512, height = 128): RenderTree {
  return ftaGuideStyle.layout({ content, size: { width, height }, shaper, tweaks: {} });
}

function withPanels(...panels: Parameters<typeof ftaGuidePanel>[0][]): FtaGuideContent {
  return { ...ftaGuideDefaults(), panels: panels.map((p) => ftaGuidePanel(p)) };
}

function walk(nodes: readonly RenderNode[], visit: (node: RenderNode) => void) {
  for (const node of nodes) {
    visit(node);
    if (node.kind === "group") walk(node.children, visit);
  }
}

function rects(nodes: readonly RenderNode[]) {
  const out: Extract<RenderNode, { kind: "rect" }>[] = [];
  walk(nodes, (node) => {
    if (node.kind === "rect") out.push(node);
  });
  return out;
}

function polygons(nodes: readonly RenderNode[]) {
  const out: Extract<RenderNode, { kind: "polygon" }>[] = [];
  walk(nodes, (node) => {
    if (node.kind === "polygon") out.push(node);
  });
  return out;
}

describe("FTA 导视牌：内容", () => {
  it("登记为新样式，默认 1×4 方向牌", () => {
    expect(getSignStyle("FTA-guide")).toBe(ftaGuideStyle);
    expect(ftaGuideStyle.defaultSize).toEqual({ mode: "grid", grid: { rows: 1, columns: 4 } });
    const content = ftaGuideDefaults();
    expect(content.panels.map((p) => p.tone)).toEqual(["main", "exit"]);
    expect(content.lineMark).toBe("solid");
  });

  it("纠正类型：未知底色退回黑，空面板列表补默认，图标补齐", () => {
    const content = normalizeFtaGuide({
      background: "#FF00FF",
      panels: [],
      lineMark: "pill",
    });
    expect(content.background).toBe("black");
    expect(content.lineMark).toBe("solid");
    expect(content.panels.length).toBeGreaterThan(0);
    const panel = normalizeFtaGuide({ panels: [{ row: 2, icons: { toilet: true } }] }).panels[0]!;
    expect(panel.row).toBe("2");
    expect(panel.icons.toilet).toBe(true);
    expect(panel.icons.elevator).toBe(false);
  });

  it("套用模板只换面板，车站和线路不变", () => {
    const content = ftaGuideDefaults();
    const entrance = ftaGuideStyle.applyAction(content, "template:entrance");
    expect(entrance.panels.map((p) => p.kind)).toEqual(["station", "dest"]);
    expect(entrance.lines).toEqual(content.lines);
    expect(entrance.station).toEqual(content.station);
    const added = ftaGuideStyle.applyAction(content, "add-panel");
    expect(added.panels).toHaveLength(content.panels.length + 1);
  });
});

describe("FTA 导视牌：箭头", () => {
  const directions = FTA_GUIDE_ARROWS.filter((d) => d !== "none");

  it("八个方向都正好撑满同一个方框", () => {
    for (const dir of directions) {
      const points = arrowPolygon(dir, 56);
      const xs = points.map((p) => p[0]);
      const ys = points.map((p) => p[1]);
      expect(Math.min(...xs)).toBeGreaterThanOrEqual(-0.01);
      expect(Math.max(...ys)).toBeLessThanOrEqual(56.01);
      expect(
        Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)),
      ).toBeCloseTo(56, 1);
    }
  });

  it("箭杆粗细和箭头大小八个方向都一样，斜箭头不会变细", () => {
    const measure = (dir: (typeof directions)[number]) => {
      const p = arrowPolygon(dir, 56);
      const dist = (a: number, b: number) => Math.hypot(p[a]![0] - p[b]![0], p[a]![1] - p[b]![1]);
      return { shaft: dist(0, 6), head: dist(2, 4) };
    };
    const straight = measure("right");
    for (const dir of directions) {
      expect(measure(dir).shaft).toBeCloseTo(straight.shaft, 5);
      expect(measure(dir).head).toBeCloseTo(straight.head, 5);
    }
  });
});

describe("FTA 导视牌：面板排版", () => {
  it("面板首尾相接铺满整行，出口面板是黄色", () => {
    const tree = layout(ftaGuideDefaults());
    const a = tree.items![`${M.panels}#0`]!;
    const b = tree.items![`${M.panels}#1`]!;
    expect(a.x).toBe(0);
    expect(b.x + b.width).toBe(512);
    expect(b.x).toBe(a.x + a.width + 2);
    expect(rects(tree.background).some((r) => r.fill === FTA_GUIDE_EXIT && r.x === b.x)).toBe(true);
  });

  it("同色面板之间露出分隔线，不同色面板直接相接", () => {
    const same = layout(withPanels({ name: "卫生间" }, { name: "售票" }));
    const gap = same.items![`${M.panels}#0`]!.width;
    expect(rects(same.background).find((r) => r.x === gap && r.width === 2)?.fill).toBe("#707070");
    const mixed = layout(ftaGuideDefaults());
    const edge = mixed.items![`${M.panels}#0`]!.width;
    expect(rects(mixed.background).find((r) => r.x === edge && r.width === 2)?.fill).toBe(
      "#191919",
    );
  });

  it("向右的箭头贴在面板右侧，向左的贴在左侧", () => {
    const tree = layout(ftaGuideDefaults());
    const [first, second] = [tree.items![`${M.panels}#0`]!, tree.items![`${M.panels}#1`]!];
    const arrows = polygons(tree.content).map((p) =>
      p.points.split(" ").map((pair) => Number(pair.split(",")[0])),
    );
    const lefts = arrows.map((xs) => Math.min(...xs));
    expect(lefts.some((x) => x < first.x + 30)).toBe(true);
    expect(arrows.some((xs) => Math.max(...xs) > second.x + second.width - 30)).toBe(true);
  });

  it("有面板在第二行时分成两行，各占一半高", () => {
    const tree = layout(
      withPanels({ name: "望山线" }, { row: "2", tone: "exit", exits: "A", name: "出口" }),
    );
    expect(tree.items![`${M.panels}#0`]).toMatchObject({ y: 0, height: 64, width: 512 });
    expect(tree.items![`${M.panels}#1`]).toMatchObject({ y: 64, height: 64, width: 512 });
    expect(tree.minTextSize[M.panels]).toBeGreaterThanOrEqual(10);
  });

  it("线路标三种画法：色框有白色内芯，色条比方块窄", () => {
    const panel = { lines: "WS", name: "望山线" };
    const base = withPanels(panel);
    const solid = rects(layout({ ...base, lineMark: "solid" }).content).filter(
      (r) => r.fill === "#334CB2",
    );
    const frame = layout({ ...base, lineMark: "frame" }).content;
    const bar = rects(layout({ ...base, lineMark: "bar" }).content).filter(
      (r) => r.fill === "#334CB2",
    );
    expect(solid[0]!.width).toBe(solid[0]!.height);
    expect(rects(frame).some((r) => r.fill === "#FFFFFF")).toBe(true);
    expect(bar[0]!.width).toBeLessThan(solid[0]!.width / 3);
  });

  it("出口编号在黄面板上反色", () => {
    const tree = layout(withPanels({ tone: "exit", exits: "A", name: "出口" }));
    expect(rects(tree.content).some((r) => r.fill === "#191919" && r.width === r.height)).toBe(
      true,
    );
  });

  it("找不到的线路代号和放不下的内容都给出提示", () => {
    const unknown = layout(withPanels({ lines: "ZZ", name: "某线" }));
    expect(unknown.warnings?.[M.panels]?.[0]).toContain("ZZ");
    const crowded = layout(
      withPanels(
        {
          arrow: "left",
          lines: "WS HT",
          name: "望山线鹤汀线换乘通道",
          secondary: "Wangshan & Heting Lines",
        },
        { tone: "exit", arrow: "right", exits: "A B C D", name: "出口方向", secondary: "Exits" },
      ),
      384,
      128,
    );
    expect(crowded.warnings?.[M.panels]?.some((w) => w.includes("放不下"))).toBe(true);
  });

  it("入口牌：站名面板放 Logo、站名和全部线路标", () => {
    const content = ftaGuideStyle.applyAction(ftaGuideDefaults(), "template:entrance");
    const tree = layout(content);
    const marks = rects(tree.content).filter((r) => content.lines.some((l) => l.color === r.fill));
    expect(marks).toHaveLength(content.lines.length);
    expect(tree.warnings?.[M.panels]).toBeUndefined();
  });
});

describe("FTA 导视牌：对齐与底色", () => {
  /** 面板里文字和方块的范围（不含底色），用来看内容被放到了哪里。 */
  function contentBox(tree: RenderTree) {
    const xs: number[] = [];
    const ys: number[] = [];
    for (const r of rects(tree.content)) {
      xs.push(r.x, r.x + r.width);
      ys.push(r.y, r.y + r.height);
    }
    return {
      left: Math.min(...xs),
      right: Math.max(...xs),
      top: Math.min(...ys),
      bottom: Math.max(...ys),
    };
  }

  it("水平对齐：靠左贴左边、靠右贴右边、居中在正中", () => {
    const at = (align: "start" | "center" | "end") =>
      contentBox(layout(withPanels({ exits: "A", name: "出口", align }), 384, 128));
    const pad = Math.round(128 * 0.11);
    expect(at("start").left).toBe(pad);
    const end = layout(withPanels({ exits: "A", name: "出口", align: "end" }), 384, 128);
    const texts: number[] = [];
    walk(end.content, (node) => {
      if (node.kind === "path" && node.d)
        texts.push(...[...node.d.matchAll(/[ML]([\d.]+)/g)].map((m) => Number(m[1])));
    });
    expect(Math.max(...texts)).toBeGreaterThan(384 - pad - 3);
    expect(Math.max(...texts)).toBeLessThanOrEqual(384 - pad + 1);
    const center = at("center");
    expect(center.left).toBeGreaterThan(at("start").left);
    expect(center.left).toBeLessThan(at("end").left);
  });

  it("竖直对齐：靠上、靠下离边一个内边距", () => {
    const pad = Math.round(128 * 0.11);
    const top = contentBox(layout(withPanels({ exits: "A", name: "出口", valign: "top" })));
    const bottom = contentBox(layout(withPanels({ exits: "A", name: "出口", valign: "bottom" })));
    expect(top.top).toBe(pad);
    expect(bottom.bottom).toBeLessThanOrEqual(128 - pad);
    expect(bottom.top).toBeGreaterThan(top.top);
  });

  it("面板底色可以选固定色或自定义，主色也能自定义", () => {
    const tree = layout(
      {
        ...withPanels(
          { name: "甲", tone: "white" },
          { name: "乙", tone: "custom", color: "#7F3FB2" },
          { name: "丙" },
        ),
        background: "custom",
        backgroundColor: "#4C7F99",
      },
      640,
      128,
    );
    const fills = rects(tree.background).map((r) => r.fill);
    expect(fills).toContain("#FFFFFF");
    expect(fills).toContain("#7F3FB2");
    expect(fills).toContain("#4C7F99");
    expect(
      normalizeFtaGuide({ panels: [{ tone: "custom", color: "nope" }] }).panels[0]!.color,
    ).toBe("#4C4C4C");
  });

  it("出口编号放在接近出口黄的自定义底色上也会反色", () => {
    const tree = layout(withPanels({ tone: "custom", color: "#E5E533", exits: "A", name: "出口" }));
    expect(rects(tree.content).some((r) => r.fill === "#191919" && r.width === r.height)).toBe(
      true,
    );
  });
});

describe("FTA 导视牌：编号居中、对调和分隔线", () => {
  function glyphPaths(tree: RenderTree, fill: string) {
    const out: string[] = [];
    walk(tree.content, (node) => {
      if (node.kind === "path" && node.fill === fill && node.d) out.push(node.d);
    });
    return out;
  }

  it("方块里的“1”按字形重心居中，不按墨迹框", () => {
    const tree = layout(withPanels({ exits: "1", name: "海西路", secondary: "Haixi Road" }));
    const box = rects(tree.content).find((r) => r.fill === FTA_GUIDE_EXIT)!;
    const digit = glyphPaths(tree, "#191919")[0]!;
    expect(centroidX(digit)).toBeCloseTo(box.x + box.width / 2, 0);
    // 墨迹框因此偏左：旗子伸出去，竖笔落在正中。
    const xs = [...digit.matchAll(/(-?[\d.]+)[ ,](-?[\d.]+)/g)].map((m) => Number(m[1]));
    expect((Math.min(...xs) + Math.max(...xs)) / 2).toBeLessThan(box.x + box.width / 2);
  });

  it("对调后文字在前、出口编号在后", () => {
    const badgeX = (flip: boolean) =>
      rects(layout(withPanels({ exits: "A", name: "出口", flip })).content).find(
        (r) => r.fill === FTA_GUIDE_EXIT,
      )!.x;
    expect(badgeX(true)).toBeGreaterThan(badgeX(false) + 40);
  });

  it("关掉分隔线后面板直接相接，两行之间也没有横线", () => {
    const content = {
      ...withPanels({ name: "甲" }, { name: "乙" }, { row: "2", name: "丙" }),
      dividers: false,
    };
    const tree = layout(content);
    const a = tree.items![`${M.panels}#0`]!;
    expect(tree.items![`${M.panels}#1`]!.x).toBe(a.x + a.width);
    expect(rects(tree.background).some((r) => r.fill === "#707070")).toBe(false);
  });
});

describe("FTA 导视牌：站名面板和色条线路标", () => {
  /** 第一块面板里内容伸到的最右边（文字路径和方块）。 */
  function contentRight(tree: RenderTree) {
    const limit = tree.items![`${M.panels}#0`]!.width;
    const xs: number[] = [];
    walk(tree.content, (node) => {
      if (node.kind === "rect") xs.push(node.x + node.width);
      if (node.kind === "path" && node.d && !node.stroke) {
        for (const m of node.d.matchAll(/(-?[\d.]+)[ ,](-?[\d.]+)/g)) xs.push(Number(m[1]));
      }
    });
    return Math.max(...xs.filter((x) => x <= limit));
  }

  it("站名面板默认跟着车站走，填了站名覆盖只改这一块", () => {
    const content = { ...ftaGuideDefaults(), station: { name: "海西路", secondary: "Haixi Road" } };
    const entrance = ftaGuideStyle.applyAction(content, "template:entrance");
    expect(entrance.panels[0]).toMatchObject({
      kind: "station",
      stationName: "",
      stationSecondary: "",
    });
    const renamed = {
      ...entrance,
      panels: [{ ...entrance.panels[0]!, stationName: "海西路北" }, entrance.panels[1]!],
    };
    expect(contentRight(layout(renamed))).toBeGreaterThan(contentRight(layout(entrance)));
  });

  it("色条线路标后面跟着线路名", () => {
    // 站名取短的，让线路那一排决定宽度。
    const short = { ...ftaGuideDefaults(), station: { name: "甲", secondary: "" } };
    const base = ftaGuideStyle.applyAction(short, "template:entrance");
    const solid = layout({ ...base, lineMark: "solid" });
    const bar = layout({ ...base, lineMark: "bar" });
    // 色条只有几像素宽，加上“望山线”“鹤汀线”后整排比两个方块还宽。
    expect(contentRight(bar)).toBeGreaterThan(contentRight(solid));
  });
});

describe("FTA 导视牌：检查后的修复", () => {
  it("微调“面板”时底色和内容一起移动，隐藏时一起隐藏", () => {
    const content = ftaGuideDefaults();
    const moved = ftaGuideStyle.layout({
      content,
      size: { width: 512, height: 128 },
      shaper,
      tweaks: { panels: { dx: 20, dy: 0, scale: 1, hidden: false } },
    });
    const groups: string[] = [];
    walk(moved.background, (node) => {
      if (node.kind === "group" && node.transform) groups.push(node.transform);
    });
    expect(groups.some((t) => t.includes("translate(276"))).toBe(true);
    const hidden = ftaGuideStyle.layout({
      content,
      size: { width: 512, height: 128 },
      shaper,
      tweaks: { panels: { dx: 0, dy: 0, scale: 1, hidden: true } },
    });
    expect(rects(hidden.background).some((r) => r.fill === FTA_GUIDE_EXIT)).toBe(false);
  });

  it("方向牌模板用线路列表里的第一条线，不写死 WS", () => {
    const content = {
      ...ftaGuideDefaults(),
      lines: [{ code: "AB", name: "安北线", secondary: "Anbei Line", color: "#7F3FB2" }],
    };
    const direction = ftaGuideStyle.applyAction(content, "template:direction");
    expect(direction.panels[0]).toMatchObject({ lines: "AB", name: "安北线" });
    expect(layout(direction).warnings?.[M.panels]).toBeUndefined();
  });

  it("导入时缺 lines 用默认线路，缺面板时按现有线路套方向牌", () => {
    const missing = normalizeFtaGuide({});
    expect(missing.lines.map((l) => l.code)).toEqual(["WS", "HT"]);
    const emptied = normalizeFtaGuide({ lines: [] });
    expect(emptied.lines).toEqual([]);
    expect(emptied.panels[0]!.lines).toBe("");
    expect(layout(emptied).warnings?.[M.panels]).toBeUndefined();
  });

  it("牌面上的“添加面板”选中新加的那一块", () => {
    const tree = layout(ftaGuideDefaults());
    expect(tree.affordances?.[0]?.select).toBe(`${M.panels}#2`);
    const added = ftaGuideStyle.applyAction(ftaGuideDefaults(), "add-panel");
    expect(added.panels.at(-1)).toMatchObject({ name: "", row: "1", kind: "dest" });
  });

  it("白底上的出口编号仍是黄底，只在黄色底上反色", () => {
    const white = layout(withPanels({ tone: "white", exits: "A", name: "出口" }));
    expect(rects(white.content).some((r) => r.fill === FTA_GUIDE_EXIT)).toBe(true);
    expect(rects(white.content).some((r) => r.fill === "#191919" && r.width === r.height)).toBe(
      true,
    ); // 描边
    const yellow = layout(withPanels({ tone: "exit", exits: "A", name: "出口" }));
    expect(rects(yellow.content).some((r) => r.fill === FTA_GUIDE_EXIT)).toBe(false);
  });

  it("设施图标的字形是挖空，露出背景层", () => {
    const tree = layout(
      withPanels({
        icons: { toilet: true, accessible: true, ticket: true } as never,
        name: "卫生间",
      }),
    );
    let holes = 0;
    walk(tree.content, (node) => {
      if (node.kind === "group" && node.holes) {
        holes += 1;
        walk(node.holes, (hole) => {
          if (hole.kind === "path") expect(hole.stroke).toBeUndefined();
        });
      }
    });
    expect(holes).toBe(3);
  });

  it("色条换乘行里没填线路名的线写线路代号", () => {
    const content = {
      ...withPanels({ lines: "WS" }),
      lines: [{ code: "WS", name: "", secondary: "", color: "#334CB2" }],
      lineMark: "bar" as const,
    };
    let texts = 0;
    walk(layout(content).content, (node) => {
      if (node.kind === "path" && node.d) texts += 1;
    });
    expect(texts).toBeGreaterThan(0);
  });

  it("站名面板的站名和线路标是“车站与线路”模块，可以单独选中", () => {
    const tree = layout(ftaGuideStyle.applyAction(ftaGuideDefaults(), "template:entrance"));
    expect(tree.modules[M.station]).toBeDefined();
    expect(tree.minTextSize[M.station]).toBeGreaterThan(0);
    expect(layout(ftaGuideDefaults()).modules[M.station]).toBeUndefined();
  });

  it("两行之间的分隔线颜色跟着主色走", () => {
    const tree = layout({
      ...withPanels({ name: "甲" }, { row: "2", name: "乙" }),
      background: "white",
    });
    expect(rects(tree.background).find((r) => r.width === 512 && r.height === 2)?.fill).toBe(
      "#A7A7A7",
    );
  });
});
