import { describe, it, expect, beforeEach } from "vitest";
import { getStreamStatus } from "../getStreamStatus.js";
import { getNetText } from "../getNetText.js";
import { netDone } from "../netDone.js";
import { __resetForTests } from "../_netRegistry.js";

describe("getStreamStatus", () => {
  beforeEach(() => {
    __resetForTests();
  });

  it("is exported as a function", () => {
    expect(typeof getStreamStatus).toBe("function");
  });

  it("returns NoInformation for unknown netID", () => {
    const status = getStreamStatus(999);
    expect(status.state).toBe("NoInformation");
    expect(status.URL).toBe("");
    expect(status.bytesSoFar).toBe(0);
    expect(status.bytesTotal).toBe(0);
    expect(status.error).toBe("");
  });

  it("returns a status object with the expected keys", () => {
    const id = getNetText("http://example.com/x.txt");
    const status = getStreamStatus(id);
    expect(status).toHaveProperty("URL");
    expect(status).toHaveProperty("state");
    expect(status).toHaveProperty("bytesSoFar");
    expect(status).toHaveProperty("bytesTotal");
    expect(status).toHaveProperty("error");
  });

  it("tracks state transitions to Complete after success", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: { get: () => "text/plain" },
        text: async () => "data",
      }),
    );
    const id = getNetText("http://example.com/x.txt");
    await new Promise((r) => setTimeout(r, 0));
    const status = getStreamStatus(id);
    expect(status.state).toBe("Complete");
    expect(status.error).toBe("OK");
    expect(status.URL).toBe("http://example.com/x.txt");
    fetchSpy.mockRestore();
  });

  it("defaults to last transaction when no netID provided", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        headers: { get: () => "text/plain" },
        text: async () => "data",
      }),
    );
    const id = getNetText("http://example.com/last.txt");
    await new Promise((r) => setTimeout(r, 0));
    expect(getStreamStatus().URL).toBe("http://example.com/last.txt");
    expect(netDone(id)).toBe(true);
    fetchSpy.mockRestore();
  });
});
