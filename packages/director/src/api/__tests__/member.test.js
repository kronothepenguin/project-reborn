import { describe, it, expect, beforeEach } from "vitest";
import { member } from "../member.js";
import { CastLibraryRef } from "../../core/cast-library-ref.js";
import { MemberRef } from "../../core/member-ref.js";

describe("member", () => {
  beforeEach(() => {
    CastLibraryRef._reset();
  });

  function setupLib(name, count) {
    const lib = new CastLibraryRef({ number: 1, name });
    CastLibraryRef._register(lib);
    for (let i = 0; i < count; i++) {
      const m = new MemberRef(Symbol.for("bitmap"), `name-${i + 1}`);
      m._setNumber(i + 1);
      m._setCastLibNum(1);
      lib._addMember(m);
    }
    return lib;
  }

  it("is exported as a function", () => {
    expect(typeof member).toBe("function");
  });

  it("returns null when no cast library exists", () => {
    expect(member(1)).toBeNull();
  });

  it("accesses member by number (1-based)", () => {
    const lib = setupLib("Internal", 3);
    const m = member(2);
    expect(m).toBe(lib.member[2]);
    expect(m.name).toBe("name-2");
  });

  it("accesses member by name", () => {
    const lib = setupLib("Internal", 3);
    const m = member("name-3");
    expect(m).toBe(lib.member["name-3"]);
  });

  it("returns null for unknown member name in default cast", () => {
    setupLib("Internal", 1);
    expect(member("missing")).toBeNull();
  });

  it("accesses from a specific cast library by number", () => {
    const lib1 = new CastLibraryRef({ number: 1, name: "Internal" });
    const lib2 = new CastLibraryRef({ number: 2, name: "Transportation" });
    CastLibraryRef._register(lib1);
    CastLibraryRef._register(lib2);
    const m = new MemberRef(Symbol.for("bitmap"), "Planes");
    m._setNumber(1);
    m._setCastLibNum(2);
    lib2._addMember(m);

    const found = member("Planes", 2);
    expect(found).toBe(m);
    expect(found.name).toBe("Planes");
  });

  it("searches all cast libraries when name not found in default", () => {
    const lib1 = new CastLibraryRef({ number: 1, name: "Internal" });
    const lib2 = new CastLibraryRef({ number: 2, name: "Transportation" });
    CastLibraryRef._register(lib1);
    CastLibraryRef._register(lib2);

    const m = new MemberRef(Symbol.for("bitmap"), "Planes");
    m._setNumber(1);
    m._setCastLibNum(2);
    lib2._addMember(m);

    const found = member("Planes");
    expect(found).toBe(m);
  });

  it("returns null when cast library number is out of range", () => {
    setupLib("Internal", 1);
    expect(member(1, 99)).toBeNull();
  });
});
