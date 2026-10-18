import { describe, expect, it } from "vitest";
import { clampGridSide, exactGrid, gridLabel, gridPixelSize, suggestGrid } from "./grid";

describe("地图格子", () => {
  it("1×3 是 1 行 3 列，384×128", () => {
    expect(gridPixelSize({ rows: 1, columns: 3 })).toEqual({ width: 384, height: 128 });
    expect(gridLabel({ rows: 1, columns: 3 })).toBe("1×3");
  });

  it("整数张地图的尺寸直接识别", () => {
    expect(exactGrid({ width: 384, height: 128 })).toEqual({ rows: 1, columns: 3 });
    expect(exactGrid({ width: 600, height: 200 })).toBeNull();
  });

  it("旧版默认的 600×200 推荐 1×3", () => {
    expect(suggestGrid({ width: 600, height: 200 })).toEqual({ rows: 1, columns: 3 });
  });

  it("比例相同时选地图张数少的", () => {
    expect(suggestGrid({ width: 1000, height: 500 })).toEqual({ rows: 1, columns: 2 });
    expect(suggestGrid({ width: 500, height: 500 })).toEqual({ rows: 1, columns: 1 });
  });

  it("竖图也能推荐", () => {
    expect(suggestGrid({ width: 200, height: 400 })).toEqual({ rows: 2, columns: 1 });
  });

  it("格子边长限制在 1–16", () => {
    expect(clampGridSide(0)).toBe(1);
    expect(clampGridSide(3.4)).toBe(3);
    expect(clampGridSide(99)).toBe(16);
    expect(clampGridSide(Number.NaN)).toBe(1);
  });
});
