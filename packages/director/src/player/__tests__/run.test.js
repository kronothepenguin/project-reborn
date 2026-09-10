import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { run } from "../run.js";
import { WorkerHost } from "../worker-host.js";

// Minimal in-process Worker mock per 001 research R1.
class MockWorker extends EventTarget {
  constructor(url, opts) {
    super();
    this.url = url;
    this.opts = opts;
    this.posted = [];
    this.terminated = false;
  }
  postMessage(msg, transfer) {
    this.posted.push({ msg, transfer });
    // simulate a real worker: after `init` it boots and replies `ready`
    if (msg && msg.kind === "init") {
      queueMicrotask(() =>
        this.dispatchEvent(new MessageEvent("message", { data: { kind: "ready", detail: {} } }))
      );
    }
  }
  terminate() {
    this.terminated = true;
  }
}

describe("run() — runner-core (008 R7/US1)", () => {
  let worker;
  beforeEach(() => {
    worker = new MockWorker("blob://worker");
    const MockWorkerClass = class extends MockWorker {
      constructor(url, opts) {
        super(url, opts);
        return worker; // constructor returns the shared instance
      }
    };
    vi.stubGlobal("Worker", MockWorkerClass);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("run(bundleUrl) spawns a worker, init carries the bundleUrl, reaches ready", async () => {
    const handle = run("https://x/habbo/index.js", { canvas: null, externalParams: [] });
    await vi.waitFor(() => expect(handle.ready).toBe(true));
    // the host spawns a bootstrap worker (the WORKER imports the bundle — C7)
    const initMessage = worker.posted.map((p) => p.msg).find((m) => m.kind === "init");
    expect(initMessage).toBeTruthy();
    expect(initMessage.bundleUrl).toBe("https://x/habbo/index.js");
    expect(initMessage.externalParams).toEqual([]);
  });

  it("handle.stop()/destroy() post the protocol messages and terminate", async () => {
    const handle = run("https://x/habbo/index.js");
    await vi.waitFor(() => expect(handle.ready).toBe(true));
    handle.stop();
    expect(worker.posted.map((p) => p.msg).some((m) => m.kind === "stop")).toBe(true);
    handle.destroy();
    expect(worker.posted.map((p) => p.msg).some((m) => m.kind === "destroy")).toBe(true);
    expect(worker.terminated).toBe(true);
    expect(handle.destroyed).toBe(true);
  });

  it("handle.stop()/destroy() post the protocol messages and terminate", async () => {
    const handle = run("https://x/habbo/index.js");
    await vi.waitFor(() => expect(handle.ready).toBe(true));
    handle.stop();
    expect(worker.posted.some((p) => p.msg.kind === "stop")).toBe(true);
    handle.destroy();
    expect(worker.posted.some((p) => p.msg.kind === "destroy")).toBe(true);
    expect(worker.terminated).toBe(true);
    expect(handle.destroyed).toBe(true);
  });

  it("destroy is idempotent", async () => {
    const handle = run("https://x/habbo/index.js");
    await vi.waitFor(() => expect(handle.ready).toBe(true));
    handle.destroy();
    handle.destroy();
    expect(worker.terminated).toBe(true);
  });

  it("relays paint messages as CustomEvent('paint') on the handle (009 T001)", async () => {
    const handle = run("https://x/habbo/index.js");
    await vi.waitFor(() => expect(handle.ready).toBe(true));
    const paint = { kind: "paint", detail: { imageData: { data: [1, 2, 3] }, width: 640, height: 480, seq: 7 } };
    const onPaint = vi.fn();
    handle.addEventListener("paint", onPaint);
    worker.dispatchEvent(new MessageEvent("message", { data: paint }));
    expect(onPaint).toHaveBeenCalledTimes(1);
    const ev = onPaint.mock.calls[0][0];
    expect(ev.type).toBe("paint");
    expect(ev.detail.imageData.data).toEqual([1, 2, 3]);
    expect(ev.detail.seq).toBe(7);
  });
});