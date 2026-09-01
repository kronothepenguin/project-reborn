import { describe, it, expect } from "vitest";
import { WindowRegistry } from "../window-registry.js";

const win = (name) => ({ name });

describe("WindowRegistry — registration and z-order", () => {
  it("registers and looks up windows by name", () => {
    const r = new WindowRegistry();
    const w = win("main");
    r.register(w);
    expect(r.lookup("main")).toBe(w);
    expect(r.lookup("nope")).toBeNull();
  });

  it("list() returns z-order front-to-back with moveToFront/moveToBack", () => {
    const r = new WindowRegistry();
    const a = win("a");
    const b = win("b");
    const c = win("c");
    r.register(a);
    r.register(b);
    r.register(c);
    expect(r.frontWindow()).toBe(c);
    r.moveToFront(a);
    expect(r.list()).toEqual([b, c, a]);
    r.moveToBack(c);
    expect(r.list()).toEqual([c, b, a]);
  });

  it("unregister removes from lookup and order", () => {
    const r = new WindowRegistry();
    const w = win("main");
    r.register(w);
    r.unregister(w);
    expect(r.lookup("main")).toBeNull();
    expect(r.list()).toEqual([]);
    expect(r.frontWindow()).toBeNull();
  });

  it("reset() drops everything", () => {
    const r = new WindowRegistry();
    r.register(win("a"));
    r.register(win("b"));
    r.reset();
    expect(r.list()).toEqual([]);
    expect(r.frontWindow()).toBeNull();
  });

  it("two registries are isolated", () => {
    const r1 = new WindowRegistry();
    const r2 = new WindowRegistry();
    const w = win("main");
    r1.register(w);
    expect(r2.lookup("main")).toBeNull();
    expect(r2.list()).toEqual([]);
  });
});