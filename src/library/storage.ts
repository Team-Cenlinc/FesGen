import type { SignDocument } from "@/signs/types";
import { asRecord } from "@/signs/values";
import { normalizeSignDocument } from "./document";

/** 作品库存在浏览器的 localStorage 里；读写失败（隐私模式、空间满）时退化成只在本次会话有效。 */
const STORAGE_KEY = "fesgen.library.v1";

export interface LibrarySnapshot {
  version: 1;
  signs: SignDocument[];
}

export function readLibrary(
  storage: Pick<Storage, "getItem"> | undefined = globalThis.localStorage,
): SignDocument[] {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return [];
    const value = asRecord(JSON.parse(raw));
    const signs = Array.isArray(value.signs) ? value.signs : [];
    return signs
      .map((sign) => normalizeSignDocument(sign))
      .filter((sign): sign is SignDocument => sign !== null);
  } catch {
    return [];
  }
}

/** 写入作品库，返回是否成功（失败通常是存储空间满了）。 */
export function writeLibrary(
  signs: readonly SignDocument[],
  storage: Pick<Storage, "setItem"> | undefined = globalThis.localStorage,
): boolean {
  try {
    const snapshot: LibrarySnapshot = { version: 1, signs: [...signs] };
    storage?.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    return true;
  } catch {
    return false;
  }
}
