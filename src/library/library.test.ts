import { describe, expect, it } from "vitest";
import { kitajukuDefaults } from "@/signs/kitajuku/content";
import { createSign, duplicateSign, normalizeSignDocument } from "./document";
import { exportSignJson, importSignJson } from "./io";
import { readLibrary, writeLibrary } from "./storage";

describe("牌子文档", () => {
  it("新建：默认内容、1×3 地图格、荧光灯", () => {
    const sign = createSign("kitajuku-dentetsu", 1000);
    expect(sign.size).toEqual({ mode: "grid", grid: { rows: 1, columns: 3 } });
    expect(sign.lighting).toBe("fluore");
    expect(sign.content).toEqual(kitajukuDefaults());
    expect(sign.createdAt).toBe(1000);
  });

  it("复制：新 id、名字加“副本”、内容独立", () => {
    const sign = createSign("kitajuku-dentetsu");
    const copy = duplicateSign(sign);
    expect(copy.id).not.toBe(sign.id);
    expect(copy.name).toBe("北宿电铁 副本");
    (copy.content as ReturnType<typeof kitajukuDefaults>).station.chinese = "改了";
    expect((sign.content as ReturnType<typeof kitajukuDefaults>).station.chinese).toBe("海浜宿海");
  });

  it("校验：未知样式返回 null；尺寸和微调越界时被夹住", () => {
    expect(normalizeSignDocument({ style: "test-sign" })).toBeNull();
    const sign = normalizeSignDocument({
      style: "kitajuku-dentetsu",
      size: { mode: "free", width: 99999, height: "3" },
      tweaks: { arrow: { dx: "5", scale: 0, hidden: "true" } },
      lighting: "disco",
    })!;
    expect(sign.size).toEqual({ mode: "free", width: 4096, height: 16 });
    expect(sign.tweaks.arrow).toEqual({ dx: 5, dy: 0, scale: 0.1, hidden: true });
    expect(sign.lighting).toBe("fluore");
  });
});

describe("导入导出", () => {
  it("新版 JSON 往返：内容一致，导入后换新 id", () => {
    const sign = createSign("kitajuku-dentetsu");
    sign.name = "主城湾";
    sign.thumbnail = "data:image/png;base64,AAAA";
    const json = exportSignJson(sign);
    expect(json).not.toContain("thumbnail");
    const result = importSignJson(json);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.legacy).toBe(false);
    expect(result.sign.id).not.toBe(sign.id);
    expect(result.sign.name).toBe("主城湾");
    expect(result.sign.content).toEqual(sign.content);
    expect(result.sign.size).toEqual(sign.size);
  });

  it("旧版北宿电铁文件迁移成新牌子，名字取本站名", () => {
    const result = importSignJson(
      JSON.stringify({
        configVersion: "beta-v0.1.1",
        signStyle: "kitajuku-dentetsu",
        lightStyle: "none",
        output: { outputWidth: 600, outputHeight: 200 },
        signInfo: { main: { staNameChinese: "主城湾" } },
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.legacy).toBe(true);
    expect(result.sign.name).toBe("主城湾");
    expect(result.sign.lighting).toBe("none");
    expect(result.sign.size).toEqual({ mode: "free", width: 600, height: 200 });
  });

  it("旧版文件带 BOM 也能读", () => {
    const result = importSignJson(
      "﻿" + JSON.stringify({ configVersion: "beta-v0.1.1", signStyle: "kitajuku-dentetsu" }),
    );
    expect(result.ok).toBe(true);
  });

  it("FTA、测试牌和无法识别的文件给出明确提示", () => {
    const fta = importSignJson(
      JSON.stringify({ configVersion: "beta-v0.1.1", signStyle: "FTA-station" }),
    );
    expect(fta).toEqual({ ok: false, message: expect.stringContaining("正在重做") });
    const test = importSignJson(
      JSON.stringify({ configVersion: "beta-v0.1.1", signStyle: "test-sign" }),
    );
    expect(test).toEqual({ ok: false, message: expect.stringContaining("停用") });
    expect(importSignJson("{")).toEqual({
      ok: false,
      message: expect.stringContaining("不是有效的 JSON"),
    });
    expect(importSignJson("{}")).toEqual({
      ok: false,
      message: expect.stringContaining("无法识别"),
    });
    expect(
      importSignJson(JSON.stringify({ format: "fesgen.sign", version: 99, sign: {} })),
    ).toEqual({
      ok: false,
      message: expect.stringContaining("更新版本"),
    });
  });
});

describe("作品库存储", () => {
  function memoryStorage() {
    const data = new Map<string, string>();
    return {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => void data.set(key, value),
    };
  }

  it("写入再读出得到同样的牌子，坏数据被丢掉", () => {
    const storage = memoryStorage();
    const sign = createSign("kitajuku-dentetsu");
    expect(writeLibrary([sign, { style: "nope" } as never], storage)).toBe(true);
    const signs = readLibrary(storage);
    expect(signs).toHaveLength(1);
    expect(signs[0]!.id).toBe(sign.id);
  });

  it("存储损坏或不可用时返回空列表，写入失败返回 false", () => {
    expect(readLibrary({ getItem: () => "not json" })).toEqual([]);
    expect(
      writeLibrary([], {
        setItem: () => {
          throw new Error("QuotaExceededError");
        },
      }),
    ).toBe(false);
  });
});
