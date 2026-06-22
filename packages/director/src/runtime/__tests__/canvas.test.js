import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  setCanvas,
  getCanvas,
  getContext,
  updateStage,
  resizeCanvas,
  setBackgroundColor,
  getStageSize,
  resetCanvas,
} from "../canvas.js";
import { _createMovie } from "../custom-elements.js";

function createMockContext() {
  const noop = () => {};
  return {
    fillRect: vi.fn(noop),
    clearRect: vi.fn(noop),
    drawImage: vi.fn(noop),
    fillText: vi.fn(noop),
    strokeRect: vi.fn(noop),
    fillStyle: "",
    strokeStyle: "",
    font: "",
    globalAlpha: 1,
    save: vi.fn(noop),
    restore: vi.fn(noop),
    translate: vi.fn(noop),
    rotate: vi.fn(noop),
    scale: vi.fn(noop),
  };
}

function makeCanvas() {
  const ctx = createMockContext();
  const canvas = {
    width: 320,
    height: 240,
    style: {},
    getContext: vi.fn(() => ctx),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => true),
  };
  canvas._mockCtx = ctx;
  return canvas;
}

describe("canvas", () => {
  let canvas;

  beforeEach(() => {
    canvas = makeCanvas();
    resetCanvas();
  });

  afterEach(() => {
    resetCanvas();
  });

  it("setCanvas stores canvas and exposes context", () => {
    const result = setCanvas(canvas);
    expect(result).toBe(canvas);
    expect(getCanvas()).toBe(canvas);
    expect(getContext()).not.toBeNull();
  });

  it("setCanvas null clears the active canvas", () => {
    setCanvas(canvas);
    expect(getCanvas()).toBe(canvas);
    setCanvas(null);
    expect(getCanvas()).toBeNull();
  });

  it("updateStage paints background and sprite list", () => {
    setCanvas(canvas);
    setBackgroundColor("#ff00ff");
    const ctx = getContext();
    updateStage({
      sprites: [
        { x: 0, y: 0, width: 10, height: 10, color: "#fff" },
      ],
    });
    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it("updateStage is a no-op when no canvas is set", () => {
    expect(() => updateStage()).not.toThrow();
  });

  it("resizeCanvas changes dimensions and updates movie size", () => {
    const movie = _createMovie({ width: 320, height: 240 });
    setCanvas(canvas, movie);
    resizeCanvas(640, 480);
    expect(canvas.width).toBe(640);
    expect(canvas.height).toBe(480);
    expect(movie.width).toBe(640);
    expect(movie.height).toBe(480);
    expect(getStageSize()).toEqual({ width: 640, height: 480 });
  });

  it("resizeCanvas is a no-op when no canvas is set", () => {
    expect(() => resizeCanvas(100, 100)).not.toThrow();
  });

  it("draws image-based sprites via drawImage", () => {
    setCanvas(canvas);
    const ctx = getContext();
    const image = { width: 20, height: 20 };
    updateStage({
      sprites: [
        { x: 5, y: 5, width: 20, height: 20, image },
      ],
    });
    expect(ctx.drawImage).toHaveBeenCalled();
  });

  it("skips sprites with visible === false", () => {
    setCanvas(canvas);
    const ctx = getContext();
    updateStage({
      sprites: [
        { x: 0, y: 0, width: 10, height: 10, color: "#fff", visible: false },
      ],
    });
    const colorFills = ctx.fillRect.mock.calls.filter(
      (c) => c[2] === 10 && c[3] === 10
    );
    expect(colorFills.length).toBe(0);
  });

  it("draws text sprites with fillText", () => {
    setCanvas(canvas);
    const ctx = getContext();
    updateStage({
      sprites: [
        { x: 1, y: 2, text: "hi", color: "#fff", font: "10px sans" },
      ],
    });
    expect(ctx.fillText).toHaveBeenCalledWith("hi", 1, 2);
  });
});
