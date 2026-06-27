## Context

`@project-reborn/director` currently hosts the Lingo value data types — `List`, `PropList`, `Point`, `Rect`, `Color` — under `packages/director/src/core/`. The shipped specs (`openspec/specs/director-core/spec.md`, `openspec/specs/director-runtime/spec.md`) describe this as a "transition state": they disclaim `director-core`'s ownership of the value types and track a `director-runtime-value-types` follow-up that would move the files into `src/runtime/`. That reference reading is wrong for this project: the value data types are language-object concerns owned by `director-core`, and no move is planned. This change corrects both specs and codifies the full Director data-type set the runtime/Ligo surface relies on — separating Lingo value types (implemented), native JS-mapped types (not wrapped), and the excluded 3D `Vector`.

The value-type implementations (`list.js`, `prop-list.js`, `point.js`, `rect.js`, `color.js`) already exist in `src/core/` and cover the core Director operations. `color.js` is the thinnest of the five and will need the most filling to match the codified contract (hex/rgb accessors, equality). The native-mapped types need no code — they are a translation contract, not an implementation.

## Goals / Non-Goals

**Goals:**
- Correct the `director-core` and `director-runtime` specs so they reflect the real architecture: `director-core` owns the Lingo value data types permanently.
- Codify the Director data-type set in one place (`director-core`): Lingo value types, native JS-mapped types, and excluded `Vector`.
- Drop the `director-runtime-value-types` follow-up tracking from both specs.
- Close any implementation gaps in `src/core/{list,prop-list,point,rect,color}.js` against the codified data-type contract, prioritising `Color` (the least complete).

**Non-Goals:**
- Moving value-type files between `src/core/` and `src/runtime/`. They stay in `src/core/`.
- Renaming the classes or introducing an `XObject` naming convention (separate follow-up).
- Implementing `Vector` / any 3D support.
- Implementing or wrapping the native JS-mapped data types (`Array`, `Boolean`, `Constant`, `Date`, `Float`, `Function`, `Integer`, `Object`, `String`, `Symbol`) — those remain pure JS values.
- Adding media-type subclasses, `KEY_CODES`, or new system objects.

## Decisions

### Decision 1: `director-core` owns the Lingo value data types permanently

**Choice**: Declare `director-core` the permanent owner and implementer of `List`, `PropList`, `Point`, `Rect`, `Color` under `src/core/`.

**Why**: They are Director language objects consumed by `director-lingo`, `director-syntax`, and `director-browser` via `../core/...` imports — a language-object concern, not a host-integration concern. They already live in `src/core/`.

**Alternatives considered**:
- Move them to `src/runtime/` per the MX 2004 "data types are low-level" reading. Rejected: it splits a single language-object layer across two layers and forces `director-lingo` to import value types from `../runtime/...` while importing the other core objects from `../core/...`. No benefit; the reference reading does not match this project's layering.

### Decision 2: Single "Director data-type set" requirement as source of truth

**Choice**: Add one `director-core` requirement that partitions the data-type set into three buckets (Lingo value / native JS-mapped / excluded), and modify the existing "Director data structures" and "Symbol and String as native" requirements to align with it.

**Why**: Keeps one place where the categorization lives; the existing requirements stay authoritative for the implementation specifics (value-type classes) and the no-wrapper rule (natives).

**Alternatives considered**:
- Put the categorization solely inside the "Director data structures" requirement. Rejected: it would conflate "value types we implement" with "native types we deliberately don't implement" and "Vector we exclude", obscuring the no-wrapper and out-of-scope contracts.

### Decision 3: `Vector` is permanently out of scope

**Choice**: A dedicated `director-core` requirement forbids implementing `Vector` (the 3D type), plus a categorization scenario asserting its absence.

**Why**: The R26/2D runtime does not need 3D vectors. Codifying the exclusion prevents future drift toward partial 3D support.

**Alternatives considered**:
- Omit `Vector` from the spec entirely. Rejected: an explicit exclusion is stronger than silence; the inventory references Director 3D, so a recorded decision is clearer.

### Decision 4: Implementation gaps closed, not rewritten

**Choice**: Fill gaps in the existing `src/core/` value-type classes against the codified contract (notably `Color` hex/RGB accessors and equality). Keep the existing API shape and the `list()`/`color()` factory proxies.

**Why**: Minimizes churn; consumers keep their import paths and call shapes.

**Alternatives considered**:
- Full reimplementation of all five classes. Rejected: no spec gap warrants it for `List`/`PropList`/`Point`/`Rect`; risks breaking existing `__tests__/`.

## Risks / Trade-offs

- [Spec drift with archived change deltas] The archived `2026-06-26-director-layer-architecture` change introduced the removed "transition state" requirements. Future readers tracing history may be confused by the reversal. → Mitigation: the REMOVED blocks cite the reason ("MX 2004 reference reading incorrect for this project") and the cancellation of `director-runtime-value-types`.
- [Reduced `Color` parity risk] Filling `Color` may surface behaviors (alpha, named colors, `rgbHex`) not yet tested. → Mitigation: add unit tests alongside the accessor additions; keep behavior to documented MX 2004 Color surface.
- [Spec-only impact mistaken for code move] A reader may assume files moved. → Mitigation: both deltas include explicit "files stay in `src/core/`" scenarios; proposal's Impact section states no files move.