## Context

`packages/director/` is the LingoScript → JavaScript runtime for the Habbo R26 client. It was originally implemented at `apps/client/src/director/` and migrated to `packages/director/`. The migration was not reflected in the OpenSpec archive: 28 archived changes still reference the old path and decompose the package into ~20 micro-capabilities (`director-api-math`, `director-api-bitwise`, `director-core-list`, …), each containing inline copies of the Director MX 2004 reference documentation.

Current state:
- `openspec/specs/` is empty. No live specs exist.
- `packages/director/src/` has four folders: `api/` (109 files), `core/` (16), `runtime/` (7), `syntax/` (8 + tests).
- `packages/director/package.json` exports `./api`, `./runtime`, `./syntax`. `./core` is intentionally not exported.
- `docs/drmx2004_scripting_ref.txt` (57,648 lines) and `docs/director-inventory.json` (486 methods, 763 properties, 91 excluded for 3D/DVD) are the authoritative reference.

Stakeholders: LigoScript authors (consume the lingo surface), client integrators (consume the runtime surface), and director maintainers (work on core).

## Goals / Non-Goals

**Goals:**
- Establish three responsibility-level capability specs that match the real contract boundaries of `packages/director/`.
- Make package ownership unambiguous through the capability name prefix (`director-*`) plus an explicit ownership statement in each spec body.
- Capture the coupling between the lingo surface and core (globals like `_movie` are stateful `MovieRef` instances from core that some api functions read implicitly).
- Keep specs small by referencing the MX 2004 reference rather than inlining it.
- Leave room for a future folder refactor (unify `api/` + `syntax/` under a `lingo/` barrel) without prescribing it now.

**Non-Goals:**
- Inline MX 2004 documentation. Per-function `.md` extraction from `docs/drmx2004_scripting_ref.pdf`/`.txt` is a separate tooling effort, not a spec concern.
- Prescribing internal folder layout, file-per-function granularity, or test co-location. Those are implementation decisions for follow-up changes.
- Modifying `packages/director/src/` or `packages/director/package.json`. Code reconciliation is follow-up work.
- Deleting `openspec/changes/archive/`. Deferred until these specs land.
- Replacing the existing `api/`, `core/`, `runtime/`, `syntax/` source folders. The specs describe contracts, not file paths.

## Decisions

### Decision 1: Flat capability names with `director-` prefix

**Choice**: Capabilities are `director-core`, `director-lingo`, `director-runtime` — flat under `openspec/specs/`, not nested as `openspec/specs/packages/director/<name>/spec.md`.

**Rationale**: OpenSpec treats each immediate child folder of `openspec/specs/` as a capability. A nested `packages/director/spec.md` would register as a single capability named `packages`, collapsing the three distinct contracts into one. The `director-` prefix already has 28 precedents in the archive and makes package ownership obvious without nesting. Each spec body states `Package: packages/director/` and references the corresponding `packages/director/src/<module>/` folder.

**Alternative considered**: Nested path `openspec/specs/packages/director/<name>/spec.md` to mirror the monorepo layout. Rejected — does not work with OpenSpec's flat capability model.

### Decision 2: Three capabilities, not one and not twenty

**Choice**: Three capabilities matching the three real contract surfaces.

| Capability | Export | Audience | Source folder today |
|---|---|---|---|
| `director-core` | none (internal) | director maintainers | `src/core/` |
| `director-lingo` | `./lingo` | LigoScript authors + transpiler output | `src/api/` + `src/syntax/` (future: unified `src/lingo/`) |
| `director-runtime` | `./runtime` | client integrators / host environment | `src/runtime/` |

