# director-core Specification

## Purpose
TBD - created by archiving change director-specs-foundation. Update Purpose after archive.
## Requirements
### Requirement: director-core SHALL codify the Director data-type set

`director-core` SHALL be the single source of truth for the categorization of Director data types used by the `@project-reborn/director` Lingo surface. The data-type set is partitioned into three buckets:

- **Lingo value data types** — implemented as classes in `director-core` under `src/core/`: `List`, `PropList`, `Point`, `Rect`, `Color`.
- **Native JavaScript-mapped data types** — NOT wrapped by `director-core`; translated Ligo code uses the JavaScript native equivalent directly: `Array`, `Boolean`, `Constant`, `Date`, `Float`, `Function`, `Integer`, `Object`, `String`, `Symbol`.
- **Excluded data types** — NOT implemented by `director-core` and not supported by the runtime: `Vector` (3D).

#### Scenario: Lingo value data types are implemented in core
- **WHEN** the `packages/director/src/core/` directory is inspected
- **THEN** it contains implementations for `List` (`list.js`), `PropList` (`prop-list.js`), `Point` (`point.js`), `Rect` (`rect.js`), and `Color` (`color.js`)

#### Scenario: Native data types are not wrapped
- **WHEN** translated Ligo code uses a value of a native data type (`Array`, `Boolean`, `Constant`, `Date`, `Float`, `Function`, `Integer`, `Object`, `String`, `Symbol`)
- **THEN** no `director-core` wrapper class is involved; the JavaScript native value is used directly

#### Scenario: Vector is not implemented
- **WHEN** the `director-core` source and its exports are inspected
- **THEN** no `Vector` class or 3D vector type is present

### Requirement: director-core SHALL NOT implement Director 3D `Vector`

`director-core` SHALL NOT implement the Director `Vector` data type (the 3D vector type). The R26/2D runtime surface does not require 3D vectors, and `Vector` is permanently out of scope for `director-core`.

#### Scenario: Vector requests are not serviced by core
- **WHEN** any consumer of `director-core` looks for a `Vector` implementation or constructor
- **THEN** none is provided by `director-core`

### Requirement: director-core SHALL implement Director data structures

`director-core` SHALL own and implement the Lingo value data types `List`, `PropList`, `Point`, `Rect`, and `Color` under `src/core/`. These types are permanent residents of `director-core` (they are NOT slated for any move to `director-runtime`). Each SHALL expose the methods and properties documented for its Director MX 2004 counterpart.

#### Scenario: List behaves as a Director List
- **WHEN** a `List` instance is constructed and operated on with Director list operations (`add`, `addAt`, `deleteAt`, `getAt`, `count`, `sort`, `duplicate`, etc.)
- **THEN** its behavior matches the Director MX 2004 List documentation

#### Scenario: PropList behaves as a Director property list
- **WHEN** a `PropList` instance is constructed and operated on with Director property-list operations (`addProp`, `setaProp`, `getaProp`, `getPropAt`, `deleteProp`, `count`, etc.)
- **THEN** its behavior matches the Director MX 2004 Property List documentation and it preserves property order

#### Scenario: Point and Rect model coordinates
- **WHEN** `Point` and `Rect` instances are used in sprite and member geometry operations
- **THEN** their `locH`, `locV`, `left`, `top`, `right`, `bottom`, `width`, `height` properties behave as documented

#### Scenario: Color models a Director color value
- **WHEN** a `Color` instance is constructed (e.g. `color(255, 0, 0)`) and queried for its components or compared with another `Color`
- **THEN** its `red`, `green`, `blue` (and hex/RGB) accessors behave as documented

#### Scenario: Value data types stay in core
- **WHEN** the `packages/director/src/core/` directory is inspected
- **THEN** `list.js`, `prop-list.js`, `point.js`, `rect.js`, `color.js` are present and remain there permanently (no move to `src/runtime/` is planned)

