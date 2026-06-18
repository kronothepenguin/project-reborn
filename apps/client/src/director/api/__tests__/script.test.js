import { describe, it, expect, beforeEach } from "vitest";
import { script } from "../script.js";
import { CastLibraryRef } from "../../core/cast-library-ref.js";
import { MemberRef } from "../../core/member-ref.js";

describe("script", () => {
  beforeEach(() => {
    CastLibraryRef._reset();
  });

  function addScriptMember(name) {
    const lib = new CastLibraryRef({ number: 1, name: "Internal" });
    CastLibraryRef._register(lib);
    const m = new MemberRef(Symbol.for("script"), name);
    m._setNumber(1);
    m._setCastLibNum(1);
    lib._addMember(m);
    return m;
  }

  it("is exported as a function", () => {
    expect(typeof script).toBe("function");
  });

  it("returns a script member by name", () => {
    const m = addScriptMember("Actions");
    expect(script("Actions")).toBe(m);
  });

  it("returns a script member by number", () => {
    const m = addScriptMember("Actions");
    expect(script(1)).toBe(m);
  });

  it("returns null when member is not a script", () => {
    const lib = new CastLibraryRef({ number: 1, name: "Internal" });
    CastLibraryRef._register(lib);
    const m = new MemberRef(Symbol.for("bitmap"), "Pic");
    m._setNumber(1);
    m._setCastLibNum(1);
    lib._addMember(m);
    expect(script("Pic")).toBeNull();
  });

  it("returns null when member does not exist", () => {
    const lib = new CastLibraryRef({ number: 1, name: "Internal" });
    CastLibraryRef._register(lib);
    expect(script("Ghost")).toBeNull();
  });

  it("matches spec example shape (actionMember = script('Actions'))", () => {
    const m = addScriptMember("Actions");
    const actionMember = script("Actions");
    expect(actionMember).toBe(m);
    expect(actionMember.type).toBe(Symbol.for("script"));
  });
});
