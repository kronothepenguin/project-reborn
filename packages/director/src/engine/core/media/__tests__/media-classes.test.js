import { describe, it, expect } from "vitest";
import {
  BitmapMember, ButtonMember, ColorPaletteMember, CursorMember,
  FieldMember, FontMember, SoundMember, TextMember,
  AnimatedGIFMember, DVDMember, FilmLoopMember, FlashComponentMember,
  FlashMember, LinkedMovieMember, QuickTimeMember, RealMediaMember,
  Shockwave3DMember, ShockwaveAudioMember, VectorShapeMember, WindowsMediaMember,
} from "../index.js";
import { MemberObject } from "../../member.js";

describe("media member classes (010 T001–T005)", () => {
  const functional = {
    BitmapMember, ButtonMember, ColorPaletteMember,
    CursorMember, FieldMember, FontMember, SoundMember, TextMember,
  };
  const stubs = {
    AnimatedGIFMember, DVDMember, FilmLoopMember, FlashComponentMember,
    FlashMember, LinkedMovieMember, QuickTimeMember, RealMediaMember,
    Shockwave3DMember, ShockwaveAudioMember, VectorShapeMember, WindowsMediaMember,
  };

  it("all 8 functional classes exist, extend MemberObject, and instantiate", () => {
    for (const [name, Cls] of Object.entries(functional)) {
      expect(Cls, name).toBeTruthy();
      expect(Cls.prototype instanceof MemberObject, name).toBe(true);
      expect(new Cls(), name).toBeInstanceOf(Cls);
    }
  });

  it("all 11 excluded stubs exist, extend MemberObject, and instantiate empty", () => {
    for (const [name, Cls] of Object.entries(stubs)) {
      expect(Cls, name).toBeTruthy();
      expect(Cls.prototype instanceof MemberObject, name).toBe(true);
      const inst = new Cls();
      expect(inst, name).toBeInstanceOf(Cls);
    }
  });

  it("ButtonMember documents + defaults hilite", () => {
    const b = new ButtonMember();
    expect(b.hilite).toBe(false);
  });

  it("ColorPaletteMember documents color()/palette/paletteMapping/depth", () => {
    const p = new ColorPaletteMember();
    expect(typeof p.color).toBe("function");
    expect(p.palette).toBe(0);
    expect(p.paletteMapping).toBe(Symbol.for("casePalette"));
    expect(p.depth).toBe(8);
  });

  it("CursorMember documents castMemberList/cursorSize/hotSpot/interval", () => {
    const c = new CursorMember();
    expect(Array.isArray(c.castMemberList)).toBe(true);
    expect(c.hotSpot).toBeTruthy();
    expect(c.hotSpot.locH).toBe(0);
    expect(c.interval).toBe(100);
  });

  it("FontMember documents bitmapSizes/characterSet/fontStyle/originalFont/recordFont", () => {
    const f = new FontMember();
    expect(f.bitmapSizes).toEqual([]);
    expect(f.characterSet).toBe(Symbol.for("system"));
    expect(f.fontStyle).toBe("");
    expect(f.originalFont).toBe("");
    expect(f.recordFont).toBe(false);
  });

  it("SoundMember has no APIs of its own (Member surface only)", () => {
    const s = new SoundMember();
    expect(s).toBeInstanceOf(SoundMember);
    expect(s.name).toBe("");
    expect(s.number).toBe(0);
  });

  it("media classes extend over generic members and keep payload off the fields (D2)", () => {
    const b = new BitmapMember(Symbol.for("bitmap"), "logo");
    expect(b.type).toBe(Symbol.for("bitmap"));
    expect(b.name).toBe("logo");
    expect(b.payload).toBeUndefined(); // payload stays on the ingest-built member
  });
});