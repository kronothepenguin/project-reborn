## REMOVED Requirements

### Requirement: director-core SHALL be the internal simulator layer for Director/Lingo

### Requirement: director-core SHALL remain stable across ligo-surface refactors

## ADDED Requirements

### Requirement: director-core SHALL be the private Director language-object layer

`director-core` SHALL implement Director language objects and the reference handles returned by Director factory functions, per MX 2004 Chapter 5 (Director Core Objects) and Chapter 6 (Media Types). It SHALL live under `packages/director/src/core/` and SHALL NOT be exported as a public subpath. It SHALL be consumed only by `director-lingo`, `director-syntax`, and `director-browser` within `@project-reborn/director`.

**Package**: `packages/director/`
**Source**: `packages/director/src/core/`
**Reference**: `docs/drmx2004_scripting_ref/` (`director_core_objects.txt`, `media_types.txt`).

At the state landed by this refactor change (see Out of Scope for follow-up work), the following existing classes stay in `core/` with their current names: `CastLibraryRef`, `Color`, `KeyRef`, `List`, `MouseRef`, `MovieRef`, `PlayerRef`, `Point`, `PropList`, `Rect`, `SoundChannelRef`, `SoundRef`, `SpriteRef`, `MemberRef`. Class renames (`XObject` convention) and additional system objects are follow-up changes that will update this spec.

#### Scenario: Core is not a public export
- **WHEN** the `packages/director/package.json` `exports` map is inspected
- **THEN** neither `./core` nor any subpath exposing `src/core/` is present

#### Scenario: Core is consumed internally only
- **WHEN** `director-lingo`, `director-syntax`, or `director-browser` needs a Director language object or reference handle
- **THEN** it imports from `../core/...` via a relative path; no public import path reaches `core`

#### Scenario: Core has no public export map entry
- **WHEN** a consumer outside `@project-reborn/director` attempts `import { ... } from "@project-reborn/director/core"`
- **THEN** the import fails because `./core` is not present in `packages/director/package.json` `exports`

### Requirement: director-core SHALL treat Director value data types as a separate concern (transition state)

`director-core` SHALL NOT be the permanent home of Director value data types (`List`, `PropList`, `Point`, `Rect`, `Color`); per the MX 2004 reference these are data types (Chapter 2, data types section), not Director core objects (Chapter 5), and belong in `director-runtime`.

At the state landed by this refactor change, the value-type files (`list.js`, `prop-list.js`, `point.js`, `rect.js`, `color.js`) STILL physically live in `src/core/` because this refactor is mechanical-only and does not move them. A follow-up change (`director-runtime-value-types`) moves them to `src/runtime/` and updates this requirement to reflect the post-move reality.

This requirement, in the refactor state, decrees that `director-core` does not OWN value data types as a language-object concern even though they temporarily live there, and their move to `director-runtime` is a tracked follow-up — not part of this change's diff.

At the state landed by this refactor change, the value-type files (`list.js`, `prop-list.js`, `point.js`, `rect.js`, `color.js`) STILL physically live in `src/core/` because this refactor is mechanical-only and does not move them. A follow-up change (`director-runtime-value-types`) moves them to `src/runtime/` and updates this requirement to reflect the post-move reality.

This requirement, in the refactor state, decrees that `director-core` does not OWN value data types as a language-object concern even though they temporarily live there, and their move to `director-runtime` is a tracked follow-up — not part of this change's diff.

#### Scenario (refactor state): Value types are still physically in core
- **WHEN** the `packages/director/src/core/` directory is inspected after this refactor
- **THEN** `list.js`, `prop-list.js`, `point.js`, `rect.js`, `color.js` are still present there (their move to `runtime/` is a follow-up change)

#### Scenario (target state, follow-up): Value types move to runtime
- **WHEN** the follow-up change `director-runtime-value-types` is archived
- **THEN** this requirement is updated by that change's delta to record that the files now live in `src/runtime/`, and the refactor-state scenario above is removed

### Requirement: director-core SHALL treat Symbol and String as native JavaScript

`director-core` SHALL NOT provide a wrapper class for `Symbol` or `String`. Ligo symbols (`#name`) are translated directly to `Symbol.for("name")` in JavaScript. Strings are native JS strings.

#### Scenario: No Symbol wrapper class
- **WHEN** any translated code uses `Symbol.for("name")`
- **THEN** `director-core` does not provide a `Symbol`-like class; the JS native `Symbol.for` is used directly

#### Scenario: No String wrapper class
- **WHEN** translated code uses a JS string literal
- **THEN** `director-core` does not provide a `String`-like class; the JS native string is used directly

### Requirement: director-core SHALL remain private across follow-up renames and additions

Any follow-up change that renames existing classes (e.g. `MovieRef` → `MovieObject`), adds new core objects (e.g. `SystemObject`, `WindowObject`, `GlobalObject`), adds media type subclasses, adds `KEY_CODES`, or adds DVD/3D rejector classes SHALL update this spec via that follow-up change's delta. This refactor change locks the privacy and the layer role only; it does not rename classes or add new ones.

#### Scenario: Follow-up change updates this spec
- **WHEN** a follow-up change (e.g. `director-core-xobjects`) is archived
- **THEN** it modifies this `director-core` spec via its own delta spec to reflect the rename it actually performs; this refactor change does not anticipate that rename