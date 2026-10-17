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
  const source = (target ?? {}) as Record<string, unknown>;
  return {
    ...source,
    [head!]: rest.length === 0 ? value : setAtPath(source[head!], rest.join("."), value),
  } as T;
}

/** 以下是 normalize 用的宽松读取：类型不对时退回默认值，旧版存成字符串的数字也能读。 */

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
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
