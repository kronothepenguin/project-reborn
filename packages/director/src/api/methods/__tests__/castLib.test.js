import { describe, it, expect, beforeEach } from "vitest";
import { castLib } from "../castLib.js";
import { CastLibraryObject } from "../../objects/cast-library.js";

describe("castLib", () => {
  beforeEach(() => {
    CastLibraryObject._reset();
  });

  it("is exported as a function", () => {
    expect(typeof castLib).toBe("function");
  });

  it("returns null when no cast library exists", () => {
    expect(castLib(1)).toBeNull();
  });

  it("accesses cast library by number (1-based)", () => {
    const lib1 = new CastLibraryObject({ number: 1, name: "Internal" });
    const lib2 = new CastLibraryObject({ number: 2, name: "Transportation" });
    CastLibraryObject._register(lib1);
    CastLibraryObject._register(lib2);
    expect(castLib(2)).toBe(lib2);
    expect(castLib(2).name).toBe("Transportation");
  });

  it("accesses cast library by name", () => {
    const lib = new CastLibraryObject({ number: 1, name: "Internal" });
    CastLibraryObject._register(lib);
    expect(castLib("Internal")).toBe(lib);
  });

  it("returns null for unknown name", () => {
    const lib = new CastLibraryObject({ number: 1, name: "Internal" });
    CastLibraryObject._register(lib);
    expect(castLib("Missing")).toBeNull();
  });

  it("returns null for out-of-range number", () => {
    const lib = new CastLibraryObject({ number: 1, name: "Internal" });
    CastLibraryObject._register(lib);
    expect(castLib(99)).toBeNull();
  });
});
