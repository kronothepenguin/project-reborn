import { describe, it, expect } from "vitest";
import { externalParamValue } from "../externalParamValue.js";
import { _player } from "../../core/player-ref.js";

describe("externalParamValue", () => {
  it("is exported as a function", () => {
    expect(typeof externalParamValue).toBe("function");
  });

  it("returns undefined for unknown params", () => {
    expect(externalParamValue("missing")).toBeUndefined();
  });

  it("returns the value for a known param", () => {
    _player.parameters = { swURL: "http://example.com" };
    expect(externalParamValue("swURL")).toBe("http://example.com");
  });

  it("matches the spec example shape", () => {
    _player.parameters = { swURL: "http://x" };
    expect(externalParamValue("swURL")).toBe("http://x");
  });
});
