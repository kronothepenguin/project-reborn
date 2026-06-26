import { describe, it, expect, beforeEach } from "vitest";
import { castLib } from "../castLib.js";
import { CastLibraryRef } from "../../core/cast-library-ref.js";

describe("castLib", () => {
  beforeEach(() => {
    CastLibraryRef._reset();
  });

  it("is exported as a function", () => {
    expect(typeof castLib).toBe("function");
  });

  it("returns null when no cast library exists", () => {
    expect(castLib(1)).toBeNull();
  });

  it("accesses cast library by number (1-based)", () => {
    const lib = new CastLibraryRef({ number: 1, name: "Internal" });
    CastLibraryRef._register(lib);
    const lib2 = new CastLibraryRef({ number: 2, name: "Transportation" });
    CastLibraryRef._register(lib2);
    expect(castLib(2)).toBe(lib2);
    expect(castLib(2).name).toBe("Transportation");
  });

  it("accesses cast library by name", () => {
    const lib = new CastLibraryRef({ number: 1, name: "Internal" });
    CastLibraryRef._register(lib);
    expect(castLib("Internal")).toBe(lib);
  });

  it("returns null for unknown name", () => {
    const lib = new CastLibraryRef({ number: 1, name: "Internal" });
    CastLibraryRef._register(lib);
    expect(castLib("Missing")).toBeNull();
  });

  it("returns null for out-of-range number", () => {
    const lib = new CastLibraryRef({ number: 1, name: "Internal" });
    CastLibraryRef._register(lib);
    expect(castLib(99)).toBeNull();
  });
});
