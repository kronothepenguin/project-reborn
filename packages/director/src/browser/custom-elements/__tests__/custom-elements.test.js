import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "../index.js"; // registers x-object / x-embed / x-param on import

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
    if (msg && msg.kind === "init") {
      queueMicrotask(() =>
        this.dispatchEvent(new MessageEvent("message", { data: { kind: "ready", detail: { name: "" } } }))
      );
    }
  }
  terminate() {
    this.terminated = true;
  }
}

function mount(attrs = {}, children = "") {
  const el = document.createElement("x-embed");
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (children) el.innerHTML = children;
  document.body.appendChild(el);
  return el;
}

describe("custom elements over run() (009)", () => {
  let worker;
  beforeEach(() => {
    worker = null;
    document.body.innerHTML = "";
    const MockWorkerClass = class extends MockWorker {
      constructor(url, opts) {
        super(url, opts);
        worker = this;
        return worker;
      }
    };
    vi.stubGlobal("Worker", MockWorkerClass);
  });
  afterEach(() => {
    document.body.innerHTML = "";
    vi.unstubAllGlobals();
  });

  it("connect: canvas inserted + sized; init carries bundleUrl + externalParams snapshot", async () => {
    const el = mount({ src: "https://x/habbo/index.js", width: "320", height: "240" }, '<x-param name="sw1" value="1"><x-param name="sw2" value="0">');
    await vi.waitFor(() => expect(el.handle).not.toBeNull());

    const canvas = el.querySelector("canvas");
    expect(canvas).toBeTruthy();
    expect(canvas.width).toBe(320);
    expect(canvas.height).toBe(240);
    expect(canvas.style.width).toBe("100%");

    const init = worker.posted.map((p) => p.msg).find((m) => m.kind === "init");
    expect(init.bundleUrl).toBe("https://x/habbo/index.js");
    expect(init.externalParams).toEqual([
      { name: "sw1", value: "1" },
      { name: "sw2", value: "0" },
    ]);
    expect(init.offscreenCanvas).toBeUndefined(); // jsdom: no transfer → paint fallback
  });

  it("auto-starts after ready; tempo attribute posts setTempo before start", async () => {
    const el = mount({ src: "https://x/habbo/index.js", tempo: "15" });
    await vi.waitFor(() => expect(worker.posted.map((p) => p.msg).some((m) => m.kind === "start")).toBe(true));

    const kinds = worker.posted.map((p) => p.msg.kind);
    expect(kinds.indexOf("setTempo")).toBeLessThan(kinds.indexOf("start"));
    expect(worker.posted.map((p) => p.msg).find((m) => m.kind === "setTempo").tempo).toBe(15);
  });

  it("relays handle externalEvent / paint onto the element; paint sets .frame", async () => {
    const el = mount({ src: "https://x/habbo/index.js" });
    await vi.waitFor(() => expect(el.handle).not.toBeNull());

    const seen = [];
    el.addEventListener("externalEvent", (e) => seen.push(e.detail));
    el.handle._onMessage({ data: { kind: "externalEvent", detail: { name: "bob", args: [1] } } });
    expect(seen).toEqual([{ name: "bob", args: [1] }]);

    el.handle._onMessage({ data: { kind: "paint", detail: { imageData: {}, width: 640, height: 480, seq: 9 } } });
    expect(el.frame).toBe(9);
  });

  it("forwards input translated element-relative → stage space", async () => {
    const el = mount({ src: "https://x/habbo/index.js", width: "640", height: "480" });
    await vi.waitFor(() => expect(el.handle).not.toBeNull());
    el.getBoundingClientRect = () => ({ left: 0, top: 0, width: 320, height: 240 });

    el.dispatchEvent(new KeyboardEvent("keydown", { key: "q", keyCode: 81, bubbles: true }));
    el.dispatchEvent(new MouseEvent("mousemove", { clientX: 160, clientY: 120, bubbles: true }));
    await vi.waitFor(() => expect(worker.posted.some((p) => p.msg.kind === "mousemove")).toBe(true));

    const key = worker.posted.map((p) => p.msg).find((m) => m.kind === "keydown");
    expect(key.key).toBe("q");
    expect(key.keyCode).toBe(81);

    const move = worker.posted.map((p) => p.msg).find((m) => m.kind === "mousemove");
    expect(move.clientX).toBe(320);
    expect(move.clientY).toBe(240);
  });

  it("disconnect destroys the handle (worker terminated, idempotent)", async () => {
    const el = mount({ src: "https://x/habbo/index.js" });
    await vi.waitFor(() => expect(el.handle).not.toBeNull());
    const handle = el.handle;
    expect(handle.destroyed).toBe(false);
    document.body.innerHTML = "";
    expect(handle.destroyed).toBe(true);
    expect(worker.terminated).toBe(true);
  });

  it("x-object is an alias with the same surface", async () => {
    const el = document.createElement("x-object");
    el.setAttribute("src", "https://x/habbo/index.js");
    document.body.appendChild(el);
    await vi.waitFor(() => expect(el.handle).not.toBeNull());
    expect(typeof el.handle.start).toBe("function");
  });
});