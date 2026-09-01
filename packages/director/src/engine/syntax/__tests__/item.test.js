import { describe, it, expect, afterEach } from "vitest";
import { item, itemRange, the } from "../../../api/index.js";

afterEach(() => {
  the.itemDelimiter = ",";
});

describe("item chunk expression", () => {
  it("reads a single item between delimiters (doc example)", () => {
    expect(String(item(3).of("red,yellow,blue green,orange"))).toBe("blue green");
  });

  it("clamps a range end to the actual last item and rejoins with delimiters (doc example)", () => {
    expect(String(item(3).to(5).of("red,yellow,blue green,orange"))).toBe("blue green, orange");
  });

  it("returns the empty string for out-of-range items (doc example)", () => {
    expect(String(item(9).of("red,yellow,blue green,orange"))).toBe("");
  });

  it("treats trailing and consecutive delimiters as empty items", () => {
    expect(String(item(3).of("a,b,"))).toBe("");
    expect(String(item(2).of("a,,b"))).toBe("");
  });

  it("uses the live itemDelimiter at call time (C3)", () => {
    the.itemDelimiter = ":";
    expect(String(item(2).of("a:b:c"))).toBe("b");
    expect(String(item(2).to(3).of("a:b:c"))).toBe("b: c");
  });

  it("restoring the delimiter returns prior behavior", () => {
    the.itemDelimiter = ":";
    expect(String(item(2).of("a:b"))).toBe("b");
    the.itemDelimiter = ",";
    expect(String(item(2).of("a,b"))).toBe("b");
  });

  it("itemRange is an alias for item(a).to(b)", () => {
    expect(String(itemRange(2, 3).of("a:b:c"))).toBe(String(item(2).to(3).of("a:b:c")));
  });
});