import { MemberObject } from "../member.js";

/**
 * Font cast member (Chapter 6: Media Types — "Font").
 *
 * Represents a font cast member.
 *
 * You can add a font cast member to a movie by using the Movie object's newMember() method.
 *
 * Property summary: `bitmapSizes`, `characterSet`, `fontStyle`, `originalFont`, `recordFont`.
 *
 * See also: Member.
 */
export class FontMember extends MemberObject {
  /**
   * Font cast member property; contains a list of point sizes at which the font was embedded
   * in the cast member. Read-only.
   */
  bitmapSizes = [];

  /**
   * Font cast member property; returns the character set of the cast member. Read/write.
   * Possible values are #mac, #system, and #unicode.
   */
  characterSet = Symbol.for("system");

  /**
   * Font cast member property; contains the style of the font cast member. Read-only.
   */
  fontStyle = "";

  /**
   * Font cast member property; contains the name of the font associated with the font cast
   * member. Read-only.
   */
  originalFont = "";

  /**
   * Font cast member property; specifies whether the font cast member records the fonts used in
   * the cast member (TRUE) or not (FALSE). Read/write.
   */
  recordFont = false;
}