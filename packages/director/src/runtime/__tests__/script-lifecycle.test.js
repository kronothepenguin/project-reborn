import { describe, it, expect, beforeEach } from "vitest";
import {
  dispatchPrepareMovie,
  dispatchStartMovie,
  dispatchStopMovie,
  dispatchPrepareFrame,
  dispatchEnterFrame,
  dispatchExitFrame,
  dispatchAll,
  LIFECYCLE_EVENTS,
} from "../script-lifecycle.js";
import { _createMovie } from "../custom-elements.js";

describe("script-lifecycle", () => {
  let target;

  beforeEach(() => {
    target = _createMovie({});
  });

  it("LIFECYCLE_EVENTS contains the six core events", () => {
    expect(LIFECYCLE_EVENTS).toEqual([
      "prepareMovie",
      "startMovie",
      "stopMovie",
      "prepareFrame",
      "enterFrame",
      "exitFrame",
    ]);
  });

  it("dispatchPrepareMovie fires prepareMovie", () => {
    let received = null;
    target.addEventListener("prepareMovie", (e) => (received = e.detail));
    dispatchPrepareMovie(target, { src: "x.js" });
    expect(received).toEqual({ src: "x.js" });
  });

  it("dispatchStartMovie fires startMovie", () => {
    let received = null;
    target.addEventListener("startMovie", (e) => (received = e.detail));
    dispatchStartMovie(target, { tempo: 30 });
    expect(received).toEqual({ tempo: 30 });
  });

  it("dispatchStopMovie fires stopMovie", () => {
    let received = null;
    target.addEventListener("stopMovie", (e) => (received = e.detail));
    dispatchStopMovie(target, { reason: "user" });
    expect(received).toEqual({ reason: "user" });
  });

  it("dispatchPrepareFrame includes frame in detail", () => {
    let received = null;
    target.addEventListener("prepareFrame", (e) => (received = e.detail));
    dispatchPrepareFrame(target, 42);
    expect(received).toEqual({ frame: 42 });
  });

  it("dispatchEnterFrame includes frame in detail", () => {
    let received = null;
    target.addEventListener("enterFrame", (e) => (received = e.detail));
    dispatchEnterFrame(target, 7, { extra: 1 });
    expect(received).toEqual({ frame: 7, extra: 1 });
  });

  it("dispatchExitFrame includes frame in detail", () => {
    let received = null;
    target.addEventListener("exitFrame", (e) => (received = e.detail));
    dispatchExitFrame(target, 9);
    expect(received).toEqual({ frame: 9 });
  });

  it("dispatchAll fires every lifecycle event", () => {
    const seen = new Set();
    for (const name of LIFECYCLE_EVENTS) {
      target.addEventListener(name, () => seen.add(name));
    }
    dispatchAll(target, { x: 1 });
    expect(seen.size).toBe(LIFECYCLE_EVENTS.length);
  });

  it("returns false for null target without throwing", () => {
    expect(dispatchPrepareMovie(null)).toBe(false);
    expect(dispatchStartMovie(null)).toBe(false);
    expect(dispatchStopMovie(null)).toBe(false);
    expect(dispatchPrepareFrame(null, 1)).toBe(false);
    expect(dispatchEnterFrame(null, 1)).toBe(false);
    expect(dispatchExitFrame(null, 1)).toBe(false);
  });
});
