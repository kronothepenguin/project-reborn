## ADDED Requirements

### Requirement: director-core SHALL codify the Director data-type set

`director-core` SHALL be the single source of truth for the categorization of Director data types used by the `@project-reborn/director` runtime and Lingo surface. The data-type set is partitioned into three buckets:

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

## MODIFIED Requirements

### Requirement: director-core SHALL implement Director data structures

`director-core` SHALL own and implement the Lingo value data types `List`, `PropList`, `Point`, `Rect`, and `Color` under `src/core/`. These types are permanent residents of `director-core` (they are NOT slated for any move to `director-runtime`). Each SHALL expose the methods and properties documented for its Director MX 2004 counterpart.

**Reference**: `docs/director-inventory.json` — entries whose owning class is a core data structure.

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

## REMOVED Requirements

### Requirement: director-core SHALL treat Director value data types as a separate concern (transition state)

**Reason**: The MX 2004 reference reading that placed Lingo value data types in `director-runtime` (as a "transition state" pending a `director-runtime-value-types` follow-up move) is incorrect for this project. `director-core` owns the Lingo value data types permanently; no move to `director-runtime` is planned. This change replaces that disclaiming requirement with an explicit ownership posture codified in the "director-core SHALL implement Director data structures" (modified) and "director-core SHALL codify the Director data-type set" (added) requirements.

**Migration**: None. The value-type files (`list.js`, `prop-list.js`, `point.js`, `rect.js`, `color.js`) already physically live in `src/core/` and stay there. Consumers (`director-lingo`, `director-syntax`, `director-browser`) keep importing them from `../core/...`. The tracked `director-runtime-value-types` follow-up is dropped — it will not happen.