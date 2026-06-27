import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import * as coreIndex from "../index.js";

const here = dirname(fileURLToPath(import.meta.url));
const coreDir = resolve(here, "..");
const runtimeDir = resolve(here, "../../runtime");

const VALUE_TYPE_FILES = ["list.js", "prop-list.js", "point.js", "rect.js", "color.js"];

function readDirSafe(dir) {
  try {
    return statSync(dir).isDirectory() ? readdirSync(dir) : [];
  } catch {
    return [];
  }
}

describe("value-type file location", () => {
  it("contains list.js, prop-list.js, point.js, rect.js, color.js under src/core/", () => {
    const entries = readDirSafe(coreDir);
    for (const f of VALUE_TYPE_FILES) {
      expect(entries).toContain(f);
    }
  });

  it("does not contain any of the value-type files under src/runtime/", () => {
    const runtimeEntries = readDirSafe(runtimeDir);
    for (const f of VALUE_TYPE_FILES) {
      expect(runtimeEntries).not.toContain(f);
    }
  });

  it("keeps the value-type exports reachable from src/core/index.js", () => {
    expect(typeof coreIndex.List).toBe("function");
    expect(typeof coreIndex.PropList).toBe("function");
    expect(typeof coreIndex.Point).toBe("function");
    expect(typeof coreIndex.Rect).toBe("function");
    expect(typeof coreIndex.Color).toBe("function");
  });
});

describe("no Vector type in director-core", () => {
  it("does not export a Vector class or 3D vector type from src/core/index.js", () => {
    const exportNames = Object.keys(coreIndex);
    expect(exportNames).not.toContain("Vector");
    expect(exportNames).not.toContain("vector");
    expect(exportNames).not.toContain("Vector3");
  });

  it("does not define a Vector class in any src/core/ source file", () => {
    const entries = readDirSafe(coreDir);
    for (const entry of entries) {
      if (!entry.endsWith(".js")) continue;
      const contents = readFileSync(join(coreDir, entry), "utf8");
      expect(contents).not.toMatch(/\bclass\s+Vector\b/);
      expect(contents).not.toMatch(/\bclass\s+Vector3\b/);
    }
  });

  it("does not define an exported `vector` factory in any src/core/ source file", () => {
    const entries = readDirSafe(coreDir);
    for (const entry of entries) {
      if (!entry.endsWith(".js")) continue;
      const contents = readFileSync(join(coreDir, entry), "utf8");
      expect(contents).not.toMatch(/export\s+function\s+vector\s*\(/);
    }
  });
});
