import { describe, it, expect, beforeEach } from "vitest";
import { CastLibraryObject } from "../cast-library-object.js";

describe("CastLibraryObject", () => {
  beforeEach(() => {
    CastLibraryObject._reset();
  });

  describe("constructor", () => {
    it("creates instance with default values", () => {
      const castLib = new CastLibraryObject();
      expect(castLib).toBeInstanceOf(CastLibraryObject);
      expect(castLib.name).toBe("");
      expect(castLib.number).toBe(0);
    });

    it("creates instance with provided values", () => {
      const castLib = new CastLibraryObject({ number: 2, name: "External" });
      expect(castLib.name).toBe("External");
      expect(castLib.number).toBe(2);
    });

    it("sets castLibNum from castLibNum option", () => {
      const castLib = new CastLibraryObject({ number: 2, castLibNum: 3 });
      expect(castLib.castLibNum).toBe(3);
    });

    it("defaults castLibNum to number", () => {
      const castLib = new CastLibraryObject({ number: 5 });
      expect(castLib.castLibNum).toBe(5);
    });
  });

  describe("name (read-write)", () => {
    it("gets and sets name", () => {
      const castLib = new CastLibraryObject({ name: "Old" });
      castLib.name = "New";
      expect(castLib.name).toBe("New");
    });
  });

  describe("number (read-only)", () => {
    it("cannot set number", () => {
      const castLib = new CastLibraryObject({ number: 3 });
      expect(() => { castLib.number = 5; }).toThrow();
    });
  });

  describe("member (indexed registry)", () => {
    let castLib;
    beforeEach(() => {
      castLib = new CastLibraryObject({ number: 1, name: "Internal" });
    });

    it("returns null for empty access", () => {
      expect(castLib.member[1]).toBeNull();
      expect(castLib.member["x"]).toBeNull();
    });

    it("accesses by number after adding", () => {
      const m = { name: "myBitmap", number: 1 };
      castLib._addMember(m);
      expect(castLib.member[1]).toBe(m);
    });

    it("accesses by name after adding", () => {
      const m = { name: "myBitmap", number: 1 };
      castLib._addMember(m);
      expect(castLib.member["myBitmap"]).toBe(m);
    });

    it("cannot set member directly", () => {
      expect(() => { castLib.member[1] = {}; }).toThrow();
    });
  });

  describe("fileName (read-write)", () => {
    it("defaults to empty string", () => {
      expect(new CastLibraryObject().fileName).toBe("");
    });
    it("sets fileName", () => {
      const c = new CastLibraryObject();
      c.fileName = "external.cst";
      expect(c.fileName).toBe("external.cst");
    });
  });

  describe("preLoadMode (read-write)", () => {
    it("defaults to 0", () => expect(new CastLibraryObject().preLoadMode).toBe(0));
    it("accepts 0, 1, 2", () => {
      const c = new CastLibraryObject();
      [0, 1, 2].forEach((v) => { c.preLoadMode = v; expect(c.preLoadMode).toBe(v); });
    });
    it("throws on invalid value", () => {
      const c = new CastLibraryObject();
      expect(() => { c.preLoadMode = 3; }).toThrow(RangeError);
      expect(() => { c.preLoadMode = -1; }).toThrow(RangeError);
    });
  });

  describe("selection (read-write)", () => {
    it("defaults to null", () => expect(new CastLibraryObject().selection).toBeNull());
    it("sets selection", () => {
      const c = new CastLibraryObject();
      c.selection = "foo";
      expect(c.selection).toBe("foo");
    });
  });

  describe("castLibNum (read-only)", () => {
    it("cannot set castLibNum", () => {
      const c = new CastLibraryObject({ number: 2 });
      expect(() => { c.castLibNum = 5; }).toThrow();
    });
  });

  describe("broadcastProps (read-write)", () => {
    it("defaults to true and coerces", () => {
      const c = new CastLibraryObject();
      expect(c.broadcastProps).toBe(true);
      c.broadcastProps = 0;
      expect(c.broadcastProps).toBe(false);
      c.broadcastProps = 1;
      expect(c.broadcastProps).toBe(true);
    });
  });

  describe("findEmpty()", () => {
    it("returns 1 for empty member list", () => {
      const c = new CastLibraryObject();
      expect(c.findEmpty()).toBe(1);
    });
    it("returns next free slot", () => {
      const c = new CastLibraryObject();
      c._addMember({ number: 1 });
      c._addMember({ number: 3 });
      expect(c.findEmpty()).toBe(2);
    });
  });

  describe("activeCastLib (static)", () => {
    it("defaults to 1", () => expect(CastLibraryObject.activeCastLib).toBe(1));
    it("resets with _reset", () => {
      CastLibraryObject.activeCastLib = 5;
      CastLibraryObject._reset();
      expect(CastLibraryObject.activeCastLib).toBe(1);
    });
  });

  describe("castLib (static registry)", () => {
    it("returns null for empty registry", () => {
      expect(CastLibraryObject.castLib[1]).toBeNull();
    });
    it("accesses by number and name after register", () => {
      const c = new CastLibraryObject({ number: 1, name: "Internal" });
      CastLibraryObject._register(c);
      expect(CastLibraryObject.castLib[1]).toBe(c);
      expect(CastLibraryObject.castLib["Internal"]).toBe(c);
    });
    it("cannot set castLib directly", () => {
      expect(() => { CastLibraryObject.castLib[1] = {}; }).toThrow();
    });
    it("unregisters cast library", () => {
      const c = new CastLibraryObject({ number: 1, name: "Test" });
      CastLibraryObject._register(c);
      CastLibraryObject._unregister(c);
      expect(CastLibraryObject.castLib[1]).toBeNull();
    });
  });
});
