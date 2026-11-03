import { readFileSync } from "node:fs";
import { parse } from "opentype.js";
import { describe, expect, it } from "vitest";
import { OpentypeShaper } from "@/fonts/shaper";
import type { FontId } from "@/fonts/stacks";
import { getSignStyle } from "../../registry";
import type { RenderNode, RenderTree } from "../../render";
import { FTA_LINE_PRESETS } from "../assets";
import { INK_DARK } from "../kit";
import { ftaPlatformStyle } from ".";
import {
  ftaPlatformDefaults,
  newFtaPlatformLine,
  normalizeFtaPlatform,
  type FtaPlatformContent,
  type FtaPlatformLine,
} from "./content";
import { ADD_LINE_ACTION, FTA_PLATFORM_MODULES as M, resolvePlatformLayout } from "./layout";

function load(path: string) {
  const bytes = readFileSync(path);
  return parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), {
    lowMemory: true,
  });
}

// 真字体：站名按字形墨迹定位，用假字体测不出居中和贴边。
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

function layout(content: FtaPlatformContent, width = 384, height = 128): RenderTree {
  return ftaPlatformStyle.layout({ content, size: { width, height }, shaper, tweaks: {} });
}

const THREE_LINES: FtaPlatformLine[] = [
  { code: "WS", number: "07", name: "望山线", color: "#334CB2" },
  { code: "HT", number: "12", name: "鹤汀线", color: "#D87F33" },
  { code: "AE", number: "03", name: "机场快线", color: "#7FCC19" },
];

function transfer(patch: Partial<FtaPlatformContent> = {}): FtaPlatformContent {
  return {
    ...ftaPlatformDefaults(),
    station: { name: "中央公园", secondary: "Central Park" },
    lines: structuredClone(THREE_LINES),
    ...patch,
  };
}

function walk(nodes: readonly RenderNode[], visit: (node: RenderNode) => void) {
  for (const node of nodes) {
    visit(node);
    if (node.kind === "group") walk(node.children, visit);
  }
}

function centerX(tree: RenderTree, id: string): number {
  const box = tree.modules[id]!;
  return box.x + box.width / 2;
}

describe("FTA 站台牌：内容", () => {
  it("登记为新样式，和 FTA 车站牌并存，默认 1×3", () => {
    expect(getSignStyle("FTA-platform")).toBe(ftaPlatformStyle);
    expect(getSignStyle("FTA-station").id).toBe("FTA-station");
    expect(ftaPlatformStyle.defaultSize).toEqual({ mode: "grid", grid: { rows: 1, columns: 3 } });
  });

  it("默认中轴、色带打开、白底、全部线路、特粗站名", () => {
    const content = ftaPlatformDefaults();
    expect(content.look).toBe("axis");
    expect(content.band).toBe(true);
    expect(content.background).toBe("white");
    expect(content.showLines).toBe("all");
    expect(content.nameWeight).toBe("800");
  });

  it("底色只认固定的几种，其他值退回白；字重存成数字也能读", () => {
    const content = normalizeFtaPlatform({ background: "#FF00FF", nameWeight: 700, lines: [] });
    expect(content.background).toBe("white");
    expect(content.nameWeight).toBe("700");
    expect(content.lines).toHaveLength(1);
  });

  it("新线路取还没用过的预设色；“添加线路”加在末尾", () => {
    const content = normalizeFtaPlatform({ lines: [{ color: FTA_LINE_PRESETS[0] }] });
    expect(newFtaPlatformLine(content).color).toBe(FTA_LINE_PRESETS[1]);
    const added = ftaPlatformStyle.applyAction(content, ADD_LINE_ACTION);
    expect(added.lines).toHaveLength(2);
  });
});

