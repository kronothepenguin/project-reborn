import { describe, it, expect } from "vitest";
import { externalParamName } from "../externalParamName.js";
import { _player } from "../../singletons.js";

describe("externalParamName", () => {
  it("is exported as a function", () => {
    expect(typeof externalParamName).toBe("function");
  });

  it("returns null for unknown params", () => {
    expect(externalParamName("nope")).toBeNull();
  });

  it("returns the matched param name (case-insensitive)", () => {
    _player.parameters = { swURL: "x" };
    expect(externalParamName("swurl")).toBe("swURL");
  });

  it("returns the param at the given index", () => {
    _player.parameters = { swURL: "x", swName: "y" };
    expect(externalParamName(2)).toBe("swName");
  });

  it("matches the spec example shape (swURL lookup)", () => {
    _player.parameters = { swURL: "http://x" };
    expect(externalParamName("swURL")).toBe("swURL");
  });
});
