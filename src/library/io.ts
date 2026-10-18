import { getSignStyle } from "@/signs/registry";
import type { SignDocument } from "@/signs/types";
import { asRecord } from "@/signs/values";
import { createSign, normalizeSignDocument } from "./document";

/** 新版导出文件的格式标记与版本。 */
export const SIGN_FILE_FORMAT = "fesgen.sign";
export const SIGN_FILE_VERSION = 2;

export interface SignFile {
  format: typeof SIGN_FILE_FORMAT;
  version: typeof SIGN_FILE_VERSION;
  sign: Omit<SignDocument, "thumbnail">;
}

/** 导出成 JSON：不含缩略图，文件小、内容可读。 */
export function exportSignJson(sign: SignDocument): string {
  const { thumbnail: _thumbnail, ...rest } = sign;
  const file: SignFile = { format: SIGN_FILE_FORMAT, version: SIGN_FILE_VERSION, sign: rest };
  return JSON.stringify(file, null, 2);
}

export type ImportResult =
  { ok: true; sign: SignDocument; legacy: boolean } | { ok: false; message: string };

/**
 * 读取导入的 JSON：新版 fesgen.sign 文件，或旧版 Vue 2 导出的 beta-v0.1.1 文件。
 * 导入的牌子总是拿新的 id，不会覆盖作品库里已有的牌子。
 */
export function importSignJson(text: string, now = Date.now()): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text.replace(/^﻿/, ""));
  } catch {
    return { ok: false, message: "这个文件不是有效的 JSON，可能已经损坏。" };
  }
  const value = asRecord(parsed);

  if (value.format === SIGN_FILE_FORMAT) {
    if (typeof value.version !== "number" || value.version > SIGN_FILE_VERSION) {
      return { ok: false, message: "这个文件来自更新版本的 FesGen，请先更新再导入。" };
    }
    const sign = normalizeSignDocument(value.sign, now);
    if (!sign) {
      return { ok: false, message: "这个文件里的牌子样式 FesGen 还不支持。" };
    }
    return {
      ok: true,
      sign: { ...sign, id: createSign(sign.style, now).id, createdAt: now, updatedAt: now },
      legacy: false,
    };
  }

  if (value.configVersion === "beta-v0.1.1") {
    switch (value.signStyle) {
      case "kitajuku-dentetsu": {
        const migrated = getSignStyle("kitajuku-dentetsu").fromLegacy(value);
        const base = createSign("kitajuku-dentetsu", now);
        const content = migrated.content as { station?: { chinese?: string } };
        return {
          ok: true,
          legacy: true,
          sign: {
            ...base,
            name: content.station?.chinese || base.name,
            size: migrated.size,
            lighting: migrated.lighting,
            content: migrated.content,
          },
        };
      }
      case "FTA-station": {
        const style = getSignStyle("FTA-station");
        const migrated = style.fromLegacy(value);
        const base = createSign("FTA-station", now);
        return {
          ok: true,
          legacy: true,
          sign: {
            ...base,
            name: style.title?.(migrated.content) || base.name,
            size: migrated.size,
            lighting: migrated.lighting,
            content: migrated.content,
          },
        };
      }
      case "FTA-guide":
        return { ok: false, message: "FTA 导视牌正在重做，暂时还不能导入旧文件。" };
      case "test-sign":
        return { ok: false, message: "“测试用”样式已经停用，这个文件没有可以导入的内容。" };
      default:
        return { ok: false, message: "旧版文件里的牌子样式无法识别。" };
    }
  }

  return {
    ok: false,
    message: "无法识别这个文件：它既不是 FesGen 导出的牌子，也不是旧版 FesGen 的配置文件。",
  };
}
