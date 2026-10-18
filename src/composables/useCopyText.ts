import { onBeforeUnmount, ref } from "vue";

/**
 * “复制”按钮：成功时短暂显示“已复制”；浏览器不让访问剪贴板时（非 HTTPS、权限被拒）
 * 显示失败提示，并把文字选中，方便用户自己按复制键。
 */
export function useCopyText() {
  const copied = ref(false);
  const failed = ref(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  async function copy(text: string, source?: HTMLElement | null) {
    clearTimeout(timer);
    try {
      await navigator.clipboard.writeText(text);
      failed.value = false;
      copied.value = true;
      timer = setTimeout(() => (copied.value = false), 1500);
    } catch {
      copied.value = false;
      failed.value = true;
      if (source) {
        const range = document.createRange();
        range.selectNodeContents(source);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  }

  onBeforeUnmount(() => clearTimeout(timer));
  return { copied, failed, copy };
}
