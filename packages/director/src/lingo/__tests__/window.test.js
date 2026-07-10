import { describe, it, expect, beforeEach } from "vitest";
import { window } from "../window.js";
import { WindowObject } from "../../core/window-object.js";

describe("window", () => {
  beforeEach(() => {
    WindowObject._reset();
  });

  it("is exported as a function", () => {
    expect(typeof window).toBe("function");
  });

  it("returns null for a name with no registered window", () => {
    expect(window("Nonexistent")).toBeNull();
  });

  it("returns the registered WindowObject for a name", () => {
    const w = new WindowObject("Sun");
    expect(window("Sun")).toBe(w);
  });

  it("returns null for non-string/empty input", () => {
    expect(window("")).toBeNull();
    expect(window(undefined)).toBeNull();
    expect(window(null)).toBeNull();
    expect(window(123)).toBeNull();
  });

  it("returns null after the window forgets itself", () => {
    const w = new WindowObject("Temp");
    w.forget();
    expect(window("Temp")).toBeNull();
  });
});
