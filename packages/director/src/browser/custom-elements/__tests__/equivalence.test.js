import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "../index.js";
import { run } from "../../../player/run.js";

class MockWorker extends EventTarget {
  constructor(url, opts) {
    super();
    this.url = url;
    this.opts = opts;
    this.posted = [];
    this.terminated = false;
    this.autoReady = true;
  }
  postMessage(msg, transfer) {
    this.posted.push({ msg, transfer });
    if (msg && msg.kind === "init" && this.autoReady) {
      queueMicrotask(() =>
        this.dispatchEvent(new MessageEvent("message", { data: { kind: "ready", detail: { name: "" } } }))
      );
    }
  }
  emit(kind, detail) {
    this.dispatchEvent(new MessageEvent("message", { data: { kind, detail } }));
  }
  terminate() {
    this.terminated = true;
  }
}

const MOVIE = {
  name: "eq",
  totalCastSlots: 1,
  casts: [{ kind: "cast", name: "Internal", members: [{ kind: "member", name: "Logo", mediaType: "bitmap", payload: { data: "" } }] }],
  options: { tempo: 30, width: 640, height: 480, src: "" },
};

describe("SC-010 equivalence — element ≡ imperative run() (009)", () => {
  let workers;
  beforeEach(() => {
    workers = [];
    document.body.innerHTML = "";
    const MockWorkerClass = class extends MockWorker {
      constructor(url, opts) {
        super(url, opts);
        workers.push(this);
        return this;
      }
    };
    vi.stubGlobal("Worker", MockWorkerClass);
  });
  afterEach(() => {
    document.body.innerHTML = "";
    vi.unstubAllGlobals();
  });

  it("element and imperative run() reach the same handle semantics", async () => {
    const params = [
      { name: "sw1", value: "1" },
      { name: "sw2", value: "0" },
    ];

    // imperative path
    const handle = run(MOVIE, { externalParams: params });
    const pending = [];
    for (const t of ["ready", "externalEvent", "error", "gotoNetMovie", "gotoNetPage"]) {
      handle.addEventListener(t, (e) => pending.push([t, e.detail]));
    }
    await vi.waitFor(() => expect(workers[0].posted.some((p) => p.msg.kind === "init")).toBe(true));
    workers[0].emit("externalEvent", { name: "x", args: [1] });

    // declarative path (element)
    const el = document.createElement("x-embed");
    el.setAttribute("src", "https://x/habbo/index.js");
    el.innerHTML = '<x-param name="sw1" value="1"><x-param name="sw2" value="0">';
    document.body.appendChild(el);

    await vi.waitFor(() => expect(el.handle).not.toBeNull());

    const initImperative = workers[0].posted.map((p) => p.msg).find((m) => m.kind === "init");
    const initElement = workers[1].posted.map((p) => p.msg).find((m) => m.kind === "init");

    // identical bootstrap snapshot
    expect(initElement.externalParams).toEqual(initImperative.externalParams);
    expect(initElement.externalParams).toEqual(params);

    // identical event surface: externalEvent relayed on both
    const elSeen = [];
    el.addEventListener("externalEvent", (e) => elSeen.push(e.detail));
    workers[1].emit("externalEvent", { name: "y", args: [2] });
    expect(elSeen).toEqual([{ name: "y", args: [2] }]);

    // both handles have the same protocol surface
    expect(typeof el.handle.start).toBe("function");
    expect(typeof el.handle.stop).toBe("function");
    expect(typeof el.handle.destroy).toBe("function");
    expect(typeof handle.start).toBe("function");
    expect(typeof handle.stop).toBe("function");
    expect(typeof handle.destroy).toBe("function");

    el.remove();
    expect(workers[1].terminated).toBe(true);
  });

  it("imperative run() with a URL posts an init; declarative is a wrapper over the same run()", async () => {
    const handle = run("https://x/habbo/index.js", { externalParams: [{ name: "a", value: "b" }] });
    await vi.waitFor(() => expect(handle.ready).toBe(true));
    const init = workers[0].posted.map((p) => p.msg).find((m) => m.kind === "init");
    expect(init.bundleUrl).toBe("https://x/habbo/index.js");
    expect(init.externalParams).toEqual([{ name: "a", value: "b" }]);
  });
});