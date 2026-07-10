import { describe, it, expect } from "vitest";
import { ilk } from "../ilk.js";
import { list, propList } from "../../core/index.js";
import { color } from "../../core/color.js";
import { point } from "../../core/point.js";
import { rect } from "../../core/rect.js";
import { _sound } from "../../core/sound-object.js";
import { _player } from "../../core/player-object.js";
import { _movie } from "../../core/movie-object.js";
import { WindowObject } from "../../core/window-object.js";

describe("ilk", () => {
  it("returns #integer for an integer", () => {
    expect(ilk(42)).toBe(Symbol.for("integer"));
  });
  it("returns #float for a float", () => {
    expect(ilk(3.14)).toBe(Symbol.for("float"));
  });
  it("returns #string for a string", () => {
    expect(ilk("hello")).toBe(Symbol.for("string"));
  });
  it("returns #list for a List", () => {
    expect(ilk(list(1, 2, 3))).toBe(Symbol.for("list"));
  });
  it("returns #propList for a PropList", () => {
    expect(ilk(propList(Symbol.for("a"), 1))).toBe(Symbol.for("propList"));
  });
  it("returns #symbol for a symbol", () => {
    expect(ilk(Symbol.for("test"))).toBe(Symbol.for("symbol"));
  });
  it("returns #void for undefined/null", () => {
    expect(ilk(undefined)).toBe(Symbol.for("void"));
    expect(ilk(null)).toBe(Symbol.for("void"));
  });
  it("returns #color for a Color", () => {
    expect(ilk(color(255, 0, 0))).toBe(Symbol.for("color"));
  });
  it("returns #point for a Point", () => {
    expect(ilk(point(10, 20))).toBe(Symbol.for("point"));
  });
  it("returns #rect for a Rect", () => {
    expect(ilk(rect(0, 0, 100, 100))).toBe(Symbol.for("rect"));
  });
  it("returns #date for a Date", () => {
    expect(ilk(new Date())).toBe(Symbol.for("date"));
  });
  it("returns #sound for SoundObject", () => {
    expect(ilk(_sound)).toBe(Symbol.for("sound"));
  });
  it("returns #player for PlayerObject", () => {
    expect(ilk(_player)).toBe(Symbol.for("player"));
  });
  it("returns #media for MovieObject", () => {
    expect(ilk(_movie)).toBe(Symbol.for("media"));
  });
  it("returns #window for WindowObject", () => {
    expect(ilk(new WindowObject("Sun"))).toBe(Symbol.for("window"));
  });
  it("is pure (no side effects)", () => {
    expect(ilk(42)).toBe(ilk(42));
  });
});
