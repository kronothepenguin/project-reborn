import { describe, it, expect, beforeEach, vi } from "vitest";
import { beep } from "../beep.js";
import { _sound } from "../../singletons.js";

describe("beep", () => {
  let beepSpy;

  beforeEach(() => {
    _sound.soundEnabled = true;
    if (beepSpy) beepSpy.mockRestore();
    beepSpy = vi.spyOn(_sound, "beep").mockImplementation(() => {});
    beepSpy.mockClear();
  });

  it("is exported as a function", () => {
    expect(typeof beep).toBe("function");
  });

  it("plays once when called with no argument", () => {
    beep();
    expect(beepSpy).toHaveBeenCalledTimes(1);
  });

  it("plays intBeepCount times when given a positive integer", () => {
    beep(3);
    expect(beepSpy).toHaveBeenCalledTimes(3);
  });

  it("plays once when given 1 explicitly", () => {
    beep(1);
    expect(beepSpy).toHaveBeenCalledTimes(1);
  });

  it("plays zero times when given 0", () => {
    beep(0);
    expect(beepSpy).toHaveBeenCalledTimes(0);
  });

  it("truncates fractional counts toward zero", () => {
    beep(2.9);
    expect(beepSpy).toHaveBeenCalledTimes(2);
  });

  it("coerces numeric strings to integer counts", () => {
    beep("4");
    expect(beepSpy).toHaveBeenCalledTimes(4);
  });

  it("clamps negative counts to zero", () => {
    beep(-5);
    expect(beepSpy).toHaveBeenCalledTimes(0);
  });

  it("always calls SoundObject.beep; SoundObject decides whether sound plays", () => {
    _sound.soundEnabled = false;
    beep(2);
    expect(beepSpy).toHaveBeenCalledTimes(2);
  });
});
