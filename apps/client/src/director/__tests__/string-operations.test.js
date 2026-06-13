import { describe, it, expect } from "vitest";
import {
  numToChar,
  charToNum,
  chars,
  offset,
} from "../api.js";

describe("Director String Operations", () => {
  describe("numToChar()", () => {
    // TODO: Verify Director MX 2004 reference for numToChar()
    // Director MX 2004 uses charToNum() but numToChar() may not exist
    it("converts code to character", () => {
      expect(numToChar(65)).toBe("A");
      expect(numToChar(97)).toBe("a");
      expect(numToChar(48)).toBe("0");
    });
  });

  describe("charToNum()", () => {
    // Director MX 2004: "returns the ASCII code that corresponds to the first character"
    // Example: ("A").charToNum returns 65
    it("converts character to code (Director MX 2004 example)", () => {
      expect(charToNum("A")).toBe(65);
      expect(charToNum("a")).toBe(97);
      expect(charToNum("0")).toBe(48);
    });
  });

  // Note: contains() does NOT exist in Director MX 2004
  // Director MX 2004 uses "contains" as a keyword in if statements, not as a function
  // TODO: Remove contains() from api.js or implement as keyword helper

  // Note: starts() does NOT exist in Director MX 2004
  // TODO: Remove starts() from api.js

  describe("chars()", () => {
    // Director MX 2004: "identifies a substring of characters in an expression"
    // Example: chars("Macromedia", 6, 6) returns "m"
    // Example: chars("Macromedia", 6, 10) returns "media"
    it("extracts substring (Director MX 2004 examples)", () => {
      expect(chars("Macromedia", 6, 6)).toBe("m");
      expect(chars("Macromedia", 6, 10)).toBe("media");
    });

    it("handles full string", () => {
      expect(chars("hello", 1, 5)).toBe("hello");
    });
  });

  describe("offset()", () => {
    // Director MX 2004: "returns an integer indicating the position of the first character of a string in another string"
    // "returns 0 if the first string is not found in the second string"
    it("finds position of substring (1-indexed)", () => {
      // "media" starts at position 6 in "Macromedia" (M-a-c-r-o-m-e-d-i-a)
      expect(offset("media", "Macromedia")).toBe(6);
      expect(offset("hello", "hello world")).toBe(1);
    });

    it("returns 0 when not found (Director MX 2004)", () => {
      expect(offset("xyz", "hello world")).toBe(0);
    });
  });

  // Note: length() exists in Director MX 2004 but as a property, not a function
  // Director MX 2004: "the number (characters) of a string"
  // TODO: Verify if length() should be a function or property access
});
