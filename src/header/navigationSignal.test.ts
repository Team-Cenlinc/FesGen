import { describe, expect, it } from "vitest";
import {
  createNavigationSignal,
  isNavigationSignal,
  SIGNAL_LINE_VARIABLES,
} from "./navigationSignal";

function sequence(...values: number[]) {
  let index = 0;
  return () => values[index++ % values.length]!;
}

describe("导航线路信号", () => {
  it("单色：第二个随机数不小于 0.5", () => {
    expect(createNavigationSignal(sequence(0, 0.9))).toEqual({
      cssVariables: [SIGNAL_LINE_VARIABLES[0]],
      pattern: "single",
    });
  });

  it("双色：两条线路一定不同", () => {
    const signal = createNavigationSignal(sequence(0, 0.1, 0));
    expect(signal.pattern).toBe("double");
    expect(signal.cssVariables[0]).not.toBe(signal.cssVariables[1]);
    expect(isNavigationSignal(signal)).toBe(true);
  });

  it("拒绝过期或手改的缓存", () => {
    expect(isNavigationSignal({ cssVariables: ["--line-surc-ds"], pattern: "single" })).toBe(false);
    expect(
      isNavigationSignal({ cssVariables: ["--line-fta-sl", "--line-fta-sl"], pattern: "double" }),
    ).toBe(false);
    expect(isNavigationSignal(null)).toBe(false);
  });
});
