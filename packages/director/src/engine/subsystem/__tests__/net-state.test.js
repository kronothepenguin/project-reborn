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
describe("NetState — 006 R9 additions", () => {
  it("tracks lastNetId for the no-arg net accessors", () => {
    const ns = new NetState();
    expect(ns.lastNetId).toBe(0);
    const a = ns.begin({ url: "/a" });
    expect(ns.lastNetId).toBe(a);
    ns.begin();
    expect(ns.lastNetId).toBe(a + 1);
  });

  it("hasFinished() is true for done or error, false while inflight/unknown", () => {
    const ns = new NetState();
    const id = ns.begin();
    expect(ns.hasFinished(id)).toBe(false);
    ns.update(id, { status: "done", data: "x" });
    expect(ns.hasFinished(id)).toBe(true);

    const err = ns.begin();
    ns.update(err, { status: "error", error: "boom" });
    expect(ns.hasFinished(err)).toBe(true);
    expect(ns.hasFinished(999)).toBe(false);
  });

  it("errorString() returns OK / error text / '' for unknown", () => {
    const ns = new NetState();
    const id = ns.begin();
    ns.update(id, { status: "done" });
    expect(ns.errorString(id)).toBe("OK");

    const err = ns.begin();
    ns.update(err, { status: "error", error: "HTTP 404" });
    expect(ns.errorString(err)).toBe("HTTP 404");

    const errObj = ns.begin();
    ns.update(errObj, { status: "error", error: new Error("boom") });
    expect(ns.errorString(errObj)).toBe("boom");

    expect(ns.errorString(999)).toBe("");
  });

  it("findByUrl() finds the record by url and get() returns the snapshot", () => {
    const ns = new NetState();
    const a = ns.begin({ url: "/x" });
    const b = ns.begin({ url: "/y" });
    expect(ns.findByUrl("/y")).toBe(b);
    expect(ns.findByUrl("/z")).toBeNull();
    const rec = ns.get(a);
    expect(rec.url).toBe("/x");
    expect(rec.status).toBe("inflight");
    expect(ns.get(999)).toBeNull();
  });
});
