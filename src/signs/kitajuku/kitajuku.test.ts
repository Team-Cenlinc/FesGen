import { readFileSync } from "node:fs";
import { parse } from "opentype.js";
import { describe, expect, it } from "vitest";
import type { FontId, FontStack } from "@/fonts/stacks";
import { OpentypeShaper, type TextAnchor, type TextShaper } from "@/fonts/shaper";
import { renderTreeToSvg, type RenderNode, type RenderTree } from "../render";
import { kitajukuStyle } from ".";
import {
  LEFT_STOP_MARK,
  LEFT_STOP_MARK_CENTER_X,
  MIDDLE_STOP_MARK,
  MIDDLE_STOP_MARK_CENTER_X,
  RIGHT_STOP_MARK,
  RIGHT_STOP_MARK_CENTER_X,
} from "./assets";
import {
  kitajukuDefaults,
  migrateLegacyKitajuku,
  normalizeKitajuku,
  swapNeighbors,
} from "./content";
import { KITAJUKU_MODULES as M } from "./layout";

/** 等宽假字体：每个字宽 = 字号 × 0.5；路径记下落笔点，方便检查坐标。“锦”算缺字。 */
const fakeShaper: TextShaper = {
  measure: (_stack: FontStack, text: string, size: number) => [...text].length * size * 0.5,
  shape(
    stack: FontStack,
    text: string,
    size: number,
    x: number,
    y: number,
    anchor: TextAnchor = "start",
  ) {
    const width = this.measure(stack, text, size);
    const startX = anchor === "start" ? x : anchor === "middle" ? x - width / 2 : x - width;
    return {
      d: text ? `M${startX} ${y}` : "",
      width,
      x: startX,
      y,
      missing: [...text].filter((char) => char === "锦"),
    };
  },
};

function layout(
  content = kitajukuDefaults(),
  size = { width: 600, height: 200 },
  tweaks = {},
): RenderTree {
  return kitajukuStyle.layout({ content, size, shaper: fakeShaper, tweaks });
}

/** 收集所有假字体落笔点（展平后的 path d），按出现顺序。 */
function textOrigins(tree: RenderTree): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  const walk = (node: RenderNode) => {
    if (node.kind === "group") node.children.forEach(walk);
    else if (node.kind === "path" && /^M-?[\d.]+ -?[\d.]+$/.test(node.d)) {
      const [x, y] = node.d.slice(1).split(" ").map(Number);
      out.push({ x: x!, y: y! });
    }
  };
  tree.content.forEach(walk);
  return out;
}

/** 色带上三个挖空缺口的平移量（左、中、右）。 */
function holeOrigins(tree: RenderTree): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  const walk = (node: RenderNode) => {
    if (node.kind !== "group") return;
    for (const hole of node.holes ?? []) {
      const match =
        hole.kind === "group" && /translate\(([-\d.]+) ([-\d.]+)\)/.exec(hole.transform ?? "");
      if (match) out.push({ x: Number(match[1]), y: Number(match[2]) });
    }
    node.children.forEach(walk);
  };
  tree.content.forEach(walk);
  return out;
}

function findLines(tree: RenderTree): Extract<RenderNode, { kind: "line" }>[] {
  const out: Extract<RenderNode, { kind: "line" }>[] = [];
  const walk = (node: RenderNode) => {
    if (node.kind === "group") node.children.forEach(walk);
    else if (node.kind === "line") out.push(node);
  };
  tree.content.forEach(walk);
  return out;
}

