import { describe, it, expect, afterEach } from "vitest";
import { setActiveDirectorContext } from "../../../engine/subsystem/accessor.js";
import { DirectorContext } from "../../../engine/subsystem/context.js";
import { member } from "../member.js";
import { castLib } from "../castLib.js";
import { marker } from "../marker.js";
import { go } from "../go.js";
import { halt } from "../halt.js";
import { beep } from "../beep.js";
import { alert } from "../alert.js";
import { cursor } from "../cursor.js";
import { quit } from "../quit.js";
import { sound } from "../sound.js";
import { sprite } from "../sprite.js";
import { window } from "../window.js";
import { findEmpty } from "../findEmpty.js";
import { findLabel } from "../findLabel.js";
import { lastClick } from "../lastClick.js";
import { netAbort } from "../netAbort.js";

describe("stateful methods with NO active context (006 R8 neutrals)", () => {
  afterEach(() => setActiveDirectorContext(null));

  it("resolve to default instances and never throw", () => {
    expect(member("x")).toBeNull();
    expect(castLib(1)).toBeNull();
    // sound(1) returns a SoundChannelObject per docs (not null)
    const ch = sound(1);
    expect(ch).toBeDefined();
    expect(typeof ch).toBe("object");
    expect(sprite(1)).toBeNull();
    expect(window("w")).toBeNull();
  });

  it("movie/player methods execute against defaults without throwing", () => {
    expect(() => go(1)).not.toThrow();
    expect(() => halt()).not.toThrow();
    expect(() => beep(0)).not.toThrow();
    expect(() => alert("hi")).not.toThrow();
    expect(() => cursor(0)).not.toThrow();
    expect(() => quit()).not.toThrow();
    expect(() => marker(1)).not.toThrow();
  });

  it("pure/creator methods always compute", () => {
    expect(findEmpty()).toBeDefined();
    expect(findLabel("x")).toBeDefined();
    expect(lastClick()).toBeDefined();
  });

  it("netAbort with no registry entry is a no-op", () => {
    expect(() => netAbort("http://missing", 999)).not.toThrow();
  });

  it("with an active context the same methods route to its instances", () => {
    const ctx = new DirectorContext({ score: { frames: [{ marker: "a" }] } });
    ctx.activate();
    expect(member("x")).toBeNull(); // empty castLib
    // marker() body is a MovieObject stub until 003; must not throw
    expect(() => marker(1)).not.toThrow();
    expect(castLib(1)).toBeNull();
    ctx.destroy();
  });
});