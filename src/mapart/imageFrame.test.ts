import { describe, expect, it } from "vitest";
import { imageFrameCreateCommand, sanitizeImageFrameName, signImageFrameName } from "./imageFrame";

describe("ImageFrame 命令", () => {
  it("宽高分别是列数和行数", () => {
    expect(
      imageFrameCreateCommand("spawn-bay", "https://example.com/a.png", { rows: 1, columns: 3 }),
    ).toBe("/imageframe create spawn-bay https://example.com/a.png 3 1");
  });

  it("没填链接时留占位", () => {
    expect(imageFrameCreateCommand("a", " ", { rows: 2, columns: 4 })).toBe(
      "/imageframe create a <图片链接> 4 2",
    );
  });

  it("名称去掉扩展名、空格和特殊字符", () => {
    expect(sanitizeImageFrameName("Spawn Bay 站牌.png")).toBe("Spawn-Bay");
    expect(sanitizeImageFrameName("主城湾.png")).toBe("fesgen");
    expect(sanitizeImageFrameName("  a__b--c  ")).toBe("a__b-c");
  });

  it("从牌子导出时地图名带上牌子 id，不同的牌子不会重名", () => {
    const id = "dcd933c9-34a7-49b1-9a8c-3bafa981cf09";
    expect(signImageFrameName("克罗顿高地", id)).toBe("fesgen-dcd933c9");
    expect(signImageFrameName("FTA 车站牌", id)).toBe("FTA-dcd933c9");
    expect(signImageFrameName("Spawn Bay", id)).toBe("Spawn-Bay-dcd933c9");
    expect(signImageFrameName("FTA 车站牌", "另一块")).toBe("FTA");
    expect(
      imageFrameCreateCommand(signImageFrameName("主城湾", id), "", { rows: 1, columns: 3 }),
    ).toBe("/imageframe create fesgen-dcd933c9 <图片链接> 3 1");
  });
});
