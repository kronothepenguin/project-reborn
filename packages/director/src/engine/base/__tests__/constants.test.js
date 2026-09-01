import { describe, it, expect } from "vitest";
import {
  EMPTY,
  VOID,
  RETURN,
  SPACE,
  TAB,
  BACKSPACE,
  ENTER,
  QUOTE,
  TRUE,
  FALSE,
  PI,
} from "../../../api/index.js";

describe("Lingo constants", () => {
  it("exposes all eleven constants with doc-conformant values", () => {
    const cases = [
      [EMPTY, ""],
      [VOID, null],
      [RETURN, "\r"],
      [SPACE, " "],
      [TAB, "\t"],
      [BACKSPACE, "\b"],
      [ENTER, "\x03"],
      [QUOTE, '"'],
      [TRUE, true],
      [FALSE, false],
      [PI, Math.PI],
    ];
    for (const [got, want] of cases) {
      expect(got).toBe(want);
    }
  });

  it("FALSE behaves as 0 in numeric contexts", () => {
    expect(Number(FALSE)).toBe(0);
  });

  it("TRUE is nonzero in numeric contexts", () => {
    expect(Number(TRUE)).toBe(1);
  });
});
