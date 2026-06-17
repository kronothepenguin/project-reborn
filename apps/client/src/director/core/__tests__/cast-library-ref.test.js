import { describe, it, expect, beforeEach } from "vitest";
import { CastLibraryRef } from "../cast-library-ref.js";

describe("CastLibraryRef", () => {
  beforeEach(() => {
    CastLibraryRef._reset();
  });

  describe("constructor", () => {
    it("creates instance with default values", () => {
      const castLib = new CastLibraryRef();
      expect(castLib).toBeInstanceOf(CastLibraryRef);
      expect(castLib.name).toBe("");
      expect(castLib.number).toBe(0);
    });

    it("creates instance with provided values", () => {
      const castLib = new CastLibraryRef({ number: 2, name: "External" });
      expect(castLib.name).toBe("External");
      expect(castLib.number).toBe(2);
    });

    it("sets castLibNum from castLibNum option", () => {
      const castLib = new CastLibraryRef({ number: 2, castLibNum: 3 });
      expect(castLib.castLibNum).toBe(3);
    });

    it("defaults castLibNum to number", () => {
      const castLib = new CastLibraryRef({ number: 5 });
      expect(castLib.castLibNum).toBe(5);
    });
  });

  describe("name property (read-write)", () => {
    it("gets name", () => {
      const castLib = new CastLibraryRef({ name: "Test" });
      expect(castLib.name).toBe("Test");
    });

    it("sets name", () => {
      const castLib = new CastLibraryRef({ name: "Old" });
      castLib.name = "New";
      expect(castLib.name).toBe("New");
    });
  });

  describe("number property (read-only)", () => {
    it("gets number", () => {
      const castLib = new CastLibraryRef({ number: 3 });
      expect(castLib.number).toBe(3);
    });

    it("cannot set number", () => {
      const castLib = new CastLibraryRef({ number: 3 });
      expect(() => {
        castLib.number = 5;
      }).toThrow();
    });
  });

  describe("member property (indexed registry, read-only)", () => {
    let castLib;

    beforeEach(() => {
      castLib = new CastLibraryRef({ number: 1, name: "Internal" });
    });

    it("member is accessible", () => {
      expect(castLib.member).toBeDefined();
    });

    it("returns null for empty member access", () => {
      expect(castLib.member[1]).toBeNull();
      expect(castLib.member["nonexistent"]).toBeNull();
    });

    it("accesses member by number after adding", () => {
      const mockMember = { name: "myBitmap", number: 1 };
      castLib._addMember(mockMember);
      expect(castLib.member[1]).toBe(mockMember);
    });

    it("accesses member by name after adding", () => {
      const mockMember = { name: "myBitmap", number: 1 };
      castLib._addMember(mockMember);
      expect(castLib.member["myBitmap"]).toBe(mockMember);
    });

    it("accesses second member by number", () => {
      const member1 = { name: "first", number: 1 };
      const member2 = { name: "second", number: 2 };
      castLib._addMember(member1);
      castLib._addMember(member2);
      expect(castLib.member[2]).toBe(member2);
    });

    it("cannot set member directly", () => {
      expect(() => {
        castLib.member[1] = {};
      }).toThrow();
    });

    it("supports has check by number", () => {
      const mockMember = { name: "test", number: 1 };
      castLib._addMember(mockMember);
      expect(1 in castLib.member).toBe(true);
      expect(2 in castLib.member).toBe(false);
    });

    it("supports has check by name", () => {
      const mockMember = { name: "test", number: 1 };
      castLib._addMember(mockMember);
      expect("test" in castLib.member).toBe(true);
      expect("nonexistent" in castLib.member).toBe(false);
    });
  });

  describe("fileName property (read-write)", () => {
    it("defaults to empty string", () => {
      const castLib = new CastLibraryRef();
      expect(castLib.fileName).toBe("");
    });

    it("sets fileName", () => {
      const castLib = new CastLibraryRef();
      castLib.fileName = "external.cst";
      expect(castLib.fileName).toBe("external.cst");
    });

    it("sets fileName with path", () => {
      const castLib = new CastLibraryRef();
      castLib.fileName = "/path/to/Content.cst";
      expect(castLib.fileName).toBe("/path/to/Content.cst");
    });
  });

  describe("preLoadMode property (read-write)", () => {
    it("defaults to 0", () => {
      const castLib = new CastLibraryRef();
      expect(castLib.preLoadMode).toBe(0);
    });

    it("sets preLoadMode to 1", () => {
      const castLib = new CastLibraryRef();
      castLib.preLoadMode = 1;
      expect(castLib.preLoadMode).toBe(1);
    });

    it("sets preLoadMode to 2", () => {
      const castLib = new CastLibraryRef();
      castLib.preLoadMode = 2;
      expect(castLib.preLoadMode).toBe(2);
    });

    it("throws on invalid preLoadMode", () => {
      const castLib = new CastLibraryRef();
      expect(() => {
        castLib.preLoadMode = 3;
      }).toThrow(RangeError);
    });

    it("throws on negative preLoadMode", () => {
      const castLib = new CastLibraryRef();
      expect(() => {
        castLib.preLoadMode = -1;
      }).toThrow(RangeError);
    });
  });

  describe("castMemberList property", () => {
    it("defaults to empty array", () => {
      const castLib = new CastLibraryRef();
      expect(castLib.castMemberList).toEqual([]);
    });

    it("sets castMemberList", () => {
      const castLib = new CastLibraryRef();
      const members = [{ name: "m1" }, { name: "m2" }];
      castLib.castMemberList = members;
      expect(castLib.castMemberList).toBe(members);
    });

    it("sets to empty array if not array", () => {
      const castLib = new CastLibraryRef();
      castLib.castMemberList = "not an array";
      expect(castLib.castMemberList).toEqual([]);
    });
  });

  describe("castLibNum property (read-only)", () => {
    it("gets castLibNum", () => {
      const castLib = new CastLibraryRef({ number: 2, castLibNum: 3 });
      expect(castLib.castLibNum).toBe(3);
    });

    it("cannot set castLibNum", () => {
      const castLib = new CastLibraryRef({ number: 2 });
      expect(() => {
        castLib.castLibNum = 5;
      }).toThrow();
    });
  });

  describe("broadcastProps property (read-write)", () => {
    it("defaults to true", () => {
      const castLib = new CastLibraryRef();
      expect(castLib.broadcastProps).toBe(true);
    });

    it("sets broadcastProps to false", () => {
      const castLib = new CastLibraryRef();
      castLib.broadcastProps = false;
      expect(castLib.broadcastProps).toBe(false);
    });

    it("sets broadcastProps to true", () => {
      const castLib = new CastLibraryRef();
      castLib.broadcastProps = false;
      castLib.broadcastProps = true;
      expect(castLib.broadcastProps).toBe(true);
    });

    it("coerces truthy values to boolean", () => {
      const castLib = new CastLibraryRef();
      castLib.broadcastProps = 0;
      expect(castLib.broadcastProps).toBe(false);
      castLib.broadcastProps = 1;
      expect(castLib.broadcastProps).toBe(true);
    });
  });

  describe("activeCastLib (static)", () => {
    it("defaults to 1", () => {
      expect(CastLibraryRef.activeCastLib).toBe(1);
    });

    it("sets activeCastLib", () => {
      CastLibraryRef.activeCastLib = 3;
      expect(CastLibraryRef.activeCastLib).toBe(3);
    });

    it("resets with _reset", () => {
      CastLibraryRef.activeCastLib = 5;
      CastLibraryRef._reset();
      expect(CastLibraryRef.activeCastLib).toBe(1);
    });
  });

  describe("castLib (static indexed registry)", () => {
    it("returns null for empty registry", () => {
      expect(CastLibraryRef.castLib[1]).toBeNull();
      expect(CastLibraryRef.castLib["nonexistent"]).toBeNull();
    });

    it("accesses registered cast library by number", () => {
      const castLib = new CastLibraryRef({ number: 1, name: "Internal" });
      CastLibraryRef._register(castLib);
      expect(CastLibraryRef.castLib[1]).toBe(castLib);
    });

    it("accesses registered cast library by name", () => {
      const castLib = new CastLibraryRef({ number: 1, name: "Internal" });
      CastLibraryRef._register(castLib);
      expect(CastLibraryRef.castLib["Internal"]).toBe(castLib);
    });

    it("accesses second registered cast library", () => {
      const castLib1 = new CastLibraryRef({ number: 1, name: "Internal" });
      const castLib2 = new CastLibraryRef({ number: 2, name: "External" });
      CastLibraryRef._register(castLib1);
      CastLibraryRef._register(castLib2);
      expect(CastLibraryRef.castLib[2]).toBe(castLib2);
      expect(CastLibraryRef.castLib["External"]).toBe(castLib2);
    });

    it("cannot set castLib directly", () => {
      expect(() => {
        CastLibraryRef.castLib[1] = {};
      }).toThrow();
    });

    it("supports has check by number", () => {
      const castLib = new CastLibraryRef({ number: 1, name: "Test" });
      CastLibraryRef._register(castLib);
      expect(1 in CastLibraryRef.castLib).toBe(true);
      expect(2 in CastLibraryRef.castLib).toBe(false);
    });

    it("supports has check by name", () => {
      const castLib = new CastLibraryRef({ number: 1, name: "Test" });
      CastLibraryRef._register(castLib);
      expect("Test" in CastLibraryRef.castLib).toBe(true);
      expect("nonexistent" in CastLibraryRef.castLib).toBe(false);
    });

    it("unregisters cast library", () => {
      const castLib = new CastLibraryRef({ number: 1, name: "Test" });
      CastLibraryRef._register(castLib);
      expect(CastLibraryRef.castLib[1]).toBe(castLib);
      CastLibraryRef._unregister(castLib);
      expect(CastLibraryRef.castLib[1]).toBeNull();
    });

    it("resets with _reset", () => {
      const castLib = new CastLibraryRef({ number: 1, name: "Test" });
      CastLibraryRef._register(castLib);
      CastLibraryRef._reset();
      expect(CastLibraryRef.castLib[1]).toBeNull();
    });
  });
});
