// Point data type (Director MX 2004 Scripting Reference — point()).
// Verbatim JSDoc quoted from docs/drmx2004_scripting_ref/methods.txt (point()).
//
// Refactor T007: removed `#` private fields — `locH`/`locV` are plain public
// fields. The bracket-access Proxy implements documented JS-syntax indexing
// (`pt[1]`, `pt[2]`).

export class Point {
  /**
   * The horizontal coordinate of the point. A point has both a locH and a locV
   * property. Read/write.
   */
  locH = 0;

  /**
   * The vertical coordinate of the point. A point has both a locH and a locV
   * property. Read/write.
   */
  locV = 0;

  /**
   * Top level function and data type. Returns a point that has specified
   * horizontal and vertical coordinates. A point has both a locH and a locV
   * property.
   *
   * @param {number} [locH=0] Required. An integer that specifies the horizontal coordinate of the point.
   * @param {number} [locV=0] Required. An integer that specifies the vertical coordinate of the point.
   */
  constructor(locH = 0, locV = 0) {
    this.locH = locH;
    this.locV = locV;
  }
}

/**
 * point(intH, intV)
 *
 * Top level function and data type. Returns a point that has specified
 * horizontal and vertical coordinates. A point has both a locH and a locV
 * property.
 *
 * @param {number} [locH] Required. An integer that specifies the horizontal coordinate of the point.
 * @param {number} [locV] Required. An integer that specifies the vertical coordinate of the point.
 * @returns {Point}
 */
export function point(locH, locV) {
  return createPointProxy(locH, locV);
}

function createPointProxy(locH, locV) {
  const t = new Point(locH, locV);
  return new Proxy(t, {
    get(target, prop) {
      if (prop === "1" || prop === 1) return target.locH;
      if (prop === "2" || prop === 2) return target.locV;
      return Reflect.get(target, prop);
    },
    set(target, prop, value) {
      if (prop === "1" || prop === 1) {
        target.locH = value;
        return true;
      }
      if (prop === "2" || prop === 2) {
        target.locV = value;
        return true;
      }
      return Reflect.set(target, prop, value);
    },
    has(target, prop) {
      if (prop === "1" || prop === 1 || prop === "2" || prop === 2) return true;
      return Reflect.has(target, prop);
    },
  });
}