**Rationale**: One giant spec would blur three different contracts (internal types vs. ligo surface vs. host integration). Twenty micro-capabilities (Qwen's approach) fragments the package into topics that are easily misinterpreted as independent. Three capabilities match the contract boundaries: what is internal, what Ligo consumes, what the host consumes.

**Alternatives considered**:
- Single `director` capability — rejected: blurs contract boundaries, one change touches everything.
- Per-topic micro-capabilities (Qwen's structure) — rejected: too many files, no clear contract-level identity.

### Decision 3: Unify api + syntax into `director-lingo`

**Choice**: `director-lingo` is the single Ligo-script-facing surface, exported as `./lingo`. It covers four requirement sections: Functions, Globals, Constants, Syntax constructs.

**Rationale**: From the consumer's perspective, everything Ligo script uses comes from one import path. Splitting "callable functions" (`./api`) from "language-construct emulation" (`./syntax`) forces the consumer to know which surface a name lives on, even though both are ligo-facing. The four sections keep the sub-concerns explicit without multiplying capabilities.

The `the`-proxy (a `Proxy` over system properties), chunk expressions (`char X to Y of Z`), and `put` statements are language-construct emulators consumed by transpiler output — distinct mechanism from plain functions, but the same contract surface.

**Alternatives considered**:
- Keep `director-api` and `director-syntax` separate — rejected: consumer-facing distinction without a contract difference; the user explicitly wants one import path for ligo.
- Name it `director-api` and absorb syntax — rejected: "api" does not accurately cover syntax constructs.
- Name it `director-stdlib` — rejected: "stdlib" also implies callables only and excludes syntax.

### Decision 4: Globals are a section of `director-lingo`, with the core-coupling made explicit

**Choice**: `_movie`, `_player`, `_sound`, `_mouse`, `_key`, `_global`, `_system`, `_window` live as a Globals requirement section inside `director-lingo/spec.md`. The section explicitly states these are stateful singleton instances of `*Ref` classes from `director-core`, and that some Functions read them implicitly (e.g. `member(1)` with no castLib argument resolves against `_movie`'s current cast library).

**Rationale**: Globals are ligo-facing (consumed by Ligo script), so they belong in `director-lingo`. But they are the architectural coupling point between `director-lingo` and `director-core` — they are not pure functions, they hold runtime state, and they mutate the behavior of api functions that read them implicitly. Making this a named requirement section captures the coupling instead of burying it in a function list.

**Alternative considered**: Separate `director-globals` capability — rejected: adds a capability for a sub-concern that is still ligo-facing; the section captures the coupling adequately without it.

### Decision 5: Reference the MX 2004 docs, do not inline them

**Choice**: Each spec.md references `docs/drmx2004_scripting_ref.txt` (with line ranges from `docs/director-inventory.json`) for the authoritative per-function and per-property documentation. No inline copies.

**Rationale**: Inlining 486 methods + 763 properties balloons specs to thousands of lines and duplicates a source that already exists in `docs/`. AI agents implementing against the spec can read the referenced ranges directly. Per-function `.md` extraction (via pdf2 utilities or similar) is a future tooling task that would live under `docs/director-ref/`, not under `openspec/specs/`.

**Alternative considered**: Inline full MX 2004 documentation per function (Qwen's Decision 4) — rejected on size grounds and because the user explicitly prefers references over copies.

### Decision 6: Specs state responsibilities and contracts, not implementation

**Choice**: Each spec.md defines: the capability's responsibility, its scope boundaries (what is in and out), its export contract (whether it appears in `package.json` exports and under what subpath), and contract-level scenarios (import paths, internal-not-leaked, etc.). Specs do not prescribe folder names, file-per-function granularity, or test co-location.

**Rationale**: The current `api/`, `core/`, `runtime/`, `syntax/` folder split was produced by Qwen and may change (e.g. unify `api/` + `syntax/` into `lingo/` with subfolders for functions/globals/constants/syntax). Pinning folder names in the spec would force spec churn on every refactor. The contract — one `./lingo` export, `./core` not exported, `./runtime` for host integration — is what the spec should pin.

**Alternative considered**: Spec the folder layout — rejected: couples spec to today's implementation and blocks the barrel refactor the user has in mind.

### Decision 7: Archive cleanup deferred

**Choice**: `openspec/changes/archive/` is left untouched by this change. Once `director-specs-foundation` is archived and the three new specs are synced into `openspec/specs/`, a follow-up commit deletes `openspec/changes/archive/` in one pass.

**Rationale**: The archive holds Qwen's planning trail, which is still useful as a reference while authoring the new specs. Deleting it now loses that trail; leaving it forever invites confusion with stale `apps/client/src/director/` paths. The middle ground — delete after the new specs land — keeps the trail during authoring and cleans up after.

**Alternative considered**: Delete the archive now — rejected: loses the historical planning trail while it is still useful.

## Risks / Trade-offs

**Risk**: Specs assert `./lingo` and `./core`-not-exported contracts that diverge from today's `package.json` (which exports `./api`, `./runtime`, `./syntax`).
→ **Mitigation**: The proposal explicitly flags this divergence as follow-up refactor work, not part of this change. Specs describe the intended contract; code catches up in a later change.

**Risk**: Referencing MX 2004 docs by line range breaks if `docs/drmx2004_scripting_ref.txt` is regenerated and line numbers shift.
→ **Mitigation**: `docs/director-inventory.json` is the canonical index; if the txt is regenerated, the inventory is regenerated alongside it. Spec text references both files by name, not by hardcoded line numbers, except where a line range illustrates a point.

**Risk**: Three capability specs may still feel too coarse for an agent that wants to implement one function at a time.
→ **Mitigation**: Per-function implementation guidance belongs in follow-up changes' `tasks.md` files that reference the capability spec plus the inventory entry. The capability spec stays coarse on purpose.

**Trade-off**: Unifying `api` + `syntax` under `director-lingo` in the spec while the code still has separate `api/` and `syntax/` folders creates a temporary spec-vs-code mismatch.
→ **Acceptable**: The spec describes the target contract. The folder refactor is a separate, explicit change. Mismatch is visible and tracked, not hidden.

**Trade-off**: Globals as a section of `director-lingo` rather than a separate capability means the core-coupling is captured in prose + scenarios instead of a standalone spec boundary.
→ **Acceptable**: A future change can promote Globals to its own capability if the coupling grows complex enough to warrant it. Starting with a section avoids premature capability proliferation.
