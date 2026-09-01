import { describe, it, expect, beforeEach, vi } from "vitest";
import { loadCast } from "../cast-loader.js";
import { CastLibraryObject } from "../../objects/cast-library.js";

describe("cast-loader", () => {
  beforeEach(() => {
    CastLibraryObject._reset();
    vi.resetModules();
  });

  it("loads a cast module returning a CastLibraryObject", async () => {
    vi.doMock("/casts/sample.js", () => ({
      default: { name: "sample", members: [] },
    }));

    const result = await loadCast("/casts/sample.js");
    expect(result).toBeInstanceOf(CastLibraryObject);
    expect(result.name).toBe("sample");
  });

  it("registers the cast library in CastLibraryObject.castLib", async () => {
    vi.doMock("/casts/reg.js", () => ({
      default: { name: "reg", members: [] },
    }));

    const cast = await loadCast("/casts/reg.js");
    expect(CastLibraryObject.castLib[cast.name]).toBe(cast);
  });

  it("accepts a CastLibraryObject instance as the default export", async () => {
    const ref = new CastLibraryObject({ name: "preset", number: 1 });
    vi.doMock("/casts/preset.js", () => ({ default: ref }));

    const result = await loadCast("/casts/preset.js");
    expect(result).toBe(ref);
  });

  it("accepts a factory function as the default export", async () => {
    const ref = new CastLibraryObject({ name: "factory", number: 2 });
    vi.doMock("/casts/factory.js", () => ({
      default: () => ref,
    }));

    const result = await loadCast("/casts/factory.js");
    expect(result).toBe(ref);
  });

  it("falls back to URL basename when no name is provided", async () => {
    vi.doMock("/casts/anon.js", () => ({ default: {} }));

    const result = await loadCast("/casts/anon.js");
    expect(result).toBeInstanceOf(CastLibraryObject);
    expect(result.name).toBe("anon");
  });

  it("throws and logs when the URL is invalid", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(loadCast("")).rejects.toThrow(TypeError);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("rejects when dynamic import fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.doMock("/casts/broken.js", () => {
      throw new Error("network");
    });
    await expect(loadCast("/casts/broken.js")).rejects.toThrow();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