### Requirement: director-core SHALL implement reference classes for Director system objects

`director-core` SHALL implement reference classes that represent Director system objects not constructible from Ligo but usable from Ligo: `MemberRef`, `SpriteRef`, `MovieRef`, `PlayerRef`, `SoundRef`, `CastLibraryRef`, `ScriptRef`, and others documented in the MX 2004 reference. Each reference class SHALL expose the properties and methods documented for its Director counterpart.

#### Scenario: Reference classes are instantiated by core, not by Ligo
- **WHEN** Ligo script calls `member(1)` or `sprite(5)`
- **THEN** `director-lingo` constructs or returns a `MemberRef` / `SpriteRef` instance from `director-core`; Ligo never invokes a `*Ref` constructor directly

#### Scenario: Reference classes expose documented properties
- **WHEN** a `MovieRef` instance is accessed via the `_movie` global
- **THEN** properties such as `frame`, `frameTempo`, `path`, `name`, `castLib`, `member`, `sprite`, `lastChannel`, `timeoutList`, `actorList`, `keyboardFocusSprite`, `exitLock`, `editShortCutsEnabled`, `copyrightInfo`, `traceScript`, `xtraList`, `stage` are available and behave as documented

### Requirement: director-core SHALL implement media types

`director-core` SHALL implement the media-type representations used by Director members (e.g. bitmap, text, field, shape, sound cast members) as needed by the runtime and the ligo surface. Media types SHALL carry the data and behavior required to populate and render their owning `MemberRef` instances.

**Reference**: `docs/drmx2004_scripting_ref.txt` — member `type` property values and their semantics.

#### Scenario: Media types back MemberRef instances
- **WHEN** a `MemberRef` is queried for its media payload (e.g. `member(1).text`, `member(2).image`)
- **THEN** the underlying media type from `director-core` provides the value

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

### Requirement: director-core SHALL treat Symbol and String as native JavaScript

`director-core` SHALL NOT provide a wrapper class for any native JavaScript-mapped data type: `Symbol`, `String`, `Array`, `Boolean`, `Constant`, `Date`, `Float`, `Function`, `Integer`, `Object`. Ligo symbols (`#name`) are translated directly to `Symbol.for("name")` in JavaScript. Strings are native JS strings. The remaining native types map to their JavaScript equivalents (`Array`, `Boolean`, `Date`, `Function`, `Object`, `Number`-backed `Float`/`Integer`, `Constant`). `director-core` does not wrap any of them.

#### Scenario: No Symbol wrapper class
- **WHEN** any translated code uses `Symbol.for("name")`
- **THEN** `director-core` does not provide a `Symbol`-like class; the JS native `Symbol.for` is used directly

#### Scenario: No String wrapper class
- **WHEN** translated code uses a JS string literal
- **THEN** `director-core` does not provide a `String`-like class; the JS native string is used directly

#### Scenario: No wrapper for other native data types
- **WHEN** translated code uses a native `Array`, `Boolean`, `Constant`, `Date`, `Float`, `Function`, `Integer`, or `Object` value
- **THEN** `director-core` provides no wrapper class for that type; the corresponding JavaScript native value is used directly

### Requirement: director-core SHALL remain private across follow-up renames and additions

Any follow-up change that renames existing classes (e.g. `MovieRef` → `MovieObject`), adds new core objects (e.g. `SystemObject`, `WindowObject`, `GlobalObject`), adds media type subclasses, adds `KEY_CODES`, or adds DVD/3D rejector classes SHALL update this spec via that follow-up change's delta. This refactor change locks the privacy and the layer role only; it does not rename classes or add new ones.

#### Scenario: Follow-up change updates this spec
- **WHEN** a follow-up change (e.g. `director-core-xobjects`) is archived
- **THEN** it modifies this `director-core` spec via its own delta spec to reflect the rename it actually performs; this refactor change does not anticipate that rename