describe("FTA 站台牌：横版", () => {
  it("版式按宽高比自动选：竖条用竖版，其余用横版", () => {
    expect(resolvePlatformLayout("auto", 384, 128)).toBe("horizontal");
    expect(resolvePlatformLayout("auto", 256, 128)).toBe("horizontal");
    expect(resolvePlatformLayout("auto", 128, 256)).toBe("vertical");
    expect(resolvePlatformLayout("vertical", 384, 128)).toBe("vertical");
  });

  it("中轴：站名和线路行都在牌子正中，线路行在站名下方", () => {
    const tree = layout(transfer());
    expect(Math.abs(centerX(tree, M.stationName) - 192)).toBeLessThanOrEqual(1);
    expect(Math.abs(centerX(tree, M.lines) - 192)).toBeLessThanOrEqual(1);
    expect(tree.modules[M.lines]!.y).toBeGreaterThan(tree.modules[M.stationName]!.y);
  });

  it("极简：站名的字形左边缘贴着页边距，本线在站名上方", () => {
    const tree = layout(transfer({ look: "minimal" }));
    expect(Math.abs(tree.modules[M.stationName]!.x - 16)).toBeLessThanOrEqual(1);
    expect(tree.modules[M.lines]!.y).toBeLessThan(tree.modules[M.stationName]!.y);
  });

  it("色带在底边 8 px，按线路等分；关掉后没有色带", () => {
    expect(layout(transfer()).modules[M.accent]).toEqual({ x: 0, y: 120, width: 384, height: 8 });
    expect(layout(transfer({ band: false })).modules[M.accent]).toBeUndefined();
  });

  it("色框挖空内部，不用底色盖住，开灯光时渐变才连续", () => {
    let holes = 0;
    walk(layout(transfer({ look: "frame" })).content, (node) => {
      if (node.kind === "group" && node.holes) holes += node.holes.length;
    });
    expect(holes).toBe(1);
  });

  it("每条线路能单独点选；只显示第一条时只有本线", () => {
    expect(Object.keys(layout(transfer()).items!).sort()).toEqual([
      "lines#0",
      "lines#1",
      "lines#2",
    ]);
    expect(Object.keys(layout(transfer({ showLines: "first" })).items!)).toEqual(["lines#0"]);
  });

  it("1×3 上站名、站号和线路名都不小于 12 px", () => {
    const tree = layout(transfer());
    expect(tree.minTextSize[M.stationName]).toBeGreaterThanOrEqual(12);
    expect(tree.minTextSize[M.lines]).toBeGreaterThanOrEqual(12);
  });

  it("1×2 放不下线路名时，所有线路一起只留站号块", () => {
    const wide = layout(transfer());
    const narrow = layout(transfer(), 256, 128);
    expect(narrow.modules[M.lines]!.width).toBeLessThan(wide.modules[M.lines]!.width / 2);
  });

  it("站号块和底色太接近时描一圈字色，例如白底上的亮黄", () => {
    const outlines = (color: string) => {
      let count = 0;
      const lines = [{ code: "YL", number: "07", name: "黄岭线", color }];
      walk(layout(transfer({ lines })).content, (node) => {
        if (node.kind === "rect" && node.fill === INK_DARK) count += 1;
      });
      return count;
    };
    expect(outlines("#E5E533")).toBe(1);
    expect(outlines("#334CB2")).toBe(0);
  });

  it("站号块边缘落在整像素上", () => {
    walk(layout(transfer()).content, (node) => {
      if (node.kind === "rect") {
        expect(Number.isInteger(node.x) && Number.isInteger(node.y)).toBe(true);
        expect(Number.isInteger(node.width) && Number.isInteger(node.height)).toBe(true);
      }
    });
  });

  it("站名太长缩到最小字号仍放不下时给出提示", () => {
    const tree = layout(
      transfer({ station: { name: "很长很长很长很长很长很长很长很长的站名", secondary: "" } }),
    );
    expect(tree.warnings?.[M.stationName]).toHaveLength(1);
  });
});

describe("FTA 站台牌：竖版（柱名牌）", () => {
  it("汉字一字一行，英文转 90° 放在右侧，整组水平居中", () => {
    const tree = layout(transfer(), 128, 256);
    let rotated = 0;
    walk(tree.content, (node) => {
      if (node.kind === "group" && node.transform?.endsWith("rotate(90)")) rotated += 1;
    });
    expect(rotated).toBe(1);
    expect(Math.abs(centerX(tree, M.stationName) - 64)).toBeLessThanOrEqual(1);
  });

  it("线路块贴底、在站名下方；多条线时只留站号块并换行", () => {
    const tree = layout(transfer(), 128, 256);
    const lines = tree.modules[M.lines]!;
    expect(lines.y).toBeGreaterThan(
      tree.modules[M.stationName]!.y + tree.modules[M.stationName]!.height,
    );
    expect(lines.width).toBeLessThanOrEqual(128 - 24);
    expect(lines.height).toBeGreaterThan(22);
  });

  it("单条线时站号块后面带线路名", () => {
    const one = layout(transfer({ showLines: "first" }), 128, 256);
    expect(one.modules[M.lines]!.height).toBe(22);
    expect(one.items!["lines#0"]!.width).toBeGreaterThan(50);
  });
});
