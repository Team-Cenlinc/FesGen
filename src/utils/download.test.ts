import { describe, expect, it } from "vitest";
import { safeFileName } from "./download";

describe("文件名", () => {
  it("替换非法字符，保留中文", () => {
    expect(safeFileName("主城湾/北宿:1×3?")).toBe("主城湾-北宿-1×3-");
    expect(safeFileName("   ")).toBe("fesgen");
  });
});
