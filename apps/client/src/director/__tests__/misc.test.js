import { describe, it, expect } from "vitest";
import { _movie, _player } from "../api.js";
import { bitNot, bitAnd, bitOr, bitXor } from "../api.js";

describe("Director Miscellaneous Functions", () => {
  describe("halt()", () => {
    // Director MX 2004: "_movie.halt() - exits the current handler and stops the movie"
    it("is callable as _movie.halt()", () => {
      expect(() => _movie.halt()).not.toThrow();
    });
  });

  describe("quit()", () => {
    // Director MX 2004: "_player.quit() - exits from Director or a projector"
    it("is callable as _player.quit()", () => {
      expect(() => _player.quit()).not.toThrow();
    });
  });

  describe("bitNot()", () => {
    // Director MX 2004: "converts the specified integer to a 32-bit binary number and reverses the value of each binary digit"
    // Example: bitNot(1) returns -2
    it("performs bitwise NOT (Director MX 2004 example)", () => {
      expect(bitNot(1)).toBe(-2);
      expect(bitNot(0)).toBe(-1);
      expect(bitNot(-1)).toBe(0);
    });
  });

  describe("bitAnd()", () => {
    // Director MX 2004: "converts the two specified integers to 32-bit binary numbers and returns a binary number whose digits are 1's in the positions where both numbers had a 1"
    // Example: bitAnd(6, 7) returns 6
    it("performs bitwise AND (Director MX 2004 example)", () => {
      expect(bitAnd(6, 7)).toBe(6);
      expect(bitAnd(0xFF, 0x0F)).toBe(0x0F);
      expect(bitAnd(0xF0, 0x0F)).toBe(0);
    });
  });

  describe("bitOr()", () => {
    // Director MX 2004: "converts the two specified integers to 32-bit binary numbers and returns a binary number whose digits are 1's in the positions where either number had a 1"
    // Example: bitOr(5, 6) returns 7
    it("performs bitwise OR (Director MX 2004 example)", () => {
      expect(bitOr(5, 6)).toBe(7);
      expect(bitOr(0xF0, 0x0F)).toBe(0xFF);
      expect(bitOr(0, 0)).toBe(0);
    });
  });

  describe("bitXor()", () => {
    // Director MX 2004: "converts the two specified integers to 32-bit binary numbers and returns a binary number whose digits are 1's in the positions where the given numbers' digits do not match"
    it("performs bitwise XOR", () => {
      expect(bitXor(0xFF, 0x0F)).toBe(0xF0);
      expect(bitXor(0xFF, 0xFF)).toBe(0);
      expect(bitXor(0, 0)).toBe(0);
    });
  });
});
