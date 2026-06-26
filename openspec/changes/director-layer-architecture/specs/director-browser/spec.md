## ADDED Requirements

### Requirement: director-browser SHALL be the public host integration layer

`director-browser` SHALL be exported from `packages/director/package.json` as `./browser`. It SHALL provide everything a host page needs to mount and run a Director movie authored as bundled JavaScript: custom HTML elements that replace the deprecated Shockwave `<object>`/`<param>`/`<embed>` tags, plus a mount surface that drives `director-runtime`'s event loop and canvas rendering.

At refactor state (this change), `director-browser` holds ONLY `custom-elements.js` (moved verbatim from `src/runtime/custom-elements.js`) plus the `index.js` that re-exports `registerCustomElements` and `_createMovie` from it. The registration helpers (`defineCast`, `createScriptMember`, `createFieldMember`, `createImageMember`) — the bundled-JS movie/cast registration surface — are NOT added by this change; they are a follow-up change `director-browser-registration` that updates this requirement via its own delta.

**Package**: `packages/director/`
**Source**: `packages/director/src/browser/`
**Reference**: `docs/drmx2004_scripting_ref/` (`events_and_messages.txt` for lifecycle hook points).

#### Scenario: browser is a public export
- **WHEN** `packages/director/package.json` `exports` is inspected after this refactor
- **THEN** `./browser` maps to `./src/browser/index.js`

#### Scenario: Custom elements live in browser after refactor
- **WHEN** `packages/director/src/browser/` is inspected after this refactor
- **THEN** it contains `custom-elements.js` (moved verbatim from `src/runtime/custom-elements.js`) and `index.js`; no other files are introduced by this change

#### Scenario: Custom elements re-exported from browser
- **WHEN** `packages/director/src/browser/index.js` is inspected after this refactor
- **THEN** it re-exports `registerCustomElements` and `_createMovie` from `./custom-elements.js`

### Requirement: director-browser custom elements SHALL replace Shockwave tags

`director-browser` custom elements SHALL replace the deprecated `<object>`/`<param>`/`<embed>` Shockwave embedding. At refactor state (this change), the custom element classes are the EXISTING `XObjectElement`, `XParamElement`, `XEmbedElement` (if present) from `src/runtime/custom-elements.js`, moved verbatim. Any new custom elements or element renames are follow-up changes that update this requirement via their own deltas.

#### Scenario: x-object element initializes a movie
- **WHEN** an `<x-object>` element is connected to the DOM with a movie source
- **THEN** the Director subsystem is initialized for that element via `director-browser`'s custom element implementation, in the same way it was before the refactor (the connectedCallback implementation is unchanged by this refactor)

#### Scenario: x-param sets a movie parameter
- **WHEN** `<x-param name="src" value="movie.js">` is a child of `<x-object>`
- **THEN** the movie parameter `src` is set to `movie.js` before the movie starts (the param collection implementation is unchanged by this refactor)

#### Scenario: x-embed embeds a cast or asset
- **WHEN** an `<x-embed>` element references a cast library or asset bundle
- **THEN** the referenced resource is loaded into the Director subsystem via `director-runtime`'s `cast-loader.js` (same behaviour as before the refactor)

### Requirement: director-browser SHALL depend on director-core and director-runtime only

`director-browser` SHALL import state-holding objects from `director-core` and host-API wrappers from `director-runtime`. It SHALL NOT import from `director-lingo` or `director-syntax`. At refactor state (this change), the only imports inside `packages/director/src/browser/custom-elements.js` are `_setCanvas` from `../runtime/canvas.js`, `startEventLoop`/`stopEventLoop` from `../runtime/event-loop.js`, and a dynamic `import("../runtime/cast-loader.js")` for `loadCast`. No `director-core` imports exist in the file at refactor state.

#### Scenario: browser imports are downward only
- **WHEN** `packages/director/src/browser/` source files are inspected after this refactor
- **THEN** every relative import resolves to `../core/` or `../runtime/`, never to `../lingo/` or `../syntax/`

#### Scenario (refactor state): browser custom-elements consume runtime canvas and event loop
- **WHEN** `packages/director/src/browser/custom-elements.js` is inspected after this refactor
- **THEN** it imports `_setCanvas` from `../runtime/canvas.js`, `startEventLoop` and `stopEventLoop` from `../runtime/event-loop.js`, and `loadCast` from `../runtime/cast-loader.js` via dynamic import

### Requirement: director-browser SHALL keep bundled-JS movies and casts as the source format

`director-browser` SHALL NOT load native `.dcr`, `.dir`, or `.cct` files. The supported movie/cast format SHALL be JavaScript bundles produced by Vite (or equivalent bundler) that, at module-evaluation time, call registration helpers (`defineCast`, `createScriptMember`, `createFieldMember`, `createImageMember`) from `@project-reborn/director/browser`.

At refactor state (this change), the registration helpers are NOT yet implemented; `custom-elements.js` only consumes `cast-loader.js` for URL-based cast loading. The registration surface is a follow-up change `director-browser-registration` that will update this requirement via its own delta to record the helper API it actually adds.

#### Scenario: Native movie files are not loaded
- **WHEN** a host page references a `.dcr` or `.cct` file
- **THEN** `director-browser` does not parse or execute it; only JS bundles will be supported (registration helpers in follow-up)

#### Scenario (refactor state): Registration helpers NOT yet present
- **WHEN** `packages/director/src/browser/index.js` is inspected after this refactor
- **THEN** only `registerCustomElements` and `_createMovie` are re-exported; `defineCast`, `createScriptMember`, `createFieldMember`, `createImageMember` are absent

### Requirement: director-browser registration surface SHALL be grown via follow-up change deltas

Any follow-up change that adds registration helpers, new custom elements, or new mount functions SHALL update this spec via that change's own delta. This refactor change locks the layer role and the custom-element relocation only; it does not add new registration names.

#### Scenario: Follow-up change updates this spec
- **WHEN** a follow-up change (e.g. `director-browser-registration`) is archived
- **THEN** it modifies this `director-browser` spec via its own delta spec to record the registration helpers it actually adds; this refactor change does not anticipate those names