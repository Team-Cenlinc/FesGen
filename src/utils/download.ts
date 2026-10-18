/** 触发浏览器下载。立刻回收链接会让部分浏览器下载失败，所以延迟释放。 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** 去掉文件名里各系统不允许的字符；清洗后为空时用 fallback。 */
export function safeFileName(name: string, fallback = "fesgen"): string {
  const cleaned = name
    .trim()
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-")
    .replace(/\s+/g, " ")
    .slice(0, 80);
  return cleaned || fallback;
}
