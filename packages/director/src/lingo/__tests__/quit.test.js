import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { quit } from "../quit.js";
import { _player } from "../../core/player-ref.js";

describe("quit", () => {
  let quitSpy;

  beforeEach(() => {
    quitSpy = vi.spyOn(_player, "quit").mockImplementation(() => {});
  });

  afterEach(() => {
    quitSpy.mockRestore();
  });

  it("is exported as a function", () => {
    expect(typeof quit).toBe("function");
  });

  it("takes no parameters", () => {
    expect(quit.length).toBe(0);
  });

  it("delegates to _player.quit (Player method, not Movie)", () => {
    quit();
    expect(quitSpy).toHaveBeenCalledTimes(1);
    expect(quitSpy).toHaveBeenCalledWith();
  });

  it("does not throw on the real PlayerRef path", () => {
    quitSpy.mockRestore();
    expect(() => quit()).not.toThrow();
  });

  it("propagates errors from _player.quit", () => {
    quitSpy.mockImplementation(() => {
      throw new Error("quit failure");
    });
    expect(() => quit()).toThrow("quit failure");
  });

  it("returns undefined", () => {
    expect(quit()).toBeUndefined();
  });

  it("matches the spec example shape (command+Q handler)", () => {
    quitSpy.mockRestore();
    const key = "q";
    const commandDown = true;
    if (key === "q" && commandDown) {
      expect(() => quit()).not.toThrow();
    }
  });
});
