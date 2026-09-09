import { describe, it, expect, vi, afterEach } from "vitest";
import { MainThreadImperativeHandle } from "../run.js";
import { DirectorContext } from "../../engine/subsystem/context.js";
import { setActiveDirectorContext } from "../../engine/subsystem/accessor.js";

class MockWorker extends EventTarget {
  constructor() { super(); this.posted = []; this.terminated = false; }
  postMessage(msg) { this.posted.push(msg); }
  terminate() { this.terminated = true; }
}

function makeHandle() {
  const w = new MockWorker();
  vi.stubGlobal("Worker", class extends MockWorker { constructor() { super(); return w; } });
  const handle = new MainThreadImperativeHandle("https://x/bundle.js", {});
  vi.unstubAllGlobals();
  return { handle, worker: w };
}

describe("net relay + externalEvent bridge (008 R9/US5)", () => {
  afterEach(() => setActiveDirectorContext(null));

  it("handle relays gotoNetMovie / gotoNetPage as events", () => {
    const { handle } = makeHandle();
    const seen = [];
    handle.addEventListener("gotoNetMovie", (e) => seen.push(["movie", e.detail?.url]));
    handle.addEventListener("gotoNetPage", (e) => seen.push(["page", e.detail?.url, e.detail?.target]));
    handle._onMessage({ data: { kind: "gotoNetMovie", detail: { url: "/next.dcr" } } });
    handle._onMessage({ data: { kind: "gotoNetPage", detail: { url: "https://x", target: "_blank" } } });
    expect(seen).toEqual([
      ["movie", "/next.dcr"],
      ["page", "https://x", "_blank"],
    ]);
    handle.destroy();
  });

  it("externalEvent (in-worker) reaches the handle as a DOM CustomEvent", () => {
    const { handle } = makeHandle();
    const seen = [];
    handle.addEventListener("externalEvent", (e) => seen.push(e.detail));
    handle._onMessage({ data: { kind: "externalEvent", detail: { name: "foo", args: [1, "a"] } } });
    expect(seen).toEqual([{ name: "foo", args: [1, "a"] }]);
    handle.destroy();
  });
});