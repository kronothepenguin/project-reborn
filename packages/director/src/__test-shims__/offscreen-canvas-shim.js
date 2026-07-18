// Test shim: minimal OffscreenCanvas mock for vitest/jsdom (research.md R6).
// jsdom does not implement OffscreenCanvas; provide a 2D-context stub plus
// transferControlToOffscreen on HTMLCanvasElement so cast-loader/canvas/custom
// element tests can exercise the wiring without a real browser.

export class MockOffscreenCanvas {
  constructor(width = 300, height = 150) {
    this.width = width;
    this.height = height;
    this._ctx = new MockCanvasRenderingContext2D();
  }
  getContext(type) {
    return this._ctx;
  }
  transferToImageBitmap() {
    return { width: this.width, height: this.height, close() {} };
  }
  convertToBlob() {
    return Promise.resolve(new Blob([], { type: "image/png" }));
  }
}

export class MockCanvasRenderingContext2D {
  constructor() {
    this.canvas = null;
    this.fillStyle = "";
    this.strokeStyle = "";
    this.lineWidth = 1;
    this.globalAlpha = 1;
    this.font = "";
    this.textAlign = "";
    this.textBaseline = "";
  }
  save() {}
  restore() {}
  clearRect() {}
  fillRect() {}
  strokeRect() {}
  beginPath() {}
  closePath() {}
  moveTo() {}
  lineTo() {}
  fill() {}
  stroke() {}
  drawImage() {}
  putImageData() {}
  getImageData() {
    return { width: 0, height: 0, data: new Uint8ClampedArray(0) };
  }
  createImageData(w, h) {
    return { width: w, height: h, data: new Uint8ClampedArray(w * h * 4) };
  }
  scale() {}
  translate() {}
  rotate() {}
  setTransform() {}
}

export function installOffscreenCanvasShim(target = globalThis) {
  if (!target.OffscreenCanvas || target.OffscreenCanvas.__isMock) {
    target.OffscreenCanvas = MockOffscreenCanvas;
    target.OffscreenCanvas.__isMock = true;
  }
  // transferControlToOffscreen on HTMLCanvasElement (jsdom lacks it).
  if (typeof target.HTMLCanvasElement !== "undefined") {
    const proto = target.HTMLCanvasElement.prototype;
    if (typeof proto.transferControlToOffscreen !== "function") {
      proto.transferControlToOffscreen = function () {
        return new MockOffscreenCanvas(this.width || 300, this.height || 150);
      };
    }
  }
  if (!target.createImageBitmap || target.createImageBitmap.__isMock) {
    target.createImageBitmap = async function (blob) {
      return { width: 0, height: 0, close() {} };
    };
    target.createImageBitmap.__isMock = true;
  }
  return target.OffscreenCanvas;
}