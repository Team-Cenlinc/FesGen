import { readFileSync } from "node:fs";
import { parse } from "opentype.js";
import { describe, expect, it } from "vitest";
import { OpentypeShaper } from "@/fonts/shaper";
import type { FontId } from "@/fonts/stacks";
import { importSignJson } from "@/library/io";
import type { RenderNode, RenderTree } from "../../render";
import { FTA_LINE_PRESETS } from "../assets";
import { chipMetrics, FtaCanvas, INK_DARK, INK_LIGHT, inkOn } from "../kit";
import { ftaStationStyle } from ".";
import {
  ftaStationDefaults,
  migrateLegacyFtaStation,
  newFtaLine,
  normalizeFtaStation,
  splitLegacyLineName,
  type FtaStationContent,
} from "./content";
import { ADD_LINE_ACTION, FTA_STATION_MODULES as M, resolveFtaLayout, stationCode } from "./layout";

function load(path: string) {
  const bytes = readFileSync(path);
  return parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), {
    lowMemory: true,
  });
}

// 真字体：小字号和整像素居中要按实际字形算，用假字体测不出来。
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

function layout(content: FtaStationContent, width = 384, height = 128): RenderTree {
  return ftaStationStyle.layout({ content, size: { width, height }, shaper, tweaks: {} });
}

function transfer(): FtaStationContent {
  return {
    ...ftaStationDefaults(),
    lines: [
      { code: "WS", number: "01", name: "浦蓝线", secondary: "Waterside Line", color: "#55CCFF" },
      { code: "Y", number: "07", name: "迎曦线", secondary: "Yingxi Line", color: "#FFCD2A" },
      { code: "N", number: "39", name: "北环线", secondary: "Northern Loop", color: "#22409A" },
    ],
    logo: { operator: "SUR", variant: "auto", position: "bottom" },
  };
}

