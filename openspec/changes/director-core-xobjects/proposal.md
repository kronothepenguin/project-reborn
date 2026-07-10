## Why

`director-core` currently models Director MX 2004 Core Objects as `*Ref` classes (`MovieRef`, `SpriteRef`, etc.) and ships only a subset of the system objects documented in Chapter 5 (`director_core_objects.txt`). The locked `director-core` spec names the `XObject` rename and the addition of the missing system objects as the explicit follow-up (`director-core-xobjects`). This change lands that follow-up: it adopts the `XObject` naming convention the spec already references and adds the three missing Chapter-5 objects (`Global`, `Sprite Channel`, `System`, `Window`) so the core object set matches the MX 2004 reference surface the Lingo layer translates against.

## What Changes

- **BREAKING**: Rename every existing `*Ref` system-object class to the `XObject` convention per Chapter 5 names:
  - `CastLibraryRef` → `CastLibraryObject` (Cast Library)
  - `KeyRef` → `KeyObject` (Key)
  - `MemberRef` → `MemberObject` (Member)
  - `MouseRef` → `MouseObject` (Mouse)
  - `MovieRef` → `MovieObject` (Movie)
  - `PlayerRef` → `PlayerObject` (Player)
  - `SoundRef` → `SoundObject` (Sound)
  - `SoundChannelRef` → `SoundChannelObject` (Sound Channel)
  - `SpriteRef` → `SpriteObject` (Sprite)
  - Singletons (`_key`, `_mouse`, `_movie`, `_player`, `_sound`) keep their underscore private-binding names but are instances of the renamed `*Object` classes.
- Add the missing Director Core Objects (Chapter 5) as new `*Object` classes: `GlobalObject`, `SpriteChannelObject`, `SystemObject`, `WindowObject`.
- Flesh out each Core Object to expose the methods and properties documented for its MX 2004 counterpart in `docs/drmx2004_scripting_ref/director_core_objects.txt`, with method/property semantics drawn from `methods.txt` and `properties.txt`. (Per-object coverage maps are in `design.md`.)
- Update `packages/director/src/core/index.js` to export the renamed and new `*Object` classes; remove the old `*Ref` exports.
- Update all internal consumers (`director-lingo` factory functions, `director-syntax`, `director-browser`) to import the renamed classes.
- Update existing `core/__tests__` to use the new class names and add coverage for the new objects and the newly documented methods/properties.

## Capabilities

### New Capabilities
<!-- None — all objects belong to the existing director-core capability. -->

### Modified Capabilities
- `director-core`: Rename the system-object reference classes to the `XObject` convention and add the missing Chapter-5 Core Objects (`GlobalObject`, `SpriteChannelObject`, `SystemObject`, `WindowObject`); require each Core Object to expose its documented methods and properties.

## Impact

- **Code**: `packages/director/src/core/` (every `*-ref.js` renamed to `*-object.js`, new `global-object.js` / `sprite-channel-object.js` / `system-object.js` / `window-object.js`), `packages/director/src/core/index.js`, `packages/director/src/lingo/` factory functions (`castLib`, `member`, `sprite`, `sound`, `channel`) and any `../core/...` relative imports across `src/lingo`, `src/syntax`, `src/browser`, `src/runtime`.
- **APIs**: Private `director-core` only (no public subpath — `core` stays out of `package.json` `exports`). The rename is breaking for internal importers but invisible to translated Lingo code, which references objects via the `_movie` / `_player` / `_sound` / `_key` / `_mouse` / `_system` / `_global` host bindings and the `castLib()` / `member()` / `sprite()` / `channel()` / `sound()` / `window()` factory functions.
- **Tests**: `packages/director/src/core/__tests__/*` must be renamed and updated; new object tests added. `vitest` is the runner.
- **Specs**: Updates the `director-core` spec via this change's delta (the locked spec already anticipates this rename in its "Out of Scope / follow-up" note).
- **Docs**: Per-object method/property sets are extracted from `docs/drmx2004_scripting_ref/director_core_objects.txt`, `methods.txt`, and `properties.txt`.