describe("北宿电铁：内容", () => {
  it("空数据补齐为默认值", () => {
    expect(normalizeKitajuku(undefined)).toEqual(kitajukuDefaults());
  });

  it("纠正类型：字符串数字、非法颜色、小写颜色", () => {
    const content = normalizeKitajuku({
      frameThickness: "6",
      background: "red",
      station: { textColor: "#abcdef", number: 7 },
    });
    expect(content.frameThickness).toBe(6);
    expect(content.background).toBe("#ECECEC");
    expect(content.station.textColor).toBe("#ABCDEF");
    expect(content.station.number).toBe("7");
  });

  it("左右邻站互换", () => {
    const swapped = swapNeighbors(kitajukuDefaults());
    expect(swapped.left.chinese).toBe("北宿");
    expect(swapped.right.chinese).toBe("錦岡");
    expect(swapped.left.textColor).toBe("#7A7A7A");
  });

  it("旧版 beta-v0.1.1 JSON 迁移", () => {
    const legacy = {
      configVersion: "beta-v0.1.1",
      signStyle: "kitajuku-dentetsu",
      lightStyle: "led",
      output: { outputWidth: "384", outputHeight: 128 },
      signInfo: {
        main: {
          staNameChinese: "主城湾",
          staNameKana: "",
          staNameEnglish: "Spawn Bay",
          mainTextColor: "#383838",
        },
        left: {
          leftStaNumber: "04",
          leftStaNameEnglish: "A",
          leftStaNameChinese: "甲",
          leftTextColor: "#111111",
        },
        middle: { lineName: "線", lineAbbr: "X", middleStaNumber: "09" },
        right: {
          rightStaNumber: "02",
          rightStaNameEnglish: "B",
          rightStaNameChinese: "乙",
          rightTextColor: "#222222",
        },
        secondLine: { enable: true, color: "#A0D4E7" },
        lineColor: "#7297DD",
        backgroundColor: "#ECECEC",
        frameThickness: "4",
        displayForwardArrow: false,
        chnCharacterBold: true,
        direction: "right",
      },
    };
    const migrated = migrateLegacyKitajuku(legacy);
    expect(migrated.size).toEqual({ mode: "grid", grid: { rows: 1, columns: 3 } });
    expect(migrated.lighting).toBe("led");
    expect(migrated.content.station.chinese).toBe("主城湾");
    expect(migrated.content.station.number).toBe("09");
    expect(migrated.content.line.second.enabled).toBe(true);
    expect(migrated.content.emphasizeKanji).toBe(true);
    expect(migrated.content.arrow).toEqual({ visible: false, direction: "right" });
    expect(migrated.content.left.textColor).toBe("#111111");
  });

  it("旧版默认的 600×200 保留为自由像素", () => {
    expect(migrateLegacyKitajuku({ output: { outputWidth: 600, outputHeight: 200 } }).size).toEqual(
      {
        mode: "free",
        width: 600,
        height: 200,
      },
    );
  });

  it("汉字强调才需要粗体字体", () => {
    expect(kitajukuStyle.fonts(kitajukuDefaults())).not.toContain("noto-sans-jp-700");
    expect(kitajukuStyle.fonts({ ...kitajukuDefaults(), emphasizeKanji: true })).toContain(
      "noto-sans-jp-700",
    );
  });
});

