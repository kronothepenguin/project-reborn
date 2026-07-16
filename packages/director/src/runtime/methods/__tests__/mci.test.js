import { describe, it, expect } from "vitest";
import { mci } from "../mci.js";

describe("mci", () => {
  it("is exported as a function", () => {
    expect(typeof mci).toBe("function");
  });

  it("takes one parameter (string)", () => {
    expect(mci.length).toBe(1);
  });

  it("does not throw (Windows-only stub)", () => {
    expect(() => mci("play cdaudio from 200 to 600 track 7")).not.toThrow();
  });

  it("returns undefined in non-Windows environments", () => {
    expect(mci("test")).toBeUndefined();
  });

  it("matches the spec example shape", () => {
    expect(() => mci("play cdaudio from 200 to 600 track 7")).not.toThrow();
  });
});
