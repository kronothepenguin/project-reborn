// Color data type (Director MX 2004 Scripting Reference — color()).
// Verbatim JSDoc quoted from docs/drmx2004_scripting_ref/methods.txt (color()).
//
// Color is the explicit exception to the "plain public field" canon (T005):
// the docs define RGB clamping ("Valid values range from 0 to 255. All other
// values are truncated"), so clamping is kept in setters. Backing storage uses
// underscore-prefixed plain fields (no `#` private syntax — FR-013).

function clampChannel(value) {
  const n = Math.trunc(value);
  if (n < 0) return 0;
  if (n > 255) return 255;
  return n;
}

// 8-bit palettes (006 C5). The default runtime palette = Web-safe 216 + the
// gray ramp (a deterministic 256-entry palette). Built-in Director palettes
// are indicated by symbols (#systemMac, #rainbow, and so on) per paletteRef.
function buildWebSafePalette() {
  const pal = [];
  for (let r = 0; r < 6; r++) {
    for (let g = 0; g < 6; g++) {
      for (let b = 0; b < 6; b++) {
        pal.push([r * 51, g * 51, b * 51]);
      }
    }
  }
  for (let i = 0; i < 40; i++) {
    const v = Math.round((i / 39) * 255);
    pal.push([v, v, v]);
  }
  return pal;
}

export const PALETTES = {
  default: buildWebSafePalette(),
  grayscale: Array.from({ length: 256 }, (_, i) => [i, i, i]),
  [Symbol.for("rainbow")]: buildWebSafePalette(),
  [Symbol.for("systemMac")]: buildWebSafePalette(),
  [Symbol.for("systemWin")]: buildWebSafePalette(),
  [Symbol.for("grayscale")]: Array.from({ length: 256 }, (_, i) => [i, i, i]),
};

function paletteFor(paletteRef) {
  if (paletteRef == null || typeof paletteRef === "symbol") {
    return PALETTES[paletteRef ?? Symbol.for("rainbow")] ?? PALETTES.default;
  }
  // a cast-member palette resolves through the movie (008); v1 = default
  return PALETTES.default;
}

export class Color {
  _red = 0;
  _green = 0;
  _blue = 0;
  _paletteIndex = undefined;

  /**
   * Top level function and data type. Returns a Color data object using either
   * RGB or 8-bit palette index values. The resulting color object can be
   * applied to cast members, sprites, and the Stage where appropriate.
   *
   * Valid values for each channel range from 0 to 255; all other values are
   * truncated.
   *
   * @param {number} [red=0]   An integer that specifies the red color component. Valid values range from 0 to 255. All other values are truncated.
   * @param {number} [green=0] An integer that specifies the green color component. Valid values range from 0 to 255. All other values are truncated.
   * @param {number} [blue=0]  An integer that specifies the blue color component. Valid values range from 0 to 255. All other values are truncated.
   */
  constructor(red = 0, green = 0, blue = 0) {
    this._red = clampChannel(red);
    this._green = clampChannel(green);
    this._blue = clampChannel(blue);
  }

  /**
   * The 8-bit palette index this color was created from (palette form), if any.
   * Undefined for the RGB form.
   */
  get paletteIndex() {
    return this._paletteIndex;
  }

  /**
   * Red color component. An integer 0–255; all other values are truncated.
   * Read/write.
   */
  get red() {
    return this._red;
  }
  set red(value) {
    this._red = clampChannel(value);
    this._paletteIndex = undefined;
  }

  /**
   * Green color component. An integer 0–255; all other values are truncated.
   * Read/write.
   */
  get green() {
    return this._green;
  }
  set green(value) {
    this._green = clampChannel(value);
    this._paletteIndex = undefined;
  }

  /**
   * Blue color component. An integer 0–255; all other values are truncated.
   * Read/write.
   */
  get blue() {
    return this._blue;
  }
  set blue(value) {
    this._blue = clampChannel(value);
    this._paletteIndex = undefined;
  }
}

/**
 * color(intPaletteIndex)
 * color(intRed, intGreen, intBlue)
 *
 * Top level function and data type. Returns a Color data object using either
 * RGB or 8-bit palette index values. The resulting color object can be applied
 * to cast members, sprites, and the Stage where appropriate.
 *
 * @param {number} [red]
 * @param {number} [green]
 * @param {number} [blue]
 * @returns {Color}
 */
export function color(red, green, blue) {
  if (arguments.length === 1) {
    const idx = clampChannel(red);
    const pal = paletteFor(undefined);
    const [r, g, b] = pal[idx];
    const c = new Color(r, g, b);
    c._paletteIndex = idx;
    return c;
  }
  return new Color(red, green, blue);
}