## Why

`packages/director/` has no live specs — `openspec/specs/` is empty. The 28 archived changes under `openspec/changes/archive/` were authored by Qwen against the old `apps/client/src/director/` path (now stale) and decomposed the package into ~20 micro-capabilities with inline copies of MX 2004 documentation. The package needs focused, responsibility-level specs that match its current home at `packages/director/` and its real contract boundaries, so future implementation work has a stable reference.

## What Changes

- **ADDED** three capability specs under `openspec/specs/` defining the responsibilities, scope, and export contracts of `packages/director/`:
  - `director-core` — internal simulator types, not exported from the package.
  - `director-lingo` — the single Ligo-script-facing surface (functions, globals, constants, syntax constructs), exported as `./lingo`.
  - `director-runtime` — host/browser integration (mount, custom elements, event loop, cast loader, script lifecycle, canvas), exported as `./runtime`.
- Specs reference `docs/drmx2004_scripting_ref.txt` and `docs/director-inventory.json` for the authoritative per-function/per-property documentation rather than inlining it.
- Specs state only responsibilities, scope boundaries, and export contracts. They do not prescribe internal folder layout, file-per-function granularity, or implementation strategy.
- **Non-goal**: no code changes, no folder refactor, no inline MX 2004 documentation, no per-function spec files. Those belong to follow-up changes once the responsibility boundaries are agreed.
- **Non-goal**: deleting `openspec/changes/archive/`. Deferred to a follow-up commit once these specs are synced into `openspec/specs/`.

## Capabilities

### New Capabilities

- `director-core`: Internal simulator layer for Director/Lingo — data structures (List, PropList, Point, Rect, Color), reference classes (MemberRef, SpriteRef, MovieRef, PlayerRef, SoundRef, CastLibraryRef, …), and media types. Not exported from `package.json`; consumed by `director-lingo` and `director-runtime`.
- `director-lingo`: The Ligo-script-facing surface of the package, exported as `./lingo`. Covers four requirement sections — Functions (standard-library callables that use `director-core`), Globals (stateful singleton Ref instances from `director-core` such as `_movie`, `_player`, `_sound`), Constants (`VOID`, `EMPTY`, `PI`, …), and Syntax constructs (`the`-proxy, chunk expressions, `put` statements consumed by transpiler output).
- `director-runtime`: Host/browser integration surface, exported as `./runtime`. Custom elements (`<x-object>`, `<x-param>`, `<x-embed>`), event loop, cast loader, script lifecycle, canvas, and mount/run entry points.

### Modified Capabilities

None. `openspec/specs/` is currently empty.

## Impact

- **Specs**: Introduces the first three capabilities in `openspec/specs/`. No existing specs are modified.
- **Code**: None. No source files in `packages/director/src/` are touched. The specs describe the intended contract; reconciliation of existing code against the specs is follow-up work.
- **Package exports**: The specs assert that `director-lingo` is exported as `./lingo` and `director-core` is not exported. Current `packages/director/package.json` exports `./api`, `./runtime`, `./syntax` — divergence from the spec is intentional and tracked as follow-up refactor work, not part of this change.
- **Dependencies**: None.
- **Archived changes**: Unaffected by this change. Cleanup of `openspec/changes/archive/` is deferred until these specs land.
