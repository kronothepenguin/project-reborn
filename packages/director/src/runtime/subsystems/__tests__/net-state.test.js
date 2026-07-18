import { describe, it, expect, beforeEach, vi } from "vitest";
import { NetState } from "../net-state.js";

describe("NetState", () => {
  let state;
  beforeEach(() => {
    state = new NetState();
  });

  describe("begin / nextId", () => {
    it("allocates a unique monotonic netID per call", () => {
      const a = state.begin();
      const b = state.begin();
      expect(typeof a).toBe("number");
      expect(b).toBeGreaterThan(a);
    });

    it("records the initial inflight status with an AbortController", () => {
      const id = state.begin();
      expect(state.isDone(id)).toBe(false);
      expect(state.isError(id)).toBe(false);
    });

    it("uses a caller-supplied AbortController when provided", () => {
      const ac = new AbortController();
      const id = state.begin({ abortController: ac });
      state.abort(id);
      expect(ac.signal.aborted).toBe(true);
    });

    it("stores the requested URL for diagnostics", () => {
      const id = state.begin({ url: "https://example.com/x" });
      const rec = state.ops.get(id);
      expect(rec.url).toBe("https://example.com/x");
    });
  });

  describe("update / status accessors", () => {
    it("marks a record done and exposes textResult + mime", () => {
      const id = state.begin();
      state.update(id, { status: "done", data: "hello", mime: "text/plain" });
      expect(state.isDone(id)).toBe(true);
      expect(state.textResult(id)).toBe("hello");
      expect(state.mime(id)).toBe("text/plain");
    });

    it("marks a record error and exposes the error via streamStatus", () => {
      const id = state.begin();
      const err = new Error("boom");
      state.update(id, { status: "error", error: err });
      expect(state.isError(id)).toBe(true);
      const s = state.streamStatus(id);
      expect(s.status).toBe("error");
      expect(s.error).toBe("boom");
    });

    it("lastModDate returns null by default and a Date when set", () => {
      const id = state.begin();
      expect(state.lastModDate(id)).toBeNull();
      const d = new Date("Mon, 01 Jan 2024 00:00:00 GMT");
      state.update(id, { lastMod: d });
      expect(state.lastModDate(id)).toBe(d);
    });

    it("returns documented defaults for unknown netIDs", () => {
      expect(state.isDone(999)).toBe(false);
      expect(state.isError(999)).toBe(false);
      expect(state.textResult(999)).toBe("");
      expect(state.mime(999)).toBe("");
      expect(state.lastModDate(999)).toBeNull();
      const s = state.streamStatus(999);
      expect(s).toEqual({ status: "done", bytesSoFar: 0, error: "" });
    });
  });

  describe("abort", () => {
    it("calls AbortController.abort() and marks the record errored", () => {
      const id = state.begin();
      const ac = state.ops.get(id).abortController;
      const spy = vi.spyOn(ac, "abort");
      state.abort(id);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(state.isError(id)).toBe(true);
    });

    it("is idempotent for unknown ids", () => {
      expect(() => state.abort(999)).not.toThrow();
    });
  });

  describe("forget", () => {
    it("drops the record", () => {
      const id = state.begin();
      state.forget(id);
      expect(state.ops.has(id)).toBe(false);
    });
  });

  describe("gotoNetMoviePendingUrl (FR-033 main-thread relay)", () => {
    it("starts null", () => {
      expect(state.gotoNetMoviePendingUrl).toBeNull();
    });

    it("setGotoNetMoviePending stores the URL; take clears and returns it", () => {
      state.setGotoNetMoviePending("https://example.com/movie");
      expect(state.gotoNetMoviePendingUrl).toBe("https://example.com/movie");
      expect(state.takeGotoNetMoviePending()).toBe("https://example.com/movie");
      expect(state.gotoNetMoviePendingUrl).toBeNull();
      // second take returns null
      expect(state.takeGotoNetMoviePending()).toBeNull();
    });
  });
});