import { MemberObject } from "../member.js";

/**
 * Field cast member (Chapter 6: Media Types — "Field").
 *
 * Represents a field cast member.
 *
 * Method summary: `charPosToLoc()`, `lineHeight()`, `linePosToLocV()`, `locToCharPos()`,
 * `locVToLinePos()`, `pointToChar()`, `pointToItem()`, `pointToLine()`, `pointToParagraph()`,
 * `pointToWord()`, `scrollByLine()`, `scrollByPage()`.
 * Property summary: `alignment`, `autoTab`, `border`, `boxDropShadow`, `boxType`, `dropShadow`,
 * `editable`, `font`, `fontStyle`, `fontSize`, `lineCount`, `margin`, `pageHeight`, `scrollTop`,
 * `selEnd`, `selStart`, `text`, `wordWrap`.
 */
export class FieldMember extends MemberObject {
  /**
   * Cast member property; determines the alignment used to display characters within the
   * specified cast member. This property appears only to field and text cast members containing
   * characters, if only a space. For field cast members, the value of the property is a string
   * consisting of one of the following: left, center, or right. This property can be tested and
   * set.
   */
  alignment = "left";

  /**
   * Cast member property; determines the effect that pressing the Tab key has on the editable
   * field or text cast member specified by whichCastMember. The property can be made active
   * (TRUE) or inactive (FALSE). Tabbing order depends on sprite number order, not position on
   * the Stage.
   */
  autoTab = false;

  /**
   * Field cast member property; indicates the width, in pixels, of the border around the
   * specified field cast member.
   */
  border = 0;

  /**
   * Cast member property; determines the size, in pixels, of the drop shadow for the box of the
   * field cast member specified by whichCastMember.
   */
  boxDropShadow = 0;

  /**
   * Cast member property; determines the type of text box used for the specified cast member.
   * The possible values are #adjust, #scroll, #fixed, and #limit.
   */
  boxType = Symbol.for("adjust");

  /**
   * Cast member property; determines the size of the drop shadow in pixels, for text in a field
   * cast member.
   */
  dropShadow = 0;

  /**
   * Sprite property; determines whether a specified sprite can be edited on the Stage (TRUE) or
   * not (FALSE). Read/write. When the cast member property is set, the setting is applied to all
   * sprites that contain the field. When this property is set, only the specified sprite is
   * affected.
   */
  editable = false;

  /**
   * Text and field cast member property; determines the font used to display the specified cast
   * member and requires that the cast member contain characters, if only a space. The parameter
   * whichCastMember can be either a cast member name or number. The font member property can be
   * tested and set.
   */
  font = "";

  /**
   * Cast member property; determines the styles applied to the font used to display the
   * specified field cast member, character, line, word, or other chunk expression and requires
   * that the field cast member contain characters, if only a space. The value of the property is
   * a string of styles delimited by commas. The available styles are plain, bold, italic,
   * underline, shadow, outline, and extended; on the Macintosh, condensed also is available.
   * Use the style plain to remove all currently applied styles. This property can be tested and
   * set.
   */
  fontStyle = "plain";

  /**
   * Field cast member property; determines the size of the font used to display the specified
   * field cast member and requires that the cast member contain characters, if only a space.
   * The parameter whichCastMember can be either a cast member name or number. This property can
   * be tested and set. When tested, it returns the height of the first line in the field. When
   * set, it affects every line in the field.
   */
  fontSize = 0;

  /**
   * Cast member property; indicates the number of lines that appear in the field cast member on
   * the Stage according to the way the string wraps, not the number of carriage returns in the
   * string.
   */
  lineCount = 0;

  /**
   * Field cast member property; determines the size, in pixels, of the margin inside the field
   * box.
   */
  margin = 0;

  /**
   * Field cast member property; returns the height, in pixels, of the area of the field cast
   * member that is visible on the Stage. This property can be tested but not set.
   */
  pageHeight = 0;

