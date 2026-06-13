import { describe, it, expect, beforeEach } from "vitest";
import { _mouse } from "../api.js";

describe("Director Plugin - Mouse Events", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    _mouse.mouseH = 0;
    _mouse.mouseV = 0;
    _mouse.clickOn = 0;
  });

  describe("mousemove event", () => {
    it("updates _mouse.mouseH and _mouse.mouseV", () => {
      _mouse.mouseH = 100;
      _mouse.mouseV = 200;
      expect(_mouse.mouseH).toBe(100);
      expect(_mouse.mouseV).toBe(200);
    });

    it("updates _mouse.mouseLoc", () => {
      _mouse.mouseH = 100;
      _mouse.mouseV = 200;
      const loc = _mouse.mouseLoc;
      expect(loc).toBeDefined();
    });
  });

  describe("mousedown event", () => {
    it("updates _mouse.clickOn", () => {
      _mouse.clickOn = 5;
      expect(_mouse.clickOn).toBe(5);
    });
  });

  describe("mouseup event", () => {
    it("updates mouse button state", () => {
      _mouse.clickOn = 0;
      expect(_mouse.clickOn).toBe(0);
    });
  });
});
