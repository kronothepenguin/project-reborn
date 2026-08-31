import { MemberObject } from "../member.js";

/**
 * Text cast member (Chapter 6: Media Types — "Text").
 *
 * Represents a text cast member.
 *
 * Event summary: `on hyperlinkClicked`.
 * Method summary: `count()`, `pointInHyperlink()`, `pointToChar()`, `pointToItem()`,
 * `pointToLine()`, `pointToParagraph()`, `pointToWord()`.
 * Property summary: `antiAlias`, `antiAliasThreshold`, `bottomSpacing`, `charSpacing`,
 * `firstIndent`, `fixedLineSpace`, `font`, `fontStyle`, `HTML`, `hyperlink`, `hyperlinkRange`,
 * `hyperlinks`, `hyperlinkState`, `kerning`, `kerningThreshold`, `RTF`, `selectedText`,
 * `useHypertextStyles`.
 */
export class TextMember extends MemberObject {
  /**
   * Cast member property; controls whether a text, Vector shape, or Flash cast member is rendered
   * using anti-aliasing to produce high-quality rendering, but possibly slower playback of the
   * movie. The antiAlias property is TRUE by default. For vector shapes, TRUE is the equivalent
   * of the #high quality setting for a Flash asset, and FALSE is the equivalent of #low. The
   * antiAlias property may also be used as a sprite property only for Vector shape sprites. This
   * property can be tested and set.
   */
  antiAlias = true;

  /**
   * Text cast member property; this setting controls the point size at which automatic
   * anti-aliasing takes place in a text cast member. This has an effect only when the antiAlias
   * property of the text cast member is set to TRUE. The setting itself is an integer indicating
   * the font point size at which the anti-alias takes place. This property defaults to 14 points.
   */
  antiAliasThreshold = 14;

  /**
   * Text cast member property; enables you to specify additional spacing applied to the bottom of
   * each paragraph in the chunkExpression portion of the text cast member. The value itself is an
   * integer, where less than 0 indicates less spacing between paragraphs and greater than 0
   * indicates more spacing between paragraphs. The default value is 0, which results in default
   * spacing between paragraphs.
   *
   * Note: This property, like all text cast member properties, supports only dot syntax.
   */
  bottomSpacing = 0;

  /**
   * Text cast member property; enables specifying any additional spacing applied to each letter in
   * the chunkExpression portion of the text cast member. A value less than 0 indicates less
   * spacing between letters. A value greater than 0 indicates more spacing between letters. The
   * default value is 0, which results in default spacing between letters.
   */
  charSpacing = 0;

  /**
   * Text cast member property; contains the number of pixels the first indent in chunkExpression
   * is offset from the left margin of the chunkExpression. The value is an integer: less than 0
   * indicates a hanging indent, 0 is no indention, and greater than 0 is a normal indention. This
   * property can be tested and set.
   */
  firstIndent = 0;

  /**
   * Text cast member property; controls the height of each line in the chunkExpression portion of
   * the text cast member. The value itself is an integer, indicating height in absolute pixels of
   * each line. The default value is 0, which results in natural height of lines.
   */
  fixedLineSpace = 0;

  /**
   * Text and field cast member property; determines the font used to display the specified cast
   * member and requires that the cast member contain characters, if only a space. The parameter
   * whichCastMember can be either a cast member name or number. The font member property can be
   * tested and set.
   */
  font = "";

  /**
   * Cast member property; determines the styles applied to the font used to display the specified
   * field cast member, character, line, word, or other chunk expression and requires that the
   * field cast member contain characters, if only a space. The value of the property is a string
   * of styles delimited by commas. Lingo uses a font that is a combination of the styles in the
   * string. The available styles are plain, bold, italic, underline, shadow, outline, and
   * extended; on the Macintosh, condensed also is available. Use the style plain to remove all
   * currently applied styles. This property can be tested and set.
   */
  fontStyle = "plain";

  /**
   * Cast member property; accesses text and tags that control the layout of the text within an
   * HTML-formatted text cast member. This property can be tested and set.
   */
  HTML = "";

