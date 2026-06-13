import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Director Plugin - Custom Elements", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("x-object element", () => {
    it("can be created in DOM", () => {
      const el = document.createElement("x-object");
      expect(el).toBeInstanceOf(HTMLElement);
    });

    it("can be added to document", () => {
      const el = document.createElement("x-object");
      document.body.appendChild(el);
      expect(document.querySelector("x-object")).toBe(el);
    });
  });

  describe("x-param element", () => {
    it("can be created in DOM", () => {
      const el = document.createElement("x-param");
      expect(el).toBeInstanceOf(HTMLElement);
    });

    it("can have name and value attributes", () => {
      const el = document.createElement("x-param");
      el.setAttribute("name", "src");
      el.setAttribute("value", "movie.js");
      expect(el.getAttribute("name")).toBe("src");
      expect(el.getAttribute("value")).toBe("movie.js");
    });
  });
});
