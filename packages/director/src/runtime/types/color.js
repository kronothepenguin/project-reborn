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

function toHex2(n) {
  const s = n.toString(16);
  return s.length === 1 ? "0" + s : s;
}

export class Color {
  _red = 0;
  _green = 0;
  _blue = 0;

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
   * Red color component. An integer 0–255; all other values are truncated.
   * Read/write.
   */
  get red() {
    return this._red;
  }
  set red(value) {
    this._red = clampChannel(value);
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
  }

  /**
   * Hex string form of the color, e.g. "#ff0000". Read-only convenience derived
   * from the red, green, and blue channels.
   */
  get hex() {
    return "#" + toHex2(this._red) + toHex2(this._green) + toHex2(this._blue);
  }

  /**
   * CSS rgb() string form of the color, e.g. "rgb(255, 0, 0)". Read-only
   * convenience derived from the red, green, and blue channels.
   */
  get rgb() {
    return `rgb(${this._red}, ${this._green}, ${this._blue})`;
  }

  /**
   * Returns TRUE if the passed object is a Color object whose RGB channels are
   * equal to this one's, or a plain object with matching red/green/blue
   * components; otherwise FALSE.
   *
   * @param {*} other
   * @returns {boolean}
   */
  equals(other) {
    if (other == null) return false;
    if (other instanceof Color) {
      return (
        this._red === other._red &&
        this._green === other._green &&
        this._blue === other._blue
      );
    }
    if (typeof other === "object") {
      const r = other.red ?? other.r;
      const g = other.green ?? other.g;
      const b = other.blue ?? other.b;
      if (typeof r === "number" && typeof g === "number" && typeof b === "number") {
        return this._red === r && this._green === g && this._blue === b;
      }
    }
    return false;
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
  return new Color(red, green, blue);
}