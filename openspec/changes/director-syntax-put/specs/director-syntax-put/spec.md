## ADDED Requirements

### Requirement: Put helpers SHALL be implemented in syntax/ directory

The Director put statement helpers SHALL be implemented in `apps/client/src/director/syntax/` with each helper in its own file.

**Source**: `docs/drmx2004_scripting_ref.txt` Chapter 11: Keywords

**Files**:
- `apps/client/src/director/syntax/put-into.js`
- `apps/client/src/director/syntax/put-before.js`
- `apps/client/src/director/syntax/put-after.js`

**Tests**:
- `apps/client/src/director/syntax/__tests__/put-into.test.js`
- `apps/client/src/director/syntax/__tests__/put-before.test.js`
- `apps/client/src/director/syntax/__tests__/put-after.test.js`

#### Scenario: Put helpers are importable
- **WHEN** code imports `import { putInto, putBefore, putAfter } from "../../director/syntax"`
- **THEN** all put helpers are available

### Requirement: putInto() SHALL replace chunk

The `putInto()` helper SHALL replace a chunk in a string with a new value.

#### Scenario: putInto replaces character
- **WHEN** `putInto("X", 3, 3, "hello")` is called
- **THEN** returns `"heXlo"`

#### Scenario: putInto replaces range
- **WHEN** `putInto("X", 2, 4, "hello")` is called
- **THEN** returns `"hXo"`

### Requirement: putBefore() SHALL insert before chunk

The `putBefore()` helper SHALL insert a value before a chunk in a string.

#### Scenario: putBefore inserts before character
- **WHEN** `putBefore("X", 3, 3, "hello")` is called
- **THEN** returns `"heXllo"`

### Requirement: putAfter() SHALL insert after chunk

The `putAfter()` helper SHALL insert a value after a chunk in a string.

#### Scenario: putAfter inserts after character
- **WHEN** `putAfter("X", 3, 3, "hello")` is called
- **THEN** returns `"helXlo"`

### Requirement: All put helpers SHALL match Director MX 2004 exactly

Each put helper SHALL behave exactly as documented in Director MX 2004.

#### Scenario: Helpers match Director behavior
- **WHEN** any put helper is called
- **THEN** behavior matches Director MX 2004 documentation exactly
