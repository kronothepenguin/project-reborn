import { describe, it, expect } from "vitest";
import { propList } from "../propList.js";
import { PropList } from "../../index.js";

describe("propList", () => {
  it("returns a PropList instance when called with no args", () => {
    const result = propList();
    expect(result).toBeInstanceOf(PropList);
    expect(result.count).toBe(0);
  });

  it("returns a PropList with string key/value pairs", () => {
    const result = propList("top", "red", "sides", "blue", "bottom", "green");
    expect(result).toBeInstanceOf(PropList);
    expect(result.count).toBe(3);
    expect(result.getProp("top")).toBe("red");
    expect(result.getProp("sides")).toBe("blue");
    expect(result.getProp("bottom")).toBe("green");
  });

  it("returns a PropList with symbol key/value pairs", () => {
    const result = propList(Symbol.for("a"), 1, Symbol.for("b"), 2);
    expect(result.count).toBe(2);
    expect(result.getProp(Symbol.for("a"))).toBe(1);
    expect(result.getProp(Symbol.for("b"))).toBe(2);
  });
});
