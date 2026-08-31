// Rect data type (Director MX 2004 Scripting Reference — rect()).
// Verbatim JSDoc quoted from docs/drmx2004_scripting_ref/methods.txt (rect()).
//
// Refactor T008: removed `#` private fields — `left`/`top`/`right`/`bottom` are
// plain public fields. No derived width/height accessors (the docs compute width
// as `myRect.right - myRect.left`); per canon (no computed derivations unless
// spec-required). The bracket-access Proxy implements documented JS-syntax
// indexing (`myRect[3] - myRect[1]`).

export class Rect {
  /**
   * The number of pixels that the left side of the rectangle is from the left
   * edge of the Stage. Read/write.
   */
  left = 0;

  /**
   * The number of pixels that the top side of the rectangle is from the top edge
   * of the Stage. Read/write.
   */
  top = 0;

  /**
   * The number of pixels that the right side of the rectangle is from the left
   * edge of the Stage. Read/write.
   */
  right = 0;

  /**
   * The number of pixels that the bottom side of the rectangle is from the top
   * edge of the Stage. Read/write.
   */
  bottom = 0;

  /**
   * Top level function; defines a rectangle. You can refer to rectangle
   * components by list syntax or property syntax. For example,
   * `myRectWidth1 = myRect.right - myRect.left` and
   * `myRectWidth2 = myRect[3] - myRect[1]` both yield the width.
   *
   * @param {number} [left=0]   Required. An integer that specifies the number of pixels that the left side of the rectangle is from the left edge of the Stage.
   * @param {number} [top=0]    Required. An integer that specifies the number of pixels that the top side of the rectangle is from the top edge of the Stage.
   * @param {number} [right=0]  Required. An integer that specifies the number of pixels that the right side of the rectangle is from the left edge of the Stage.
   * @param {number} [bottom=0] Required. An integer that specifies the number of pixels that the bottom side of the rectangle is from the top edge of the Stage.
   */
  constructor(left = 0, top = 0, right = 0, bottom = 0) {
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
  }
}

/**
 * rect(intLeft, intTop, intRight, intBottom)
 *
 * Top level function; defines a rectangle. You can perform arithmetic
 * operations on rectangles using both Lingo and JavaScript syntax. You can refer
 * to rectangle components by list syntax or property syntax.
 *
 * @param {number} [left]   Required. An integer that specifies the number of pixels that the left side of the rectangle is from the left edge of the Stage.
 * @param {number} [top]    Required. An integer that specifies the number of pixels that the top side of the rectangle is from the top edge of the Stage.
 * @param {number} [right]  Required. An integer that specifies the number of pixels that the right side of the rectangle is from the left edge of the Stage.
 * @param {number} [bottom] Required. An integer that specifies the number of pixels that the bottom side of the rectangle is from the top edge of the Stage.
 * @returns {Rect}
 */
export function rect(left, top, right, bottom) {
  return createRectProxy(left, top, right, bottom);
}

function createRectProxy(left, top, right, bottom) {
  const t = new Rect(left, top, right, bottom);
  return new Proxy(t, {
    get(target, prop) {
      if (prop === "1" || prop === 1) return target.left;
      if (prop === "2" || prop === 2) return target.top;
      if (prop === "3" || prop === 3) return target.right;
      if (prop === "4" || prop === 4) return target.bottom;
      return Reflect.get(target, prop);
    },
    set(target, prop, value) {
      if (prop === "1" || prop === 1) {
        target.left = value;
        return true;
      }
      if (prop === "2" || prop === 2) {
        target.top = value;
        return true;
      }
      if (prop === "3" || prop === 3) {
        target.right = value;
        return true;
      }
      if (prop === "4" || prop === 4) {
        target.bottom = value;
        return true;
      }
      return Reflect.set(target, prop, value);
    },
    has(target, prop) {
      if (prop === "1" || prop === 1 || prop === "2" || prop === 2 || prop === "3" || prop === 3 || prop === "4" || prop === 4) {
        return true;
      }
      return Reflect.has(target, prop);
    },
  });
}