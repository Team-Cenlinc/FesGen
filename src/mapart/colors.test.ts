import { describe, expect, it } from "vitest";
import { hexToRgb, labDistanceSquared, packRgb, rgbToHex, rgbToLab, unpackRgb } from "./colors";

describe("颜色换算", () => {
  it("打包和拆包互逆", () => {
    expect(unpackRgb(packRgb(0x12, 0xab, 0xff))).toEqual([0x12, 0xab, 0xff]);
  });

  it("十六进制只接受 #RRGGBB", () => {
    expect(hexToRgb("#55ccff")).toBe(0x55ccff);
    expect(hexToRgb("#5cf")).toBeNull();
    expect(rgbToHex(0x55ccff)).toBe("#55CCFF");
    expect(rgbToHex(0x0000ff)).toBe("#0000FF");
  });

  it("白和黑落在 L 轴两端", () => {
    const white = rgbToLab(0xffffff);
    const black = rgbToLab(0x000000);
    expect(white[0]).toBeCloseTo(100, 1);
    expect(white[1]).toBeCloseTo(0, 1);
    expect(white[2]).toBeCloseTo(0, 1);
    expect(black[0]).toBeCloseTo(0, 5);
  });

  it("纯红与参考值一致（D65）", () => {
    const [l, a, b] = rgbToLab(0xff0000);
    expect(l).toBeCloseTo(53.24, 1);
    expect(a).toBeCloseTo(80.09, 1);
    expect(b).toBeCloseTo(67.2, 1);
  });

  it("同色色差为 0", () => {
    const lab = rgbToLab(0x7297dd);
    expect(labDistanceSquared(lab, lab)).toBe(0);
  });
});
