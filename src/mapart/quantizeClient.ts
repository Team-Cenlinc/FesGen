import type { DitherMode, QuantizedMapArt, RgbaImage } from "./quantize";
import type { QuantizeRequest, QuantizeResponse } from "./quantize.worker";

interface Pending {
  resolve: (result: QuantizedMapArt) => void;
  reject: (error: Error) => void;
}

let worker: Worker | undefined;
let nextId = 0;
const pending = new Map<number, Pending>();

/**
 * Worker 整个出错（模块加载失败、内存不够被回收）时，所有还在等的请求都失败，
 * 并丢掉这个 Worker，下次请求重新创建一个。
 */
function failAll(message: string) {
  worker?.terminate();
  worker = undefined;
  const waiting = [...pending.values()];
  pending.clear();
  for (const request of waiting) request.reject(new Error(message));
}

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("./quantize.worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (event: MessageEvent<QuantizeResponse>) => {
      const response = event.data;
      const request = pending.get(response.id);
      pending.delete(response.id);
      if (!request) return;
      if ("error" in response) {
        request.reject(new Error(`地图画量化失败：${response.error}`));
        return;
      }
      request.resolve({
        image: {
          width: response.width,
          height: response.height,
          data: new Uint8ClampedArray(response.buffer),
        },
        codes: new Uint8Array(response.codes),
        colorsUsed: response.colorsUsed,
        transparentPixels: response.transparentPixels,
      });
    };
    worker.onerror = (event) => {
      event.preventDefault();
      failAll(`地图画量化失败：${event.message || "后台线程出错"}`);
    };
    worker.onmessageerror = () => failAll("地图画量化失败：后台线程返回的数据无法读取");
  }
  return worker;
}

/** 在 Worker 里量化，避免大尺寸加抖动时卡住界面。传入的像素会被拷贝一份再移交。出错时拒绝。 */
export function quantizeInWorker(image: RgbaImage, dither: DitherMode): Promise<QuantizedMapArt> {
  const id = nextId++;
  const buffer = new Uint8ClampedArray(image.data).buffer;
  const request: QuantizeRequest = { id, width: image.width, height: image.height, buffer, dither };
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    try {
      getWorker().postMessage(request, [buffer]);
    } catch (cause) {
      pending.delete(id);
      reject(cause instanceof Error ? cause : new Error(String(cause)));
    }
  });
}
