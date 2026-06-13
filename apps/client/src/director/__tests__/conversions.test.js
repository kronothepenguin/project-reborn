import { describe, it, expect } from "vitest";
import {
  integer,
  float,
  string,
  value,
  symbol,
} from "../api.js";

describe("Director Conversion Functions", () => {
  describe("integer()", () => {
    it("converts string to integer", () => {
      expect(integer("42")).toBe(42);
      expect(integer("-10")).toBe(-10);
    });

    it("truncates float", () => {
      expect(integer(3.7)).toBe(3);
      expect(integer(3.2)).toBe(3);
      expect(integer(-3.7)).toBe(-3);
    });

    it("returns integer for integer", () => {
      expect(integer(42)).toBe(42);
    });
  });

  describe("float()", () => {
    it("converts string to float", () => {
      expect(float("3.14")).toBeCloseTo(3.14);
      expect(float("-2.5")).toBeCloseTo(-2.5);
    });

    it("converts integer to float", () => {
      expect(float(42)).toBe(42);
    });
  });

  describe("string()", () => {
    it("converts number to string", () => {
      expect(string(42)).toBe("42");
      expect(string(3.14)).toBe("3.14");
    });

    it("converts symbol to description", () => {
      expect(string(Symbol.for("test"))).toBe("test");
    });

    it("converts null/undefined to empty string", () => {
      expect(string(null)).toBe("");
      expect(string(undefined)).toBe("");
    });

    it("converts boolean to string", () => {
      expect(string(true)).toBe("true");
      expect(string(false)).toBe("false");
    });

    it("converts object to JSON", () => {
      expect(string({ a: 1 })).toBe('{"a":1}');
    });
  });

  describe("value()", () => {
    it("parses boolean TRUE", () => {
      expect(value("TRUE")).toBe(true);
      expect(value("1")).toBe(true);
    });

    it("parses boolean FALSE", () => {
      expect(value("FALSE")).toBe(false);
      expect(value("0")).toBe(false);
    });

    it("parses integer string", () => {
      expect(value("42")).toBe(42);
      expect(value("-10")).toBe(-10);
    });

    it("parses float string", () => {
      expect(value("3.14")).toBeCloseTo(3.14);
    });

    it("parses VOID", () => {
      expect(value("VOID")).toBe(null);
    });

    it("parses EMPTY", () => {
      expect(value("EMPTY")).toBe("");
    });

    it("returns non-string as-is", () => {
      expect(value(42)).toBe(42);
    });
  });

  describe("symbol()", () => {
    it("creates Symbol.for()", () => {
      expect(symbol("test")).toBe(Symbol.for("test"));
      expect(symbol("openConnection")).toBe(Symbol.for("openConnection"));
    });
  });
});
