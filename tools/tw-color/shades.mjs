import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseColor, toOklab, toOklch } from "./color.mjs";

// The stylesheet of new shades every app imports.
export const SHADES = fileURLToPath(
  new URL(
    "../../packages/components/src/styles/shades.css",
    import.meta.url,
  ),
);

const SHADE = /--color-([a-z]+-\d+)\s*:\s*(#[0-9a-f]{3,8})\s*;/gi;

const EMPTY = `/* Holo's colours that Tailwind's palette lacks, as new shades of its families.
   tools/tw-color proposes and writes them. */
@theme {
}
`;

// The swatches of a stylesheet's new shades, in the shape of palette.mjs.
export function parseShades(text) {
  const swatches = [];
  for (const [, name, hex] of text.matchAll(SHADE)) {
    const color = parseColor(hex);
    if (color === null) continue;
    const { l, c, h } = toOklch(toOklab(color));
    swatches.push({ name, l, c, h });
  }
  return swatches;
}

export function readShades(path) {
  if (!existsSync(path)) return [];
  return parseShades(readFileSync(path, "utf8"));
}

// The stylesheet with the shade added at the end of its @theme block.
export function addShade(text, name, hex, note) {
  const source = text === "" ? EMPTY : text;
  const end = source.lastIndexOf("}");
  if (end < 0) throw new Error("the stylesheet has no @theme block");
  const comment = note ? `  /* ${note} */\n` : "";
  const line = `  --color-${name}: ${hex};\n`;
  return source.slice(0, end) + comment + line + source.slice(end);
}

export function writeShade(path, name, hex, note) {
  const text = existsSync(path) ? readFileSync(path, "utf8") : "";
  writeFileSync(path, addShade(text, name, hex, note));
}
