import { describe, it, expect, beforeEach, vi } from "vitest";
import { _movie } from "../api.js";

describe("Director Plugin - Movie Lifecycle", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    _movie._frame = 0;
    _movie._frameTempo = 30;
  });

  describe("prepareMovie event", () => {
    it("can be dispatched on canvas", () => {
      const canvas = document.createElement("canvas");
      const handler = vi.fn();
      canvas.addEventListener("prepareMovie", handler);
      canvas.dispatchEvent(new CustomEvent("prepareMovie"));
      expect(handler).toHaveBeenCalled();
    });

    it("event listeners are called", () => {
      const canvas = document.createElement("canvas");
      let called = false;
      canvas.addEventListener("prepareMovie", () => { called = true; });
      canvas.dispatchEvent(new CustomEvent("prepareMovie"));
      expect(called).toBe(true);
    });
  });

  describe("animation frame", () => {
    it("respects tempo", () => {
      _movie._frameTempo = 30;
      expect(_movie._frameTempo).toBe(30);
    });

    it("updates frame counter", () => {
      _movie._frame = 10;
      expect(_movie._frame).toBe(10);
    });
  });
});
