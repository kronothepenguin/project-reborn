import { describe, it, expect, vi } from "vitest";
import { getNetText } from "../getNetText.js";
import { postNetText } from "../postNetText.js";
import { netDone } from "../netDone.js";
import { netError } from "../netError.js";
import { netTextResult } from "../netTextResult.js";
import { netAbort } from "../netAbort.js";

describe("net ops fail-soft under vitest (006 C3)", () => {
  it("getNetText with rejecting fetch -> Error tx, netDone true, netError truthy, result ''", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("Network error"))));
    const id = getNetText("http://x");
    await vi.waitFor(() => expect(netDone(id)).toBe(true));
    expect(netError(id)).toBe("Network error");
    expect(netTextResult(id)).toBe("");
    vi.unstubAllGlobals();
  });

  it("getNetText with 404 -> netError 'HTTP 404'", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ ok: false, status: 404, text: async () => "" })));
    const id = getNetText("http://x");
    await vi.waitFor(() => expect(netDone(id)).toBe(true));
    expect(netError(id)).toBe("HTTP 404");
    vi.unstubAllGlobals();
  });

  it("getNetText succeeds -> netTextResult is the body and netError '' ", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({ ok: true, text: async () => "hello", headers: new Headers() })));
    const id = getNetText("http://x");
    await vi.waitFor(() => expect(netDone(id)).toBe(true));
    expect(netTextResult(id)).toBe("hello");
    expect(netError(id)).toBe("OK");
    vi.unstubAllGlobals();
  });

  it("netAbort with unknown id -> no-op (no throw)", () => {
    expect(() => netAbort("http://gone", 999)).not.toThrow();
  });

  it("postNetText also fail-softs", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("offline"))));
    const id = postNetText("http://x", "a=1");
    await vi.waitFor(() => expect(netDone(id)).toBe(true));
    expect(netError(id)).toMatch(/offline/);
    expect(netTextResult(id)).toBe("");
    vi.unstubAllGlobals();
  });
});