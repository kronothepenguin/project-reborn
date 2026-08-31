import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { alert } from "../alert.js";
import { _player } from "../../singletons.js";

describe("alert", () => {
  let alertSpy;

  beforeEach(() => {
    alertSpy = vi.spyOn(_player, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it("is exported as a function", () => {
    expect(typeof alert).toBe("function");
  });

  it("takes one parameter", () => {
    expect(alert.length).toBe(1);
  });

  it("delegates to _player.alert with the provided string", () => {
    alert("hello world");
    expect(alertSpy).toHaveBeenCalledTimes(1);
    expect(alertSpy).toHaveBeenCalledWith("hello world");
  });

  it("passes the message through unchanged", () => {
    const message = "There is no CD-ROM drive connected.";
    alert(message);
    expect(alertSpy).toHaveBeenCalledWith(message);
  });

  it("supports the spec example shape for missing files", () => {
    const filename = "data.txt";
    alert(`The file "${filename}" was not found.`);
    expect(alertSpy).toHaveBeenCalledWith(`The file "${filename}" was not found.`);
  });

  it("propagates errors from _player.alert", () => {
    alertSpy.mockImplementation(() => {
      throw new Error("alert failure");
    });
    expect(() => alert("boom")).toThrow("alert failure");
  });

  it("returns undefined", () => {
    expect(alert("test")).toBeUndefined();
  });
});
