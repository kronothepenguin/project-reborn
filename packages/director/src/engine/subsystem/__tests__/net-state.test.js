import { describe, it, expect } from "vitest";
import { NetState } from "../net-state.js";

describe("NetState — operation lifecycle", () => {
  it("begin() allocates an incrementing netID with an inflight record", () => {
    const ns = new NetState();
    const a = ns.begin({ url: "/a" });
    expect(a).toBe(1);
    const b = ns.begin();
    expect(b).toBe(2);
    expect(ns.isDone(a)).toBe(false);
    expect(ns.isError(a)).toBe(false);
  });

  it("update() transitions to done and exposes results", () => {
    const ns = new NetState();
    const id = ns.begin();
    ns.update(id, { status: "done", data: "hello", mime: "text/plain", lastMod: new Date(0) });
    expect(ns.isDone(id)).toBe(true);
    expect(ns.textResult(id)).toBe("hello");
    expect(ns.mime(id)).toBe("text/plain");
    expect(ns.lastModDate(id)).toEqual(new Date(0));
  });

  it("update() to error surfaces isError and streamStatus", () => {
    const ns = new NetState();
    const id = ns.begin();
    ns.update(id, { status: "error", error: new Error("boom") });
    expect(ns.isError(id)).toBe(true);
    expect(ns.streamStatus(id).status).toBe("error");
    expect(ns.streamStatus(id).error).toBe("boom");
  });

  it("abort() aborts the controller and marks the op errored, idempotently", () => {
    const ns = new NetState();
    const controller = { aborted: false, abort() { this.aborted = true; } };
    const id = ns.begin({ abortController: controller });
    ns.abort(id);
    expect(controller.aborted).toBe(true);
    expect(ns.isError(id)).toBe(true);
    ns.abort(id);
  });

  it("forget() drops the record; unknown ids return documented defaults", () => {
    const ns = new NetState();
    const id = ns.begin();
    ns.update(id, { status: "done", data: "x" });
    ns.forget(id);
    expect(ns.isDone(id)).toBe(false);
    expect(ns.textResult(123)).toBe("");
    expect(ns.streamStatus(123)).toEqual({ status: "done", bytesSoFar: 0, error: "" });
  });

  it("tracks the gotoNetMovie pending URL for the main thread to take", () => {
    const ns = new NetState();
    expect(ns.takeGotoNetMoviePending()).toBeNull();
    ns.setGotoNetMoviePending("/next.dcr");
    expect(ns.takeGotoNetMoviePending()).toBe("/next.dcr");
    expect(ns.takeGotoNetMoviePending()).toBeNull();
  });
});