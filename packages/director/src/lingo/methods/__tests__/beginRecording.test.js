import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { beginRecording } from "../beginRecording.js";
import { _movie } from "../../singletons.js";

describe("beginRecording", () => {
  let originalFrame;

  beforeEach(() => {
    _movie._reset();
    _movie._setFrame(5);
    originalFrame = _movie.frame;
  });

  afterEach(() => {
    _movie._reset();
  });

  it("is exported as a function", () => {
    expect(typeof beginRecording).toBe("function");
  });

  it("takes no parameters", () => {
    expect(beginRecording.length).toBe(0);
  });

  it("delegates to _movie.beginRecording", () => {
    beginRecording();
    expect(_movie.frame).toBe(originalFrame + 1);
  });

  it("does not throw", () => {
    expect(() => beginRecording()).not.toThrow();
  });

  it("matches the spec example shape (animBall pattern)", () => {
    _movie._reset();
    _movie._setFrame(1);
    beginRecording();
    expect(_movie.frame).toBe(2);
  });

  it("returns undefined", () => {
    expect(beginRecording()).toBeUndefined();
  });
});
