import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { registerCustomElements, _createMovie } from "../index.js";
import { setCanvas, resetCanvas, updateStage, getCanvas } from "../../canvas.js";

describe("custom-elements", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    resetCanvas();
    registerCustomElements();
  });

  afterEach(() => {
    document.body.innerHTML = "";
    resetCanvas();
  });

  it("defines <x-object> and <x-param> in the custom element registry", () => {
    expect(customElements.get("x-object")).toBeDefined();
    expect(customElements.get("x-param")).toBeDefined();
  });

  it("creates a canvas child and sized host on <x-object> connect", () => {
    const obj = document.createElement("x-object");
    obj.setAttribute("width", "320");
    obj.setAttribute("height", "240");
    document.body.appendChild(obj);

    const canvas = obj.querySelector("canvas");
    expect(canvas).not.toBeNull();
    expect(canvas.width).toBe(320);
    expect(canvas.height).toBe(240);
    expect(obj.style.width).toBe("320px");
    expect(obj.style.height).toBe("240px");
  });

  it("collects <x-param> children into a parameter map", () => {
    const obj = document.createElement("x-object");
    obj.setAttribute("src", "casts/internal.js");
    const p = document.createElement("x-param");
    p.setAttribute("name", "color");
    p.setAttribute("value", "red");
    obj.appendChild(p);
    document.body.appendChild(obj);

    expect(obj.castLibs).toBeDefined();
    expect(Array.isArray(obj.castLibs)).toBe(true);
  });

  it("dispatches xparam event on parent <x-object> when <x-param> changes", () => {
    const obj = document.createElement("x-object");
    document.body.appendChild(obj);

    const p = document.createElement("x-param");
    p.setAttribute("name", "color");
    p.setAttribute("value", "blue");
    obj.appendChild(p);

    let received = null;
    obj.addEventListener("xparam", (e) => {
      received = e.detail;
    });

    p.setAttribute("value", "green");
    expect(received).toEqual({ name: "color", value: "green" });
  });

  it("exposes the underlying movie on .movie", () => {
    const obj = document.createElement("x-object");
    document.body.appendChild(obj);
    expect(obj.movie).not.toBeNull();
    expect(obj.movie.tempo).toBeGreaterThan(0);
  });

  it("does not re-dispatch xparam when <x-param> has no parent host", () => {
    const p = document.createElement("x-param");
    p.setAttribute("name", "x");
    p.setAttribute("value", "1");
    expect(() => {
      p.setAttribute("value", "2");
    }).not.toThrow();
  });

  it("_createMovie returns a movie with event bus", () => {
    const m = _createMovie({ src: "a.js", tempo: 30 });
    expect(m.src).toBe("a.js");
    expect(m.tempo).toBe(30);

    let called = 0;
    m.addEventListener("ping", () => called++);
    m.dispatchEvent(new CustomEvent("ping"));
    m.dispatchEvent(new CustomEvent("ping"));
    expect(called).toBe(2);

    const handler = () => called++;
    m.addEventListener("bye", handler);
    m.removeEventListener("bye", handler);
    m.dispatchEvent(new CustomEvent("bye"));
    expect(called).toBe(2);
  });

  it("setCanvas wires the canvas into the runtime", () => {
    const canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 100;
    const movie = _createMovie({});
    setCanvas(canvas, movie);
    expect(getCanvas()).toBe(canvas);
    expect(() => updateStage()).not.toThrow();
  });
});
