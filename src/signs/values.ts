/** 按点路径读写内容对象（例如 "left.chinese"）。写入时返回新对象，不改原对象，便于撤销。 */
export function getAtPath(target: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (value, key) =>
        value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined,
      target,
    );
}

export function setAtPath<T>(target: T, path: string, value: unknown): T {
  const [head, ...rest] = path.split(".");
  const next = (current: unknown) =>
    rest.length === 0 ? value : setAtPath(current, rest.join("."), value);
  // 列表里的项（例如 "lines.0.code"）要保持数组，不能展开成普通对象。
  if (Array.isArray(target)) {
    const copy = [...target];
    copy[Number(head)] = next(copy[Number(head)]);
    return copy as T;
  }
  const source = (target ?? {}) as Record<string, unknown>;
  return { ...source, [head!]: next(source[head!]) } as T;
}

/** 字段的显示条件：“path” 表示那个值为真时显示，“path=value” 表示等于这个值时显示。 */
export function isFieldVisible(content: unknown, visibleWhen: string | undefined): boolean {
  if (!visibleWhen) return true;
  const [path, expected] = visibleWhen.split("=");
  const value = getAtPath(content, path!);
  return expected === undefined ? Boolean(value) : String(value) === expected;
}

/** 在列表的 index 位置插入一项，返回新数组。 */
export function listInsert<T>(list: readonly T[], index: number, item: T): T[] {
  const at = Math.max(0, Math.min(list.length, index));
  return [...list.slice(0, at), item, ...list.slice(at)];
}

export function listRemove<T>(list: readonly T[], index: number): T[] {
  return list.filter((_item, i) => i !== index);
}

/** 把 from 位置的项移到 to 位置。 */
export function listMove<T>(list: readonly T[], from: number, to: number): T[] {
  if (from === to || from < 0 || from >= list.length) return [...list];
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(Math.max(0, Math.min(copy.length, to)), 0, item!);
  return copy;
}

/** 以下是 normalize 用的宽松读取：类型不对时退回默认值，旧版存成字符串的数字也能读。 */

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function asString(value: unknown, fallback: string): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

export function asBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

export function asNumber(value: unknown, fallback: number, min: number, max: number): number {
  const number = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  if (typeof number !== "number" || !Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

/** 只接受 #RRGGBB（大小写都行），统一成大写；其他写法退回默认值。 */
export function asColor(value: unknown, fallback: string): string {
  return typeof value === "string" && /^#[\da-f]{6}$/i.test(value) ? value.toUpperCase() : fallback;
}

export function asChoice<T extends string>(value: unknown, choices: readonly T[], fallback: T): T {
  return choices.includes(value as T) ? (value as T) : fallback;
}
