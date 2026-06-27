## Why

`director-core` already physically hosts the Lingo value data types (`List`, `PropList`, `Point`, `Rect`, `Color`) under `src/core/`, but the current spec treats this as a "transition state" and decrees that they belong in `director-runtime` (per an MX 2004 reference reading that is incorrect for this project). That spec reference is wrong: these data types are language-object concerns owned by `director-core`, and no follow-up move to `director-runtime` is planned. The spec needs to be corrected so it reflects the actual architecture, and the set of Director data types the runtime/lingo surface relies on needs to be codified — separating Lingo value types (implemented in `director-core`) from native JavaScript-mapped types (not wrapped) and explicitly excluding the 3D `Vector` type.

## What Changes

- **BREAKING (spec only)**: Remove the `director-core` "transition state" requirement that disclaims ownership of value data types and references a `director-runtime-value-types` follow-up move. `director-core` now OWNS the Lingo value data types.
- **BREAKING (spec only)**: Remove the `director-runtime` "host Director value data types after the follow-up move (transition state)" requirement and its scenarios. `director-runtime` does not host value data types.
- Codify in `director-core` the Lingo value data types that SHALL be implemented: `List`, `PropList`, `Point`, `Rect`, `Color`.
- Codify in `director-core` the native data types that SHALL NOT be wrapped — mapped directly to JavaScript: `Array`, `Boolean`, `Constant`, `Date`, `Float`, `Function`, `Integer`, `Object`, `String`, and `Symbol` (already covered by an existing requirement, reaffirmed here).
- Explicitly place `Vector` (3D) out of scope: `director-core` SHALL NOT implement it.
- No source files are moved between `src/core/` and `src/runtime/`; the value-type files stay where they are. The change is spec-level plus any gaps in the existing implementations surfaced by codifying the data-type contract.

## Capabilities

### New Capabilities

(None — no new capability introduced.)

### Modified Capabilities

- `director-core`: `director-core` becomes the permanent owner and implementer of the Lingo value data types (`List`, `PropList`, `Point`, `Rect`, `Color`); the "transition state / move to runtime" requirement is removed and replaced with an ownership requirement. A new requirement codifies the full Director data-type set: Lingo value types (implemented), native JS-mapped types (not wrapped), and `Vector` (out of scope). The existing native-`Symbol`/`String` requirement is reaffirmed and broadened to cover `Array`, `Boolean`, `Constant`, `Date`, `Float`, `Function`, `Integer`, `Object`.
- `director-runtime`: Remove the requirement that `director-runtime` SHALL host Director value data types after a follow-up move, and its two transition-state scenarios. `director-runtime` no longer has any value-data-type hosting obligation; the stray `director-runtime-value-types` follow-up reference in its layer-role requirement is also dropped.

## Impact

- **Specs**: `openspec/specs/director-core/spec.md` and `openspec/specs/director-runtime/spec.md` updated via this change's delta specs.
- **Code**: `packages/director/src/core/{list,prop-list,point,rect,color}.js` remain in place and are now the canonical home. Any implementation gaps versus the codified data-type contract (method/property coverage) are filled in this change. No files move to `packages/director/src/runtime/`.
- **Consumers**: `director-lingo`, `director-syntax`, `director-browser` keep importing the value types from `../core/...` (no change).
- **Removed follow-up tracking**: the `director-runtime-value-types` follow-up change referenced across both specs is no longer tracked — it will not happen.