# Quickstart — Member Classes (010)

**Gate**: `pnpm --filter @project-reborn/director test` — 342 green (51 files).

## The 19 member media classes

`@project-reborn/director` exports all of them from `engine/core/media/index.js`:

- **8 functional** (documented fields only — payload stays on `MemberObject.payload`, D2):
  `BitmapMember`, `ButtonMember`, `ColorPaletteMember`, `CursorMember`, `FieldMember`,
  `FontMember`, `SoundMember`, `TextMember`.
- **11 documented stubs** (excluded media types, empty surface): `AnimatedGIFMember`,
  `DVDMember`, `FilmLoopMember`, `FlashComponentMember`, `FlashMember`, `LinkedMovieMember`,
  `QuickTimeMember`, `RealMediaMember`, `Shockwave3DMember`, `ShockwaveAudioMember`,
  `VectorShapeMember`, `WindowsMediaMember`.

## Creating members at runtime — `newMember()`

```js
_movie.newMember(Symbol.for("button")); // -> ButtonMember, type = #button
_movie.newMember("sound");              // string form -> SoundMember

// registered into the FIRST EMPTY cast-library slot of the active context:
member.number;      // next free number in slot
member.castLibNum;  // owning castLib number
_movie.member[2];   // reachable via the castLib afterwards
```

- Symbol or string, both accepted (`"button"` ≡ `Symbol.for("button")`).
- Unknown types (`#havok`, `#digitalVideo`, …) → a generic `MemberObject` with that type.
- Without an active context the member is returned **unregistered** (number 0).

## Field defaults worth knowing

```js
new ButtonMember().hilite;                 // false
new ColorPaletteMember().paletteMapping;   // Symbol.for("casePalette")  (#casePalette)
new CursorMember().interval;               // 100 ms per frame of the animation
new FontMember().characterSet;             // Symbol.for("system")
new SoundMember();                         // no APIs of its own (Member surface only)
```

## Notes

- Pack payload (`data`, `text`, `audioBytes`, …) is read via `member.payload` (008/007 use
  it); classes do NOT mirror it into fields (D2 — no duplication).
- Rendering stays in 008; these classes only surface Director's documented member fields.
- Scripting objects (Fileio/NetLingo/SpeechXtra/XMLParser) are the remaining split → 011.