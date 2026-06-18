import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ignoreWhiteSpace, _resetIgnoreWhiteSpaceForTests } from "../ignoreWhiteSpace.js";

describe("ignoreWhiteSpace", () => {
  beforeEach(() => {
    _resetIgnoreWhiteSpaceForTests();
  });

  afterEach(() => {
    _resetIgnoreWhiteSpaceForTests();
  });

  it("is exported as a function", () => {
    expect(typeof ignoreWhiteSpace).toBe("function");
  });

  it("defaults to true", () => {
    expect(ignoreWhiteSpace()).toBe(true);
  });

  it("can be set to false", () => {
    ignoreWhiteSpace(false);
    expect(ignoreWhiteSpace()).toBe(false);
  });

  it("can be set back to true", () => {
    ignoreWhiteSpace(false);
    ignoreWhiteSpace(true);
    expect(ignoreWhiteSpace()).toBe(true);
  });

  it("matches the spec example shape (toggle before parseString)", () => {
    ignoreWhiteSpace(false);
    expect(ignoreWhiteSpace()).toBe(false);
  });
});