describe("北宿电铁：排版（600×200 与旧版一致）", () => {
  it("本站中文名右对齐到 x=305，假名和英文从 x=320 起", () => {
    const [chinese, kana, english] = textOrigins(layout());
    // 默认“海浜宿海”4 字 × 30 = 120 宽
    expect(chinese).toEqual({ x: 305 - 120, y: 75 });
    expect(kana).toEqual({ x: 320, y: 45 });
    expect(english).toEqual({ x: 320, y: 80 });
  });

  it("线路标整体在牌面中轴 300 上居中", () => {
    const origins = textOrigins(layout());
    // 缩写方块 7.5 + 10，间隔 5，线路名 5 字 × 10.5 = 52.5，共 75 宽，从 300 - 37.5 起
    // 缩写在方块里水平、竖直都居中：中心 (271.25, 110)，基线在中心下方 15 × 0.36
    expect(origins[3]!.x).toBeCloseTo(262.5 + 5, 6);
    expect(origins[3]!.y).toBeCloseTo(110 + 15 * 0.36, 6);
    expect(origins[4]).toEqual({ x: 262.5 + 17.5 + 5, y: 118 });
  });

  it("线路标、本站编号牌和本站缺口共用中轴，换尺寸时一起移动", () => {
    for (const [size, axis] of [
      [{ width: 600, height: 200 }, 300],
      [{ width: 800, height: 200 }, 400],
    ] as const) {
      const tree = layout(undefined, size);
      const badge = tree.modules[M.stationNumber]!;
      expect(badge.x + badge.width / 2).toBeCloseTo(axis, 2);
      const line = tree.modules[M.lineMark]!;
      expect(line.x + line.width / 2).toBeCloseTo(axis, 2);
      expect(holeOrigins(tree)[1]!.x + MIDDLE_STOP_MARK_CENTER_X).toBeCloseTo(axis, 2);
    }
  });

  it("邻站缺口对准整组站名和编号牌的中心", () => {
    const content = kitajukuDefaults();
    content.right.chinese = "北宿中央公園";
    const tree = layout(content);
    const [left, , right] = holeOrigins(tree);
    const leftBox = tree.modules[M.leftStation]!;
    const rightBox = tree.modules[M.rightStation]!;
    expect(left!.x + LEFT_STOP_MARK_CENTER_X).toBeCloseTo(leftBox.x + leftBox.width / 2, 2);
    expect(right!.x + RIGHT_STOP_MARK_CENTER_X).toBeCloseTo(rightBox.x + rightBox.width / 2, 2);
  });

  it("编号在编号牌里居中，放不下时等比缩小", () => {
    const content = kitajukuDefaults();
    content.station.number = "12345";
    content.left.number = "1234";
    const tree = layout(content);
    // 假字体每字 0.5 字号宽：本站 5 字 × 9.85 = 49.3 > 26，邻站 4 字 × 7.5 = 30 > 20
    expect(tree.minTextSize[M.stationNumber]).toBeCloseTo((19.7074944 * 26) / (5 * 9.8537472), 4);
    expect(tree.minTextSize[M.leftStation]).toBeCloseTo(10, 4);
    const number = textOrigins(tree)[5]!;
    const size = tree.minTextSize[M.stationNumber]!;
    const badgeX = 300 - 21.51;
    // 居中对齐：落笔点 + 半个字宽（5 字 × 0.5 字号 ÷ 2）= 编号牌白底的中心
    expect(number.x + (5 * size * 0.5) / 2).toBeCloseTo(badgeX + 24.85, 4);
  });

  it("左站中文名从 x=29 起，编号牌跟在名字后面", () => {
    const tree = layout();
    const origins = textOrigins(tree);
    const left = origins.slice(6, 9);
    expect(left[0]).toEqual({ x: 29, y: 145 });
    // 錦岡 2 字 × 12.5 = 25，编号牌在 29 + 25 + 10；编号居中于牌内白底（19.11, 11.27）
    expect(left[1]!.x).toBeCloseTo(29 + 35 + 19.11 - 7.5, 6);
    expect(left[1]!.y).toBeCloseTo(125 + 11.27 + 15 * 0.36, 6);
    expect(left[2]).toEqual({ x: 29, y: 165 });
  });

  it("右站文字右对齐到 x=556", () => {
    const origins = textOrigins(layout());
    const right = origins.slice(9, 12);
    expect(right[0]).toEqual({ x: 556 - 25, y: 145 });
    expect(right[2]).toEqual({ x: 556 - 8 * 9, y: 165 });
  });

  it("单色带宽 15，双色带各 7.5 上下排列", () => {
    expect(findLines(layout()).map((line) => [line.y1, line.strokeWidth])).toEqual([[180, 15]]);
    const content = kitajukuDefaults();
    content.line.second.enabled = true;
    expect(
      findLines(layout(content)).map((line) => [line.y1, line.strokeWidth, line.stroke]),
    ).toEqual([
      [176.75, 7.5, "#7297DD"],
      [183.25, 7.5, "#A0D4E7"],
    ]);
  });

  it("站点标记从色带上挖空，开灯光时露出背景和渐变，不用底色盖", () => {
    const tree = layout();
    const holes: RenderNode[] = [];
    const drawnPaths: string[] = [];
    const walk = (node: RenderNode) => {
      if (node.kind === "group") {
        holes.push(...(node.holes ?? []));
        node.children.forEach(walk);
      } else if (node.kind === "path") {
        drawnPaths.push(node.d);
      }
    };
    tree.content.forEach(walk);
    expect(holes).toHaveLength(3);
    for (const mark of [LEFT_STOP_MARK, MIDDLE_STOP_MARK, RIGHT_STOP_MARK]) {
      expect(drawnPaths).not.toContain(mark);
    }

    const svg = renderTreeToSvg(tree, { lighting: "fluore", layers: "content" });
    expect(svg).toContain('<mask id="fesgen-holes-0" maskUnits="userSpaceOnUse"');
    expect(svg).toContain('<g mask="url(#fesgen-holes-0)"><line');
    // 蒙版里的挖空形状一律画成黑色。
    expect(svg.match(/<mask[\s\S]*?<\/mask>/)![0]).not.toContain('fill="none"');
  });

  it("隐藏色带时连同缺口一起去掉", () => {
    const svg = renderTreeToSvg(
      layout(undefined, undefined, { [M.belt]: { dx: 0, dy: 0, scale: 1, hidden: true } }),
      {
        lighting: "none",
      },
    );
    expect(svg).not.toContain("<mask");
  });

  it("色带从边框内沿画起", () => {
    const [belt] = findLines(layout());
    expect(belt).toMatchObject({ x1: 2, x2: 598 });
  });

  it("箭头朝右时旋转 180° 移到右侧", () => {
    const content = kitajukuDefaults();
    content.arrow.direction = "right";
    const tree = layout(content);
    expect(tree.modules[M.arrow]!.x).toBeCloseTo(538.08, 1);
    content.arrow.visible = false;
    expect(layout(content).modules[M.arrow]).toBeUndefined();
  });

  it("中文名过长时等比缩小，不顶出边框", () => {
    const content = kitajukuDefaults();
    content.station.chinese = "一二三四五六七八";
    const [chinese] = textOrigins(layout(content));
    expect(chinese!.x).toBeGreaterThanOrEqual(content.frameThickness);
  });
});

