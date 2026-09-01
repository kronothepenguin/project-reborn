import { describe, it, expect } from "vitest";
import { MemberRegistry } from "../member-registry.js";

const castLib = (name) => ({ name });

describe("MemberRegistry — registration and lookup", () => {
  it("assigns sequential numbers for members registered without one", () => {
    const r = new MemberRegistry();
    const a = { name: "a", number: 0 };
    const b = { name: "b" };
    r.register("internal", a);
    r.register("internal", b);
    expect(a.number).toBe(1);
    expect(b.number).toBe(2);
  });

  it("preserves explicit numbers and bumps the counter past them", () => {
    const r = new MemberRegistry();
    const x = { name: "x", number: 10 };
    r.register("internal", x);
    const y = { name: "y" };
    r.register("internal", y);
    expect(x.number).toBe(10);
    expect(y.number).toBe(11);
  });

  it("looks up by number and by name within a castLib", () => {
    const r = new MemberRegistry();
    const m = { name: "logo", number: 3 };
    r.register("internal", m);
    expect(r.lookupByNumber("internal", 3)).toBe(m);
    expect(r.lookupByNameInCastLib("internal", "logo")).toBe(m);
    expect(r.lookupByNumber("internal", 99)).toBeNull();
    expect(r.lookupByNameInCastLib("internal", "nope")).toBeNull();
  });

  it("searches castLibs in declaration order for movie-wide name lookup", () => {
    const r = new MemberRegistry();
    const internal = castLib("internal");
    const fuse = castLib("fuse_client");
    const m1 = { name: "dup", number: 1 };
    const m2 = { name: "dup", number: 0 };
    r.register(internal, m1);
    r.register(fuse, m2);
    const movie = { castLibs: [internal, fuse] };
    expect(r.lookupByNameInMovie(movie, "dup")).toBe(m1);
  });

  it("unregisterAll cleans up incl. the cross-castLib name list", () => {
    const r = new MemberRegistry();
    const internal = castLib("internal");
    const fuse = castLib("fuse");
    const m1 = { name: "shared", number: 1 };
    const m2 = { name: "shared", number: 1 };
    r.register(internal, m1);
    r.register(fuse, m2);
    r.unregisterAll(internal);
    expect(r.lookupByNumber("internal", 1)).toBeNull();
    expect(r.lookupByNameInCastLib("internal", "shared")).toBeNull();
    const movie = { castLibs: [internal] };
    expect(r.lookupByNameInMovie(movie, "shared")).toBeNull();
  });
});