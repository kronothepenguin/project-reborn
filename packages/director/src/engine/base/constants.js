/**
 * Constant; represents the Backspace key. This key is labeled Backspace in Windows and Delete on
 * the Macintosh.
 *
 * Character value (ANSI char 8) — compared against `_key.key`, which returns the ANSI character.
 * The keyCode 51 in the docs' JavaScript column is the JS-syntax alternative for `_key.keyCode`,
 * not this constant's value (research.md R2).
 */
export const BACKSPACE = String.fromCharCode(8);

/**
 * Character constant; represents the empty string, "", a string with no characters.
 */
export const EMPTY = "";

/**
 * Character constant; represents Enter (Windows) or Return (Macintosh) for a carriage return.
 *
 * On PC keyboards, the element ENTER refers only to Enter on the numeric keypad.
 *
 * For a movie that plays back as an applet, use RETURN to specify both Return in Windows and
 * Enter on the Macintosh.
 */
export const ENTER = String.fromCharCode(3);

/**
 * Constant; applies to an expression that is logically FALSE, such as 2 > 3. When treated as a
 * number value, FALSE has the numerical value of 0. Conversely, 0 is treated as FALSE.
 */
export const FALSE = false;

/**
 * Constant; returns the value of pi (π), the ratio of a circle’s circumference to its diameter, as a
 * floating-point number. The value is rounded to the number of decimal places set by the
 * floatPrecision property.
 */
export const PI = Math.PI;

/**
 * Constant; represents the quotation mark character and refers to the literal quotation mark
 * character in a string, because the quotation mark character itself is used by Lingo scripts to
 * delimit strings.
 */
export const QUOTE = '"';

/**
 * Constant; represents a carriage return.
 */
export const RETURN = "\r";

/**
 * Constant; read-only, value that represents the space character.
 */
export const SPACE = " ";

/**
 * Constant; represents the Tab key.
 */
export const TAB = "\t";

/**
 * Constant; represents the value of a logically true expression, such as 2 < 3. It has a traditional
 * numerical value of 1, but any nonzero integer evaluates to TRUE in a comparison.
 */
export const TRUE = true;

/**
 * Constant; indicates the value VOID.
 */
export const VOID = null;