  /**
   * Cast member property; determines the distance, in pixels, from the top of a field cast
   * member to the top of the field that is currently visible in the scrolling box. By changing
   * the value for scrollTop member property while the movie plays, you can change the section of
   * the field that appears in the scrolling field.
   */
  scrollTop = 0;

  /**
   * Cast member property; specifies the last character of a selection. It is used with selStart
   * to identify a selection in the current editable field, counting from the beginning character.
   * This property can be tested and set. The default value is 0.
   */
  selEnd = 0;

  /**
   * Cast member property; specifies the starting character of a selection. It is used with
   * selEnd to identify a selection in the current editable field, counting from the beginning
   * character. This property can be tested and set. The default value is 0.
   */
  selStart = 0;

  /**
   * Text cast member property; determines the character string in the field cast member
   * specified by whichCastMember.
   */
  text = "";

  /**
   * Cast member property; determines whether line wrapping is allowed (TRUE) or not (FALSE).
   */
  wordWrap = false;

  /**
   * Field function; returns the point in the entire field cast member (not just the part that
   * appears on the Stage) that is closest to a specified character. This is useful for
   * determining the location of individual characters. Values for charPosToLoc are in pixels
   * from the top left corner of the field cast member. The nthCharacter parameter is 1 for the
   * first character in the field, 2 for the second character, and so on.
   */
  charPosToLoc(nthCharacter) { return null; }

  /**
   * Cast member property; determines the line spacing used to display the specified field cast
   * member. The parameter whichCastMember can be either a cast member name or number. Setting
   * the lineHeight member property temporarily overrides the system's setting until the movie
   * closes. This property can be tested and set.
   */
  lineHeight() { return 0; }

  /**
   * Function; returns a specific line's distance, in pixels, from the top edge of the field cast
   * member.
   */
  linePosToLocV(line) { return 0; }

  /**
   * Function; returns a number that identifies which character in a specified field cast member
   * is closest to a point within the field. The value 1 corresponds to the first character in the
   * string, the value 2 corresponds to the second character in the string, and so on.
   */
  locToCharPos(point) { return 1; }

  /**
   * Function; returns the number of the line of characters that appears at a specified vertical
   * position.
   */
  locVToLinePos(locV) { return 1; }

  /**
   * Function; returns an integer representing the character position located within the text or
   * field sprite at a specified screen coordinate, or returns -1 if the point is not within the
   * text. This function can be used to determine the character under the cursor.
   */
  pointToChar(point) { return -1; }

  /**
   * Function; returns an integer representing the item position in the text or field sprite at a
   * specified screen coordinate, or returns -1 if the point is not within the text. Items are
   * separated by the itemDelimiter property, which is set to a comma by default. This function
   * can be used to determine the item under the cursor.
   */
  pointToItem(point) { return -1; }

  /**
   * Function; returns an integer representing the line position in the text or field sprite at a
   * specified screen coordinate, or returns -1 if the point is not within the text. Lines are
   * separated by carriage returns in the text or field cast member. This function can be used to
   * determine the line under the cursor.
   */
  pointToLine(point) { return -1; }

  /**
   * Function; returns an integer representing the paragraph number located within the text or
   * field sprite at a specified at screen coordinate, or returns -1 if the point is not within
   * the text. Paragraphs are separated by carriage returns in a block of text. This function
   * can be used to determine the paragraph under the cursor.
   */
  pointToParagraph(point) { return -1; }

  /**
   * Function; returns an integer representing the number of a word located within the text or
   * field sprite at a specified screen coordinate, or returns -1 if the point is not within the
   * text. Words are separated by spaces in a block of text. This function can be used to
   * determine the word under the cursor.
   */
  pointToWord(point) { return -1; }

  /**
   * Command; scrolls the specified field or text cast member up or down by a specified number of
   * lines. Lines are defined as lines separated by carriage returns or by wrapping.
   */
  scrollByLine(numLines) {}

  /**
   * Command; scrolls the specified field or text cast member up or down by a specified number
   * of pages. A page is equal to the number of lines of text visible on the screen.
   */
  scrollByPage(numPages) {}
}