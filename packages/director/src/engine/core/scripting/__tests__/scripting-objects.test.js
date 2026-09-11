import { describe, it, expect, vi, afterEach } from "vitest";
import { xtra } from "../../../../api/methods/xtra.js";
import { FileioObject, NetLingoObject, SpeechXtraObject, XMLParserObject } from "../index.js";
import { DirectorContext } from "../../../subsystem/context.js";
import { setActiveDirectorContext } from "../../../subsystem/accessor.js";
import { netTextResult } from "../../../../api/methods/netTextResult.js";

describe("scripting objects (011)", () => {
  afterEach(() => setActiveDirectorContext(null));

  it("xtra('fileio'|'netlingo'|'speechxtra'|'xmlparser') returns the classes", () => {
    expect(new xtra("fileio")).toBeInstanceOf(FileioObject);
    expect(new xtra("netlingo")).toBeInstanceOf(NetLingoObject);
    expect(new xtra("speechxtra")).toBeInstanceOf(SpeechXtraObject);
    expect(new xtra("xmlparser")).toBeInstanceOf(XMLParserObject);
  });

  it("xtra unknown + xtra case-insensitive", () => {
    expect(xtra("nope")).toBeNull();
    expect(new xtra("NetLingo")).toBeInstanceOf(NetLingoObject);
  });

  it("Fileio exposes the documented method summary surface", () => {
    const f = new FileioObject();
    for (const m of ["closeFile", "createFile", "delete", "displayOpen", "displaySave",
      "error", "fileName", "getFinderInfo", "getLength", "getOSDirectory", "getPosition",
      "openFile", "readChar", "readFile", "readLine", "readToken", "readWord",
      "setFilterMask", "setFinderInfo", "setNewLineConversion", "setPosition", "status",
      "version", "writeChar", "writeReturn", "writeString"]) {
      expect(typeof f[m], m).toBe("function");
    }
    expect(f.getOSDirectory()).toBe("");
    expect(f.getLength()).toBe(0);
  });

  it("SpeechXtra exposes the documented surface (deterministic stubs)", () => {
    const s = new SpeechXtraObject();
    expect(s.voiceCount()).toBe(0);
    expect(s.voiceGetAll()).toEqual([]);
    // documented fluent-ish behavior: speaking flips a state bit
    s.voiceSpeak("hello");
    expect(s.voiceState?.()).toBe(0); // runtime has no TTS engine
  });

  it("XMLParser parses an XML string into a document (count/name/doneParsing)", () => {
    const x = new XMLParserObject();
    const ok = x.parseString("<root><a>1</a><b>2</b></root>");
    expect(ok).toBe(true);
    expect(x.doneParsing()).toBe(true);
    expect(x.name).toBe("root");
    expect(x.count()).toBe(2);
  });

  it("XMLParser reports malformed XML + empty parse as error", () => {
    const x = new XMLParserObject();
    expect(x.parseString("<broken><")).toBe(false);
    expect(x.getError()).toBeTruthy();
    expect(x.parseString("")).toBe(false);
  });

  it("NetLingo owns the net state: getNetText + accessors work through it", async () => {
    const ctx = new DirectorContext({});
    ctx.activate();
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve({
      ok: true, text: async () => "hello", headers: new Headers(),
    })));
    const nl = ctx.netLingo;
    const id = nl.getNetText("http://x");
    expect(typeof id).toBe("number");
    await vi.waitFor(() => expect(nl.netDone(id)).toBe(true));
    expect(nl.netTextResult(id)).toBe("hello");
    // the same id is visible through the top-level 006 delegates
    expect(netTextResult(id)).toBe("hello");
    vi.unstubAllGlobals();
  });

  it("context owns exactly one NetLingo; netState is its internal registry", () => {
    const ctx = new DirectorContext({});
    expect(ctx.netLingo).toBeInstanceOf(NetLingoObject);
    expect(ctx.netLingo.netState).toBe(ctx.netState);
  });
});