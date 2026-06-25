# director-core Specification

## Purpose
TBD - created by archiving change director-specs-foundation. Update Purpose after archive.
## Requirements
### Requirement: director-core SHALL be the internal simulator layer for Director/Lingo

`director-core` SHALL implement the data structures, reference classes, and media types that model Director's runtime state. It SHALL be consumed by `director-lingo` and `director-runtime` and SHALL NOT be consumed by any package outside `@project-reborn/director`.

**Package**: `packages/director/`
**Source**: `packages/director/src/core/`
**Reference**: `docs/director-inventory.json` (properties section — class-shape properties live here), `docs/drmx2004_scripting_ref.txt` (Chapter 14: Properties, lines 31406–57648).

#### Scenario: Core is not exported from the package
- **WHEN** a consumer outside `@project-reborn/director` attempts `import { ... } from "@project-reborn/director/core"`
- **THEN** the import fails because `./core` is not present in `packages/director/package.json` `exports`

#### Scenario: Core is consumed internally
- **WHEN** `director-lingo` or `director-runtime` needs a core type (e.g. `MovieRef`, `Color`, `List`)
- **THEN** it imports from the internal `core` module path within the package

### Requirement: director-core SHALL implement Director data structures

`director-core` SHALL implement the Director data structures documented in the MX 2004 reference: `List`, `PropList`, `Point`, `Rect`, `Color`, and any other types the ligo surface or runtime needs to construct internally. These types SHALL expose the methods and properties documented for their Director counterparts.

**Reference**: `docs/director-inventory.json` — entries whose owning class is a core data structure.

#### Scenario: List behaves as a Director List
- **WHEN** a `List` instance is constructed and operated on with Director list operations (`add`, `addAt`, `deleteAt`, `getAt`, `count`, etc.)
- **THEN** its behavior matches the Director MX 2004 List documentation

#### Scenario: Point and Rect model coordinates
- **WHEN** `Point` and `Rect` instances are used in sprite and member geometry operations
- **THEN** their `locH`, `locV`, `left`, `top`, `right`, `bottom`, `width`, `height` properties behave as documented

### Requirement: director-core SHALL implement reference classes for Director system objects

`director-core` SHALL implement reference classes that represent Director system objects not constructible from Ligo but usable from Ligo: `MemberRef`, `SpriteRef`, `MovieRef`, `PlayerRef`, `SoundRef`, `CastLibraryRef`, `ScriptRef`, and others documented in the MX 2004 reference. Each reference class SHALL expose the properties and methods documented for its Director counterpart.

**Reference**: `docs/director-inventory.json` — properties grouped by owning object type.

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

### Requirement: director-core SHALL remain stable across ligo-surface refactors

`director-core`'s public surface (the types and methods consumed by `director-lingo` and `director-runtime`) SHALL be defined by the Director MX 2004 reference, not by the current `src/core/` folder layout. Internal file organization (one-file-per-class, grouped files, etc.) SHALL NOT change the consumed surface.

#### Scenario: Folder refactor does not break consumers
- **WHEN** `packages/director/src/core/` is reorganized (files merged, split, or renamed)
- **THEN** the imports used by `director-lingo` and `director-runtime` continue to resolve, because the consumed surface is the type set, not the file set

