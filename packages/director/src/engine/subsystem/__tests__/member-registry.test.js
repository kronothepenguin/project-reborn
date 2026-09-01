import { describe, it, expect, beforeEach } from "vitest";
import { MemberRegistry } from "../member-registry.js";

// Lightweight fake members/castLibs for registry tests — the registry does
// not depend on any specific class shape; it only reads `castLib.name` /
// `member.name` / `member.number`.
function makeMember(name, number = 0) {
  return { name, number };
}
function makeCastLib(name) {
  return { name };
}

describe("MemberRegistry", () => {
  let registry;
  beforeEach(() => {
    registry = new MemberRegistry();
  });

  describe("register / lookupByNumber", () => {
    it("returns the member when registered by number", () => {
      const lib = makeCastLib("Internal");
      const m = makeMember("Intro", 1);
      registry.register(lib, m);
      expect(registry.lookupByNumber(lib, 1)).toBe(m);
    });

    it("auto-assigns a sequential member number when member.number is 0 (FR-017)", () => {
      const lib = makeCastLib("Internal");
      const a = makeMember("A", 0);
      const b = makeMember("B", 0);
      const c = makeMember("C", 0);
      registry.register(lib, a);
      registry.register(lib, b);
      registry.register(lib, c);
      expect(a.number).toBe(1);
      expect(b.number).toBe(2);
      expect(c.number).toBe(3);
    });

    it("preserves an explicit member number and bumps the per-castLib counter", () => {
      const lib = makeCastLib("Internal");
      const a = makeMember("A", 5);
      const b = makeMember("B", 0);
      registry.register(lib, a);
      registry.register(lib, b);
      expect(a.number).toBe(5);
      expect(b.number).toBe(6);
    });

    it("returns null for an unknown number", () => {
      registry.register(makeCastLib("Internal"), makeMember("A", 1));
      expect(registry.lookupByNumber("Internal", 99)).toBeNull();
    });

    it("returns null for an unknown castLib", () => {
      expect(registry.lookupByNumber("Missing", 1)).toBeNull();
    });

    it("accepts a string castLib key as well as a CastLibraryObject", () => {
      const m = makeMember("A", 1);
      registry.register("Internal", m);
      expect(registry.lookupByNumber("Internal", 1)).toBe(m);
    });
  });

  describe("lookupByNameInCastLib", () => {
    it("finds a member by name within a single castLib", () => {
      const lib = makeCastLib("Internal");
      const m = makeMember("Intro", 1);
      registry.register(lib, m);
      expect(registry.lookupByNameInCastLib(lib, "Intro")).toBe(m);
    });

    it("returns null when the name is not present in that castLib", () => {
      const lib = makeCastLib("Internal");
      registry.register(lib, makeMember("A", 1));
      expect(registry.lookupByNameInCastLib(lib, "B")).toBeNull();
    });

    it("does not cross-resolve a name registered in a different castLib", () => {
      const libA = makeCastLib("A");
      const libB = makeCastLib("B");
      registry.register(libA, makeMember("Shared", 1));
      registry.register(libB, makeMember("Other", 1));
      expect(registry.lookupByNameInCastLib(libB, "Shared")).toBeNull();
    });
  });

  describe("lookupByNameInMovie (FR-025)", () => {
    it("searches castLibs in declaration order and returns the first match", () => {
      const libA = makeCastLib("A");
      const libB = makeCastLib("B");
      const first = makeMember("Shared", 1);
      const second = makeMember("Shared", 1);
      registry.register(libA, first);
      registry.register(libB, second);

      const movie = { castLibs: [libA, libB] };
      expect(registry.lookupByNameInMovie(movie, "Shared")).toBe(first);
    });

    it("returns null when no castLib has the name", () => {
      const lib = makeCastLib("A");
      registry.register(lib, makeMember("Intro", 1));
      expect(registry.lookupByNameInMovie({ castLibs: [lib] }, "Missing")).toBeNull();
    });

    it("returns null when the movie is null or has no castLibs", () => {
      expect(registry.lookupByNameInMovie(null, "X")).toBeNull();
      expect(registry.lookupByNameInMovie({ castLibs: [] }, "X")).toBeNull();
    });
  });

  describe("unregisterAll", () => {
    it("drops every member of the given castLib", () => {
      const lib = makeCastLib("Internal");
      registry.register(lib, makeMember("A", 1));
      registry.register(lib, makeMember("B", 2));
      registry.unregisterAll(lib);
      expect(registry.lookupByNumber(lib, 1)).toBeNull();
      expect(registry.lookupByNumber(lib, 2)).toBeNull();
      expect(registry.lookupByNameInCastLib(lib, "A")).toBeNull();
    });

    it("leaves other castLibs intact", () => {
      const libA = makeCastLib("A");
      const libB = makeCastLib("B");
      registry.register(libA, makeMember("A", 1));
      registry.register(libB, makeMember("B", 1));
      registry.unregisterAll(libA);
      expect(registry.lookupByNumber(libB, 1)).not.toBeNull();
    });

    it("removes empty by-name-across-castLibs entries when the last member of a name is dropped", () => {
      const lib = makeCastLib("Internal");
      const m = makeMember("Solo", 1);
      registry.register(lib, m);
      registry.unregisterAll(lib);
      // re-registering the same name should start clean (no phantom entries)
      const m2 = makeMember("Solo", 1);
      registry.register(lib, m2);
      expect(registry.lookupByNameInCastLib(lib, "Solo")).toBe(m2);
    });
  });

  describe("cross-castLib numbering (per FR-017 — numbers are per-castLib)", () => {
    it("each castLib has its own sequential counter", () => {
      const libA = makeCastLib("A");
      const libB = makeCastLib("B");
      const a1 = makeMember("a1", 0);
      const b1 = makeMember("b1", 0);
      const a2 = makeMember("a2", 0);
      registry.register(libA, a1);
      registry.register(libB, b1);
      registry.register(libA, a2);
      expect(a1.number).toBe(1);
      expect(b1.number).toBe(1);
      expect(a2.number).toBe(2);
    });

    it("duplicate (castLib, number) registration overwrites the slot", () => {
      const lib = makeCastLib("Internal");
      const first = makeMember("A", 1);
      const second = makeMember("B", 1);
      registry.register(lib, first);
      registry.register(lib, second);
      expect(registry.lookupByNumber(lib, 1)).toBe(second);
    });
  });
});