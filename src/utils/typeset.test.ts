import { describe, expect, it } from "vitest";
import { spaceMixedScript, typeRuns } from "./typeset";

describe("typeRuns", () => {
  it("splits CJK, Latin and the multiplication sign", () => {
    expect(typeRuns("1×3 地图格")).toEqual([
      { kind: "latin", text: "1" },
      { kind: "times", text: "×" },
      { kind: "latin", text: "3" },
      { kind: "plain", text: " " },
      { kind: "cjk", text: "地图格" },
    ]);
  });

  it("keeps consecutive multiplication signs separate", () => {
    expect(typeRuns("××").map((run) => run.kind)).toEqual(["times", "times"]);
  });

  it("treats kana as CJK", () => {
    expect(typeRuns("かい")).toEqual([{ kind: "cjk", text: "かい" }]);
  });
});

describe("spaceMixedScript", () => {
  it("adds spaces between digits and Chinese", () => {
    expect(spaceMixedScript("36分钟前")).toBe("36 分钟前");
    expect(spaceMixedScript("3天后")).toBe("3 天后");
  });

  it("leaves already spaced or pure text alone", () => {
    expect(spaceMixedScript("3 分钟前")).toBe("3 分钟前");
    expect(spaceMixedScript("昨天")).toBe("昨天");
  });
});
