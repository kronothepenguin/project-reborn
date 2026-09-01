import { describe, it, expect } from "vitest";
import { camera } from "../camera.js";

describe("camera", () => {
  it("is exported as a function", () => {
    expect(typeof camera).toBe("function");
  });

  it("returns an object", () => {
    expect(typeof camera()).toBe("object");
  });

  it("returns a camera with a name property", () => {
    const c = camera("TreeCam");
    expect(c.name).toBe("TreeCam");
  });

  it("returns a camera with a default rect", () => {
    const c = camera();
    expect(c.rect).toBeDefined();
    expect(c.rect).toHaveProperty("left");
    expect(c.rect).toHaveProperty("top");
    expect(c.rect).toHaveProperty("right");
    expect(c.rect).toHaveProperty("bottom");
  });

  it("matches the spec example shape (named camera from member)", () => {
    const treeCam = camera("TreeCam");
    const c2 = camera(2);
    expect(treeCam.name).toBe("TreeCam");
    expect(c2.name).toBe("2");
  });
});
