import { describe, it, expect } from "vitest";
import { symbol } from "../symbol.js";
import { symbolP } from "../symbolP.js";
import { ilk } from "../ilk.js";
import { list } from "../list.js";
import { propList } from "../propList.js";
import { point } from "../point.js";
import { color } from "../color.js";

describe("symbol() / symbolP() (006 US5)", () => {
  it("takes a string and returns the corresponding symbol", () => {
    const s = symbol("hello");
    expect(s).toBe(Symbol.for("hello"));
    expect(symbolP(s)).toBe(true);
  });

  it("symbolP rejects non-symbols", () => {
    expect(symbolP("hello")).toBe(false);
    expect(symbolP(3)).toBe(false);
    expect(symbolP(undefined)).toBe(false);
  });
});

describe("ilk() — type introspection (006 US5, docs table)", () => {
  it("returns the documented type symbol", () => {
    expect(ilk(3)).toBe(Symbol.for("integer"));
    expect(ilk(3.5)).toBe(Symbol.for("float"));
    expect(ilk("a")).toBe(Symbol.for("string"));
    expect(ilk(list([1, 2]))).toBe(Symbol.for("list"));
    expect(ilk(propList({ a: 1 }))).toBe(Symbol.for("proplist"));
    expect(ilk(point(1, 2))).toBe(Symbol.for("point"));
    expect(ilk(color(1, 2, 3))).toBe(Symbol.for("color"));
    expect(ilk(Symbol.for("x"))).toBe(Symbol.for("symbol"));
    expect(ilk(undefined)).toBe(Symbol.for("void"));
    expect(ilk(null)).toBe(Symbol.for("void"));
  });

  it("two-arg form returns TRUE only if the type matches", () => {
    expect(ilk(3, Symbol.for("number"))).toBe(true);
    expect(ilk(3, Symbol.for("integer"))).toBe(true);
    expect(ilk(3, Symbol.for("float"))).toBe(false);
    expect(ilk(3.5, Symbol.for("number"))).toBe(true);

    expect(ilk(list([1]), Symbol.for("list"))).toBe(true);
    expect(ilk(list([1]), Symbol.for("linearlist"))).toBe(true);
    expect(ilk(propList({}), Symbol.for("list"))).toBe(true);
    expect(ilk(propList({}), Symbol.for("proplist"))).toBe(true);
    expect(ilk(point(1, 2), Symbol.for("list"))).toBe(true);
    expect(ilk(point(1, 2), Symbol.for("point"))).toBe(true);

    expect(ilk("s", Symbol.for("integer"))).toBe(false);
    expect(ilk(3, Symbol.for("string"))).toBe(false);
  });
});