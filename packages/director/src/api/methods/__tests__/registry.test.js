import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { METHODS_OWNERS, OWNER_CATEGORIES, ownerOf } from "../registry.js";

const INTERNAL = new Set(["registry"]);
const dir = path.dirname(fileURLToPath(import.meta.url));
const files = readdirSync(path.join(dir, ".."))
  .filter((f) => f.endsWith(".js") && !INTERNAL.has(f.slice(0, -3)))
  .map((f) => f.slice(0, -3))
  .sort();

const EXPECTED_KEYS = Object.keys(METHODS_OWNERS).sort();

describe("api/methods ownership registry (006 C2)", () => {
  it("registry has an entry for every method file (minus internal)", () => {
    expect(EXPECTED_KEYS.sort()).toEqual(files);
  });

  it("every registry owner is a valid category", () => {
    for (const v of Object.values(METHODS_OWNERS)) {
      expect(OWNER_CATEGORIES).toContain(v);
    }
  });

  it("every method file carries a matching `// @owner` header", () => {
    for (const f of files) {
      const src = readFileSync(path.join(dir, "..", `${f}.js`), "utf8");
      const m = src.match(/^\/\/\s*@owner\s+([A-Za-z]+)/m);
      expect(m, `${f}.js missing @owner header`).not.toBeNull();
      expect(m[1], `${f}.js @owner mismatch`).toBe(ownerOf(f));
    }
  });
});