describe("北宿电铁：尺寸与微调", () => {
  it("1×3 地图格（384×128）是 600×200 的等比缩小", () => {
    const tree = layout(kitajukuDefaults(), { width: 384, height: 128 });
    expect(tree.width).toBe(384);
    expect(tree.content[0]).toMatchObject({ kind: "group", transform: "scale(0.64)" });
    const reference = layout().modules[M.leftStation]!;
    expect(tree.modules[M.leftStation]!.x).toBeCloseTo(reference.x * 0.64, 6);
    expect(tree.minTextSize[M.leftStation]).toBeCloseTo(15 * 0.64, 6);
  });

  it("更宽的尺寸把多出的宽度分到两侧：右站随右边缘移动，本站名居中", () => {
    const wide = layout(kitajukuDefaults(), { width: 800, height: 200 });
    const base = layout();
    expect(wide.modules[M.rightStation]!.x - base.modules[M.rightStation]!.x).toBeCloseTo(200, 6);
    expect(wide.modules[M.stationName]!.x - base.modules[M.stationName]!.x).toBeCloseTo(100, 6);
    expect(wide.modules[M.leftStation]!.x).toBeCloseTo(base.modules[M.leftStation]!.x, 6);
  });

  it("微调：隐藏去掉模块，偏移平移选中框，缩放影响最小字号", () => {
    const tweaks = {
      [M.arrow]: { dx: 0, dy: 0, scale: 1, hidden: true },
      [M.leftStation]: { dx: 10, dy: -5, scale: 1, hidden: false },
      [M.stationNumber]: { dx: 0, dy: 0, scale: 0.5, hidden: false },
    };
    const base = layout();
    const tweaked = layout(kitajukuDefaults(), { width: 600, height: 200 }, tweaks);
    expect(tweaked.modules[M.arrow]).toBeUndefined();
    expect(tweaked.modules[M.leftStation]!.x).toBeCloseTo(base.modules[M.leftStation]!.x + 10, 6);
    expect(tweaked.modules[M.leftStation]!.y).toBeCloseTo(base.modules[M.leftStation]!.y - 5, 6);
    expect(tweaked.minTextSize[M.stationNumber]).toBeCloseTo(19.7074944 * 0.5, 6);
  });

  it("缺字按模块汇报", () => {
    const content = kitajukuDefaults();
    content.left.chinese = "锦冈";
    expect(layout(content).missingGlyphs[M.leftStation]).toEqual(["锦"]);
    expect(layout().missingGlyphs[M.leftStation]).toBeUndefined();
  });

  it("缺字也按主字体汇总，汉字强调时记在粗体名下；隐藏的模块不汇报", () => {
    const content = kitajukuDefaults();
    content.left.chinese = "锦冈";
    expect(layout(content).missingByPrimary).toEqual({ "noto-sans-jp-400": ["锦"] });
    content.emphasizeKanji = true;
    expect(layout(content).missingByPrimary).toEqual({ "noto-sans-jp-700": ["锦"] });
    const hidden = layout(
      content,
      { width: 600, height: 200 },
      {
        [M.leftStation]: { dx: 0, dy: 0, scale: 1, hidden: true },
      },
    );
    expect(hidden.missingByPrimary).toEqual({});
  });
});