  /**
   * Text cast member property; returns the hyperlink string for the specified chunk expression in
   * the text cast member. This property can be both tested and set. When retrieving this property,
   * the link containing the first character of chunkExpression is used. Hyperlinks may not
   * overlap. Setting a hyperlink over an existing link, even partially over it), replaces the
   * initial link with the new one. Setting a hyperlink to an empty string removes it.
   */
  hyperlink = "";

  /**
   * Text cast member property; returns the range of the hyperlink that contains the first
   * character of the chunk expression. This property can be tested but not set. Like hyperLink and
   * hyperLinkState, the returned range of the link contains the first character of chunkExpression.
   */
  hyperlinkRange = [0, 0];

  /**
   * Text cast member property; returns a linear list containing all the hyperlink ranges for the
   * specified chunk of a text cast member. Each range is given as a linear list with two elements,
   * one for the starting character of the link and one for the ending character.
   */
  hyperlinks = [];

  /**
   * Text cast member property; contains the current state of the hyperlink. Possible values for
   * the state are: #normal, #active, and #visited. This property can be tested and set. Like
   * hyperLink and hyperLinkRange, the returned range of the link contains the first character of
   * chunkExpression.
   */
  hyperlinkState = Symbol.for("normal");

  /**
   * Text cast member property; this property specifies whether the text is automatically kerned
   * when the contents of the text cast member are changed. When set to TRUE, kerning is automatic;
   * when set to FALSE, kerning is not done. This property defaults to TRUE.
   */
  kerning = true;

  /**
   * Text cast member property; this setting controls the size at which automatic kerning takes
   * place in a text cast member. This has an effect only when the kerning property of the text
   * cast member is set to TRUE. The setting itself is an integer indicating the font point size
   * at which kerning takes place. This property defaults to 14 points.
   */
  kerningThreshold = 14;

  /**
   * Cast member property; allows access to the text and tags that control the layout of the text
   * within a text cast member containing text in rich text format. This property can be tested
   * and set.
   */
  RTF = "";

  /**
   * Text cast member property; returns the currently selected chunk of text as a single object
   * reference. This allows access to font characteristics as well as to the string information of
   * the actual characters.
   */
  selectedText = "";

  /**
   * Text cast member property; controls the display of hypertext links in the text cast member.
   * When useHypertextStyles is TRUE, all links are automatically colored blue with underlines,
   * and the pointer (cursor) changes to a pointing finger when it is over a link. Setting this
   * property to FALSE turns off the automatic formatting and pointer change.
   */
  useHypertextStyles = true;

  /**
   * Property (Lingo only); returns the number of entries in a linear or property list, the
   * number of properties in a parent script without counting the properties in an ancestor script,
   * or the chunks of a text expression such as characters, lines, or words. The count command
   * works with linear and property lists, objects created with parent scripts, and the globals
   * property.
   */
  count() { return 0; }

  /**
   * Text sprite function; returns a value (TRUE or FALSE) that indicates whether the specified
   * point is within a hyperlink in the text sprite. Typically, the point used is the cursor
   * position. This is useful for setting custom cursors.
   */
  pointInHyperlink(point) { return false; }

  /**
   * Function; returns an integer representing the character position located within the text or
   * field sprite at a specified screen coordinate, or returns -1 if the point is not within the
   * text. This function can be used to determine the character under the cursor.
   */
  pointToChar(point) { return -1; }

  /**
   * Function; returns an integer representing the item position in the text or field sprite at
   * a specified screen coordinate, or returns -1 if the point is not within the text. Items are
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
   * the text. Paragraphs are separated by carriage returns in a block of text. This function can
   * be used to determine the paragraph under the cursor.
   */
  pointToParagraph(point) { return -1; }

  /**
   * Function; returns an integer representing the number of a word located within the text or
   * field sprite at a specified screen coordinate, or returns -1 if the point is not within the
   * text. Words are separated by spaces in a block of text. This function can be used to
   * determine the word under the cursor.
   */
  pointToWord(point) { return -1; }
}