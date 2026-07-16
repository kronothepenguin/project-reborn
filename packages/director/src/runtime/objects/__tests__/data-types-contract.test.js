import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import * as objectsIndex from "../index.js";

const here = dirname(fileURLToPath(import.meta.url));
const objectsDir = resolve(here, "..");
const typesDir = resolve(here, "../../types");

const VALUE_TYPE_FILES = ["list.js", "prop-list.js", "point.js", "rect.js", "color.js"];

function readDirSafe(dir) {
  try {
    return statSync(dir).isDirectory() ? readdirSync(dir) : [];
  } catch {
    return [];
  }
}

describe("value-type file location", () => {
  it("keeps list.js, prop-list.js, point.js, rect.js, color.js under src/runtime/types/", () => {
    const entries = readDirSafe(typesDir);
    for (const f of VALUE_TYPE_FILES) {
      expect(entries).toContain(f);
    }
  });

  it("does not contain any of the value-type files directly under src/runtime/objects/", () => {
    const objEntries = readDirSafe(objectsDir);
    for (const f of VALUE_TYPE_FILES) {
      expect(objEntries).not.toContain(f);
    }
  });

  it("keeps the value-type exports reachable from src/runtime/objects/index.js", () => {
    expect(typeof objectsIndex.List).toBe("function");
    expect(typeof objectsIndex.PropList).toBe("function");
    expect(typeof objectsIndex.Point).toBe("function");
    expect(typeof objectsIndex.Rect).toBe("function");
    expect(typeof objectsIndex.Color).toBe("function");
  });
});

describe("no Vector type in director-runtime", () => {
  it("does not export a Vector class or 3D vector type from src/runtime/objects/index.js", () => {
    const exportNames = Object.keys(objectsIndex);
    expect(exportNames).not.toContain("Vector");
    expect(exportNames).not.toContain("vector");
    expect(exportNames).not.toContain("Vector3");
  });

  it("does not define a Vector class in any src/runtime/objects/ source file", () => {
    const entries = readDirSafe(objectsDir);
    for (const entry of entries) {
      if (!entry.endsWith(".js")) continue;
      const contents = readFileSync(join(objectsDir, entry), "utf8");
      expect(contents).not.toMatch(/\bclass\s+Vector\b/);
      expect(contents).not.toMatch(/\bclass\s+Vector3\b/);
    }
  });

  it("does not define an exported `vector` factory in any src/runtime/objects/ source file", () => {
    const entries = readDirSafe(objectsDir);
    for (const entry of entries) {
      if (!entry.endsWith(".js")) continue;
      const contents = readFileSync(join(objectsDir, entry), "utf8");
      expect(contents).not.toMatch(/export\s+function\s+vector\s*\(/);
    }
  });
});
