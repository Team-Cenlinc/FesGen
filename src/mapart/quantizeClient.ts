import type { DitherMode, QuantizedMapArt, RgbaImage } from "./quantize";
import type { QuantizeRequest, QuantizeResponse } from "./quantize.worker";

let worker: Worker | undefined;
let nextId = 0;
const pending = new Map<number, (response: QuantizeResponse) => void>();

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("./quantize.worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (event: MessageEvent<QuantizeResponse>) => {
      pending.get(event.data.id)?.(event.data);
      pending.delete(event.data.id);
    };
  }
  return worker;
}

/** 在 Worker 里量化，避免大尺寸加抖动时卡住界面。传入的像素会被拷贝一份再移交。 */
export function quantizeInWorker(image: RgbaImage, dither: DitherMode): Promise<QuantizedMapArt> {
  const id = nextId++;
  const buffer = new Uint8ClampedArray(image.data).buffer;
  const request: QuantizeRequest = { id, width: image.width, height: image.height, buffer, dither };
  return new Promise((resolve) => {
    pending.set(id, (response) =>
      resolve({
        image: {
          width: response.width,
          height: response.height,
          data: new Uint8ClampedArray(response.buffer),
        },
        codes: new Uint8Array(response.codes),
        colorsUsed: response.colorsUsed,
        transparentPixels: response.transparentPixels,
      }),
    );
    getWorker().postMessage(request, [buffer]);
  });
}
