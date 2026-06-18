import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { appMinimize } from "../appMinimize.js";
import { _player } from "../../core/player-ref.js";

describe("appMinimize", () => {
  let spy;

  beforeEach(() => {
    spy = vi.spyOn(_player, "appMinimize").mockImplementation(() => {});
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it("is exported as a function", () => {
    expect(typeof appMinimize).toBe("function");
  });

  it("takes no parameters", () => {
    expect(appMinimize.length).toBe(0);
  });

  it("delegates to _player.appMinimize", () => {
    appMinimize();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith();
  });

  it("does not throw when real PlayerRef is used", () => {
    spy.mockRestore();
    expect(() => appMinimize()).not.toThrow();
  });

  it("propagates errors from _player.appMinimize", () => {
    spy.mockImplementation(() => {
      throw new Error("minimize failure");
    });
    expect(() => appMinimize()).toThrow("minimize failure");
  });

  it("matches the spec example shape (mouseUp handler)", () => {
    spy.mockRestore();
    const mouseUp = () => {
      appMinimize();
    };
    expect(() => mouseUp()).not.toThrow();
  });

  it("returns undefined", () => {
    expect(appMinimize()).toBeUndefined();
  });
});
