import { MapPalette } from "./palette";
import { quantize, type DitherMode } from "./quantize";

/** 主线程发来的量化请求；像素缓冲区以 transfer 方式移交，不复制。 */
export interface QuantizeRequest {
  id: number;
  width: number;
  height: number;
  buffer: ArrayBuffer;
  dither: DitherMode;
}

export interface QuantizeSuccess {
  id: number;
  width: number;
  height: number;
  buffer: ArrayBuffer;
  codes: ArrayBuffer;
  colorsUsed: number;
  transparentPixels: number;
}

/** 量化本身出错时回一条带原因的消息，主线程据此让对应的请求失败，而不是一直等下去。 */
export interface QuantizeFailure {
  id: number;
  error: string;
}

export type QuantizeResponse = QuantizeSuccess | QuantizeFailure;

// 色板和最近色缓存在 Worker 里常驻，多次调整参数时不用重算。
const palette = MapPalette.minecraft();

self.onmessage = (event: MessageEvent<QuantizeRequest>) => {
  const { id, width, height, buffer, dither } = event.data;
  let response: QuantizeSuccess;
  try {
    const result = quantize({ width, height, data: new Uint8ClampedArray(buffer) }, palette, {
      dither,
    });
    response = {
      id,
      width,
      height,
      buffer: result.image.data.buffer as ArrayBuffer,
      codes: result.codes.buffer as ArrayBuffer,
      colorsUsed: result.colorsUsed,
      transparentPixels: result.transparentPixels,
    };
  } catch (cause) {
    const failure: QuantizeFailure = {
      id,
      error: cause instanceof Error ? cause.message : String(cause),
    };
    self.postMessage(failure);
    return;
  }
  // 用 { transfer } 形式，DOM 和 Worker 两套类型声明下都成立。
  self.postMessage(response, { transfer: [response.buffer, response.codes] });
};
