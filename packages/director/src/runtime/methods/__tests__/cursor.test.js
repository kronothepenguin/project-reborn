import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { cursor } from "../cursor.js";
import { _player } from "../../singletons.js";

describe("cursor", () => {
  let spy;

  beforeEach(() => {
    spy = vi.spyOn(_player, "cursor").mockImplementation(() => {});
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it("is exported as a function", () => {
    expect(typeof cursor).toBe("function");
  });

  it("delegates to _player.cursor with an integer (4 = watch)", () => {
    cursor(4);
    expect(spy).toHaveBeenCalledWith(4, undefined);
  });

  it("delegates with two-integer form (memNum, maskNum)", () => {
    cursor(100, 101);
    expect(spy).toHaveBeenCalledWith(100, 101);
  });

  it("delegates with a cursor memRef", () => {
    const ref = { name: "cursor1" };
    cursor(ref);
    expect(spy).toHaveBeenCalledWith(ref, undefined);
  });

  it("matches the spec example shape (status == 1 watch cursor)", () => {
    const status = 1;
    if (status === 1) cursor(4);
    expect(spy).toHaveBeenCalledWith(4, undefined);
  });
});