describe("FTA 车站牌：内容", () => {
  it("默认内容沿用旧版：主城湾、浦蓝线、黑字白底，默认斜切", () => {
    const content = ftaStationDefaults();
    expect(content.station).toEqual({ name: "主城湾", secondary: "Spawn Bay" });
    expect(content.lines).toEqual([
      { code: "WS", number: "01", name: "浦蓝线", secondary: "Waterside Line", color: "#55CCFF" },
    ]);
    expect(content.textColor).toBe("#000000");
    expect(content.background).toBe("#FFFFFF");
    expect(content.slant).toBe(true);
    expect(ftaStationStyle.defaultSize).toEqual({ mode: "grid", grid: { rows: 1, columns: 3 } });
  });

  it("补齐缺失字段，至少保留一条线路", () => {
    const content = normalizeFtaStation({ lines: [], lineNames: "乱写", textColor: "red" });
    expect(content.lines).toHaveLength(1);
    expect(content.lineNames).toBe("auto");
    expect(content.textColor).toBe("#000000");
    expect(normalizeFtaStation(ftaStationDefaults())).toEqual(ftaStationDefaults());
  });

  it("新线路取还没用过的预设色，序号 01，代号和名字留空", () => {
    const content = ftaStationDefaults();
    content.lines.push({ ...newFtaLine(content) });
    expect(content.lines[1]).toEqual({
      code: "",
      number: "01",
      name: "",
      secondary: "",
      color: FTA_LINE_PRESETS[0],
    });
    expect(newFtaLine(content).color).toBe(FTA_LINE_PRESETS[1]);
  });

  it("站号：纯数字的一位序号补成两位，其他写法原样", () => {
    const line = { code: "MT", number: "3", name: "", secondary: "", color: "#000000" };
    expect(stationCode(line)).toBe("MT-03");
    expect(stationCode({ ...line, number: "12" })).toBe("MT-12");
    expect(stationCode({ ...line, number: "A1" })).toBe("MT-A1");
    expect(stationCode({ ...line, code: "" })).toBe("03");
  });

  it("旧版线路名按“·”拆开，含汉字的一半作主名", () => {
    expect(splitLegacyLineName("Waterside Line · 浦蓝线")).toEqual({
      name: "浦蓝线",
      secondary: "Waterside Line",
    });
    expect(splitLegacyLineName("北环线")).toEqual({ name: "北环线", secondary: "" });
    expect(splitLegacyLineName("Y")).toEqual({ name: "Y", secondary: "" });
    expect(splitLegacyLineName("North · Loop")).toEqual({ name: "North", secondary: "Loop" });
  });

  it("旧版文件迁移", () => {
    const legacy = {
      signStyle: "FTA-station",
      lightStyle: "led",
      output: { outputWidth: "384", outputHeight: "128" },
      signInfo: {
        signConfig: { stationNameItalic: true, simplifySign: true },
        layoutInfo: {
          backgroundColor: "#1b2022",
          textColor: "#ffffff",
          stationNameColor: "#ff0000",
        },
        thisStation: { nameMain: "浦蓝港", nameSub: "Purlan Harbour" },
        logoInfo: { enableLogo: true, logoStyle: "FTA-Logo-PUAT-Reversed" },
        lineInfo: [
          {
            name: "Waterside Line · 浦蓝线",
            nameAbbr: "WS",
            color: "#55CCFF",
            stationNumber: "01",
          },
          // 旧版随机颜色可能不足 6 位，序号可能是数字。
          { name: "K", nameAbbr: "K", color: "#abc12", stationNumber: 77 },
        ],
      },
      configVersion: "beta-v0.1.1",
    };
    const { content, size, lighting } = migrateLegacyFtaStation(legacy);
    expect(size).toEqual({ mode: "grid", grid: { rows: 1, columns: 3 } });
    expect(lighting).toBe("led");
    expect(content.station).toEqual({ name: "浦蓝港", secondary: "Purlan Harbour" });
    expect(content.italic).toBe(true);
    expect(content.lineNames).toBe("none");
    expect(content.lineInk).toEqual({ custom: true, color: "#FF0000" });
    expect(content.logo).toEqual({ operator: "PUAT", variant: "reversed", position: "bottom" });
    expect(content.background).toBe("#1B2022");
    expect(content.lines[0]).toEqual({
      code: "WS",
      number: "01",
      name: "浦蓝线",
      secondary: "Waterside Line",
      color: "#55CCFF",
    });
    expect(content.lines[1]!.number).toBe("77");
    expect(content.lines[1]!.color).toBe(FTA_LINE_PRESETS[1]);
  });

  it("旧版默认的白色线路名迁移成自动，没开 Logo 时不显示", () => {
    const { content, size } = migrateLegacyFtaStation({
      output: { outputWidth: 600, outputHeight: 200 },
      signInfo: {
        layoutInfo: { stationNameColor: "#FFFFFF" },
        logoInfo: { enableLogo: false, logoStyle: "FTA-Logo-SUR" },
      },
    });
    expect(size).toEqual({ mode: "free", width: 600, height: 200 });
    expect(content.lineInk.custom).toBe(false);
    expect(content.logo.operator).toBe("");
    expect(content.lines).toHaveLength(1);
  });

  it("导入旧版 FTA 车站牌文件，作品名取本站名", () => {
    const result = importSignJson(
      JSON.stringify({
        configVersion: "beta-v0.1.1",
        signStyle: "FTA-station",
        output: { outputWidth: 600, outputHeight: 200 },
        signInfo: { thisStation: { nameMain: "浦蓝港", nameSub: "Purlan Harbour" } },
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.legacy).toBe(true);
    expect(result.sign.style).toBe("FTA-station");
    expect(result.sign.name).toBe("浦蓝港");
  });

  it("“添加线路”在末尾加一条新线路", () => {
    const content = ftaStationStyle.applyAction(ftaStationDefaults(), ADD_LINE_ACTION);
    expect(content.lines).toHaveLength(2);
    expect(content.lines[1]!.color).toBe(FTA_LINE_PRESETS[0]);
  });
});

describe("FTA 车站牌：颜色", () => {
  it("线路色上的字按吸附到地图色板之后的颜色选深浅", () => {
    // 品红会被吸成浅粉，所以用深字，不按原色选白字。
    expect(inkOn("#E4007F")).toBe(INK_DARK);
    expect(inkOn("#22409A")).toBe(INK_LIGHT);
    expect(inkOn("#55CCFF")).toBe(INK_DARK);
    expect(inkOn("#FFCD2A")).toBe(INK_DARK);
  });
});

describe("FTA 车站牌：排版", () => {
  it("版式按宽高比自动选，也可以手动指定", () => {
    expect(resolveFtaLayout("auto", 384, 128)).toBe("station");
    expect(resolveFtaLayout("auto", 512, 128)).toBe("station");
    expect(resolveFtaLayout("auto", 256, 128)).toBe("pillar");
    expect(resolveFtaLayout("auto", 128, 128)).toBe("pillar");
    expect(resolveFtaLayout("auto", 128, 256)).toBe("pillar");
    expect(resolveFtaLayout("station", 128, 128)).toBe("station");
  });

  it("1×3 上中文不小于 12 px、西文不小于 10 px", () => {
    for (const content of [ftaStationDefaults(), transfer()]) {
      const tree = layout(content);
      expect(tree.minTextSize[M.belt]).toBeGreaterThanOrEqual(10);
      expect(tree.minTextSize[M.stationName]).toBeGreaterThanOrEqual(12);
      expect(Object.values(tree.minTextSize).every((size) => size >= 10)).toBe(true);
    }
  });

  it("站名撑满色带上方：600 × 200 时字号约 91", () => {
    const tree = layout(ftaStationDefaults(), 600, 200);
    const box = tree.modules[M.stationName]!;
    expect(box.y).toBeLessThan(20);
    expect(box.y + box.height).toBeLessThan(154);
    expect(box.height).toBeGreaterThan(110);
  });

  it("第二语言贴着色带：基线离色带 12，等于中文和第二语言之间的间距", () => {
    const tree = layout({ ...transfer(), lines: transfer().lines.slice(0, 1) }, 600, 200);
    const name = tree.modules[M.stationName]!;
    // 选中框下沿 = 第二语言基线 + 0.14 × 字号（26）。
    const baseline = name.y + name.height - 0.14 * 26;
    expect(200 - 46 - baseline).toBeCloseTo(12, 0);
    // Logo 说明文字和第二语言同一基线，选中框下沿对齐。
    const logo = tree.modules[M.logo]!;
    expect(Math.abs(logo.y + logo.height - (name.y + name.height))).toBeLessThan(2);
  });

  it("站号块上下留白相等，边缘落在整像素上", () => {
    for (const [width, height] of [
      [384, 128],
      [600, 200],
      [512, 128],
    ] as const) {
      const s = Math.min(height / 200, width / 400);
      const canvas = new FtaCanvas(shaper, {}, s, width, height);
      const bandTop = canvas.designHeight - 46;
      const metrics = chipMetrics(canvas, bandTop, canvas.designHeight);
      const topPx = metrics.top * s;
      const bottomPx = (metrics.top + metrics.height) * s;
      expect(topPx).toBeCloseTo(Math.round(topPx), 6);
      expect(bottomPx).toBeCloseTo(Math.round(bottomPx), 6);
      expect(Math.round(topPx) - Math.round(bandTop * s)).toBe(height - Math.round(bottomPx));
      expect(metrics.capPx).toBeGreaterThanOrEqual(8);
    }
  });

  it("列表项和“+”：每段色带能单独点选，“+”加完选中新线路", () => {
    const tree = layout(transfer());
    expect(Object.keys(tree.items ?? {})).toEqual([`${M.belt}#0`, `${M.belt}#1`, `${M.belt}#2`]);
    expect(tree.affordances).toEqual([
      expect.objectContaining({ action: ADD_LINE_ACTION, select: `${M.belt}#3` }),
    ]);
  });

  it("线路太多、色带太窄时给出提示", () => {
    const content = transfer();
    content.lines = Array.from({ length: 8 }, (_unused, i) => ({
      ...content.lines[0]!,
      code: `L${i}`,
      number: "10",
    }));
    expect(layout(content).warnings?.[M.belt]?.length ?? 0).toBeGreaterThan(0);
    expect(layout(transfer()).warnings?.[M.belt]).toBeUndefined();
  });

  it("所有线路一起降级：有一条放不下第二语言，就都不写第二语言", () => {
    /** 色带模块里画出来的文字段数（站号 + 主名 + 第二语言）。 */
    const beltTexts = (tree: RenderTree) => {
      const root = tree.content[0];
      const belt = root?.kind === "group" ? root.children[0] : undefined;
      const count = (node: RenderNode | undefined): number =>
        !node
          ? 0
          : node.kind === "group"
            ? node.children.reduce((sum, child) => sum + count(child), 0)
            : node.kind === "path" && node.d
              ? 1
              : 0;
      return count(belt);
    };
    const content = transfer();
    content.lines = content.lines.slice(0, 2);
    // 600 × 200、两条线：每段都放得下“主名 + 第二语言”。
    expect(beltTexts(layout(content, 600, 200))).toBe(6);
    content.lines[1]!.secondary = "Yingxi Line Express Service";
    expect(beltTexts(layout(content, 600, 200))).toBe(4);
  });

  it("有 Logo 时放在右下，说明文字和第二语言同一基线", () => {
    const tree = layout(transfer(), 600, 200);
    const logo = tree.modules[M.logo]!;
    const name = tree.modules[M.stationName]!;
    // 选中框按字宽算，比按字形右对齐的说明文字多出右侧留白，约 1 px。
    expect(logo.x + logo.width).toBeLessThanOrEqual(600 - 24 + 2);
    expect(Math.abs(logo.y + logo.height - (name.y + name.height))).toBeLessThan(2);
  });

  it("柱名牌：1×1 不放 Logo，竖两格中文竖排", () => {
    const square = layout(transfer(), 128, 128);
    expect(square.modules[M.logo]).toBeUndefined();
    expect(Object.keys(square.items ?? {})).toHaveLength(3);
    const tall = layout(transfer(), 128, 256);
    const name = tall.modules[M.stationName]!;
    expect(name.height).toBeGreaterThan(name.width);
    expect(tall.minTextSize[M.stationName]).toBeGreaterThanOrEqual(10);
  });
});
