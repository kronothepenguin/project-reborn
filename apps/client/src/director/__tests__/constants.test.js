import { describe, it, expect } from "vitest";
import { VOID, EMPTY, PI, RETURN, SPACE, TAB, QUOTE } from "../api.js";

describe("Director Constants", () => {
  describe("VOID", () => {
    it("equals undefined", () => {
      expect(VOID).toBe(undefined);
    });

    it("is strictly equal to void 0", () => {
      expect(VOID).toBe(void 0);
    });
  });

  describe("EMPTY", () => {
    it("equals empty string", () => {
      expect(EMPTY).toBe("");
    });

    it("has length 0", () => {
      expect(EMPTY.length).toBe(0);
    });
  });

  describe("PI", () => {
    it("equals Math.PI", () => {
      expect(PI).toBe(Math.PI);
    });

    it("is approximately 3.14159", () => {
      expect(PI).toBeCloseTo(3.14159, 4);
    });
  });

  describe("RETURN", () => {
    it("is carriage return", () => {
      expect(RETURN).toBe("\r");
    });

    it("has charCode 13", () => {
      expect(RETURN.charCodeAt(0)).toBe(13);
    });
  });

  describe("SPACE", () => {
    it("is space character", () => {
      expect(SPACE).toBe(" ");
    });

    it("has charCode 32", () => {
      expect(SPACE.charCodeAt(0)).toBe(32);
    });
  });

  describe("TAB", () => {
    it("is tab character", () => {
      expect(TAB).toBe("\t");
    });

    it("has charCode 9", () => {
      expect(TAB.charCodeAt(0)).toBe(9);
    });
  });

  describe("QUOTE", () => {
    it("is double quote character", () => {
      expect(QUOTE).toBe('"');
    });

    it("has charCode 34", () => {
      expect(QUOTE.charCodeAt(0)).toBe(34);
    });
  });
});
