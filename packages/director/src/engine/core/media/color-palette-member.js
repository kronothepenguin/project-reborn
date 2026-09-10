import { MemberObject } from "../member.js";

/**
 * Color Palette cast member (Chapter 6: Media Types — "Color Palette").
 *
 * Represents the color palette associated with a bitmap cast member.
 * A color palette cast member does not have any methods or properties that can be accessed
 * directly from it. The following methods and properties are merely associated with color
 * palettes.
 *
 * You can add a color palette cast member to a movie by using the Movie object's newMember()
 * method.
 *
 * You can associate a bitmap cast member with a color palette cast member by setting the
 * palette property of the bitmap cast member.
 *
 * Method summary: `color()`.
 * Property summary: `palette`, `paletteMapping` (and Bitmap's `depth`).
 *
 * See also: Bitmap, Member, palette.
 */
export class ColorPaletteMember extends MemberObject {
  /**
   * Bitmap, color palette, and background color property; determines the color depth, in bits,
   * of a bitmap or color palette cast member. Read-only.
   * The value is 1, 2, 4, 8, 16, or 32 bits, depending on the type of the cast member.
   */
  depth = 8;

  /**
   * Member property; determines the color palette used by the cast member. Read/write.
   * The value of the palette property reflects the number of the color palette cast member.
   */
  palette = 0;

  /**
   * Bitmap cast member property; determines the mapping type used when a bitmap is mapped to
   * a palette. Read/write.
   * The possible values are #bestColors and #casePalette.
   */
  paletteMapping = Symbol.for("casePalette");

  /**
   * Function; returns the color at the specified index position in a color palette, expressed
   * as a Color object. The index value must be a number between 0 and 255 for 8-bit color and
   * between 0 and 15 for 4-bit color.
   *
   * @param {number} index Required. A number that specifies the position in the palette.
   * @returns {object|null}
   */
  color(index) {
    // TODO(subsystems): resolve through the member's color palette data (010 D2: palette
    // data stays in payload; no palette model yet).
    return index === undefined ? null : null;
  }
}