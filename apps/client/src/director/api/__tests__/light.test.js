import { describe, it, expect } from "vitest";
import { light } from "../light.js";

describe("light", () => {
  it("is exported as a function", () => {
    expect(typeof light).toBe("function");
  });

  it("returns an object with a name", () => {
    const l = light("spot01");
    expect(l.name).toBe("spot01");
  });

  it("returns empty name when no arg", () => {
    expect(light().name).toBe("");
  });

  it("matches the spec example shape (spot01 and indexed lookup)", () => {
    const l1 = light("spot01");
    const l2 = light(2);
    expect(l1.name).toBe("spot01");
    expect(l2.name).toBe("2");
  });
});