describe("北宿电铁：真实字体渲染", () => {
  const load = (path: string) => {
    const bytes = readFileSync(path);
    return parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), {
      lowMemory: true,
    });
  };
  const fonts = new Map<FontId, ReturnType<typeof parse>>([
    [
      "noto-sans-jp-400",
      load("node_modules/@expo-google-fonts/noto-sans-jp/400Regular/NotoSansJP_400Regular.ttf"),
    ],
    ["tex-gyre-heros-400", load("src/assets/fonts/tex-gyre-heros/texgyreheros-regular.otf")],
  ]);
  const shaper = new OpentypeShaper(fonts);

  it("主字体缺字时交给补字字体，补字字体没加载时报告缺字", () => {
    const jpOnly = shaper.shape(["noto-sans-jp-400", "noto-sans-sc-400"], "浦蓝線", 21, 0, 0);
    expect(jpOnly.missing).toEqual(["蓝"]);
    const withSc = new OpentypeShaper(
      new Map([
        ...fonts,
        [
          "noto-sans-sc-400",
          load("node_modules/@expo-google-fonts/noto-sans-sc/400Regular/NotoSansSC_400Regular.ttf"),
        ],
      ]),
    );
    const shaped = withSc.shape(["noto-sans-jp-400", "noto-sans-sc-400"], "浦蓝線", 21, 0, 0);
    expect(shaped.missing).toEqual([]);
    // 三个字各占一个全角宽度，补字不应改变排版宽度的量级。
    expect(shaped.width).toBeCloseTo(63, 0);
    expect(withSc.measure(["noto-sans-jp-400", "noto-sans-sc-400"], "浦蓝線", 21)).toBeCloseTo(
      shaped.width,
      6,
    );
  });

  it("文字全部转成路径，SVG 里没有 <text>，也不引用字体", () => {
    const tree = kitajukuStyle.layout({
      content: kitajukuDefaults(),
      size: { width: 384, height: 128 },
      shaper,
      tweaks: {},
    });
    const svg = renderTreeToSvg(tree, { lighting: "fluore" });
    expect(svg).not.toContain("<text");
    expect(svg).not.toContain("font-family");
    expect(svg).toContain('width="384" height="128"');
    expect(svg).toContain("fesgen-lighting");
    expect(Object.keys(tree.missingGlyphs)).toEqual([]);
  });

  it("分层输出：背景层没有文字路径，内容层没有背景和灯光", () => {
    const tree = kitajukuStyle.layout({
      content: kitajukuDefaults(),
      size: { width: 600, height: 200 },
      shaper,
      tweaks: {},
    });
    const background = renderTreeToSvg(tree, { lighting: "led", layers: "background" });
    const content = renderTreeToSvg(tree, { lighting: "led", layers: "content" });
    expect(background).toContain("fesgen-lighting");
    expect(background).not.toContain("<path");
    expect(content).not.toContain("fesgen-lighting");
    expect(content).toContain("<path");
  });
});
