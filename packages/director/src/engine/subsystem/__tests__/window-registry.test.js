import { describe, it, expect, beforeEach } from "vitest";
import { WindowRegistry } from "../window-registry.js";

function makeWin(name) {
  return { name };
}

describe("WindowRegistry", () => {
  let registry;
  beforeEach(() => {
    registry = new WindowRegistry();
  });

  describe("register / lookup", () => {
    it("registers a window by name and returns it via lookup", () => {
      const w = makeWin("main");
      registry.register(w);
      expect(registry.lookup("main")).toBe(w);
    });

    it("returns null for an unknown name", () => {
      expect(registry.lookup("missing")).toBeNull();
    });

    it("does not require a name (anonymous windows are still tracked in order)", () => {
      const w = makeWin("");
      registry.register(w);
      expect(registry.list()).toContain(w);
      expect(registry.lookup("")).toBeNull();
    });

    it("registering the same window twice is idempotent", () => {
      const w = makeWin("main");
      registry.register(w);
      registry.register(w);
      expect(registry.list()).toHaveLength(1);
    });
  });

  describe("list / frontWindow", () => {
    it("list returns a snapshot in registration (z-order) order", () => {
      const a = makeWin("a");
      const b = makeWin("b");
      registry.register(a);
      registry.register(b);
      expect(registry.list()).toEqual([a, b]);
    });

    it("list returns a copy — mutating does not affect the registry", () => {
      registry.register(makeWin("a"));
      const snap = registry.list();
      snap.push(makeWin("evil"));
      expect(registry.list()).toHaveLength(1);
    });

    it("frontWindow returns the front of the z-order (last registered)", () => {
      const a = makeWin("a");
      const b = makeWin("b");
      registry.register(a);
      registry.register(b);
      expect(registry.frontWindow()).toBe(b);
    });

    it("frontWindow returns null when no windows are registered (FR-036 — MIAW deferred)", () => {
      expect(registry.frontWindow()).toBeNull();
    });
  });

  describe("moveToFront / moveToBack", () => {
    it("moveToFront pushes the window to the front of the z-order", () => {
      const a = makeWin("a");
      const b = makeWin("b");
      const c = makeWin("c");
      registry.register(a);
      registry.register(b);
      registry.register(c);
      registry.moveToFront(a);
      expect(registry.list()).toEqual([b, c, a]);
      expect(registry.frontWindow()).toBe(a);
    });

    it("moveToBack pushes the window to the back", () => {
      const a = makeWin("a");
      const b = makeWin("b");
      registry.register(a);
      registry.register(b);
      registry.moveToBack(b);
      expect(registry.list()).toEqual([b, a]);
    });

    it("moving an unregistered window is a noop", () => {
      registry.register(makeWin("a"));
      const stranger = makeWin("stranger");
      registry.moveToFront(stranger);
      expect(registry.list()).toHaveLength(1);
    });
  });

  describe("unregister", () => {
    it("drops the window from the z-order and the name index", () => {
      const a = makeWin("a");
      const b = makeWin("b");
      registry.register(a);
      registry.register(b);
      registry.unregister(a);
      expect(registry.lookup("a")).toBeNull();
      expect(registry.list()).toEqual([b]);
    });

    it("does not drop a different window that shares a name", () => {
      const a1 = makeWin("x");
      const a2 = makeWin("x");
      registry.register(a1);
      registry.register(a2); // overwrites the name index — last write wins
      registry.unregister(a2);
      expect(registry.lookup("x")).toBeNull(); // both dropped from name index
      expect(registry.list()).toEqual([a1]);
    });
  });

  describe("reset", () => {
    it("drops everything", () => {
      registry.register(makeWin("a"));
      registry.register(makeWin("b"));
      registry.reset();
      expect(registry.list()).toEqual([]);
      expect(registry.frontWindow()).toBeNull();
    });
  });
});