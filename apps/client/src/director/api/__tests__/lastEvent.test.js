import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { lastEvent, _setLastEventForTests } from "../lastEvent.js";

describe("lastEvent", () => {
  beforeEach(() => {
    _setLastEventForTests(0);
  });

  afterEach(() => {
    _setLastEventForTests(0);
  });

  it("is exported as a function", () => {
    expect(typeof lastEvent).toBe("function");
  });

  it("takes no parameters", () => {
    expect(lastEvent.length).toBe(0);
  });

  it("returns the stored ticks value", () => {
    _setLastEventForTests(60);
    expect(lastEvent()).toBe(60);
  });

  it("matches the spec example shape (10s = 600 ticks)", () => {
    _setLastEventForTests(300);
    expect(lastEvent()).toBe(300);
  });
});
