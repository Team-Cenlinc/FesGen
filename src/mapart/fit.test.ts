import { describe, expect, it } from "vitest";
import { isUnscaled, placeSource } from "./fit";

const target = { width: 384, height: 128 };

describe("适配", () => {
  it("尺寸相同时不缩放、不偏移", () => {
    for (const mode of ["contain", "cover", "stretch"] as const) {
      const placement = placeSource(target, target, mode);
      expect(placement).toEqual({ x: 0, y: 0, width: 384, height: 128 });
      expect(isUnscaled(target, placement)).toBe(true);
    }
  });

  it("等比留边：600×200 缩到 384×128 正好填满", () => {
    expect(placeSource({ width: 600, height: 200 }, target, "contain")).toEqual({
      x: 0,
      y: 0,
      width: 384,
      height: 128,
    });
  });

  it("等比留边：方图居中，两侧留边", () => {
    expect(placeSource({ width: 100, height: 100 }, target, "contain")).toEqual({
      x: 128,
      y: 0,
      width: 128,
      height: 128,
    });
  });

  it("裁切：方图放大到铺满宽度，上下超出", () => {
    expect(placeSource({ width: 100, height: 100 }, target, "cover")).toEqual({
      x: 0,
      y: -128,
      width: 384,
      height: 384,
    });
  });

  it("拉伸：直接铺满", () => {
    expect(placeSource({ width: 100, height: 100 }, target, "stretch")).toEqual({
      x: 0,
      y: 0,
      width: 384,
      height: 128,
    });
  });
});
