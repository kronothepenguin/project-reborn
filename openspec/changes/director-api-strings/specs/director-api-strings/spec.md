## ADDED Requirements

### Requirement: String functions SHALL be implemented in api/ directory

The Director MX 2004 string functions SHALL be implemented in `apps/client/src/director/api/` with each function in its own file.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

**Files**:
- `apps/client/src/director/api/chars.js`
- `apps/client/src/director/api/length.js`
- `apps/client/src/director/api/offset.js`

**Tests**:
- `apps/client/src/director/api/__tests__/chars.test.js`
- `apps/client/src/director/api/__tests__/length.test.js`
- `apps/client/src/director/api/__tests__/offset.test.js`

#### Scenario: String functions are importable
- **WHEN** code imports `import { chars, length, offset } from "../../director/api"`
- **THEN** all string functions are available

#### Scenario: String functions are pure
- **WHEN** string functions are called multiple times with same arguments
- **THEN** they return the same result without side effects

### Requirement: chars() SHALL extract substring

The `chars()` function SHALL extract a substring from a string using 1-based positions.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 13266-13308

#### Scenario: chars extracts substring
- **WHEN** `chars("hello", 2, 4)` is called
- **THEN** returns `"ell"`

#### Scenario: chars handles full string
- **WHEN** `chars("hello", 1, 5)` is called
- **THEN** returns `"hello"`

#### Scenario: chars handles single character
- **WHEN** `chars("hello", 3, 3)` is called
- **THEN** returns `"l"`

### Requirement: length() SHALL return string length

The `length()` function SHALL return the number of characters in a string.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 19802-19831

#### Scenario: length returns string length
- **WHEN** `length("hello")` is called
- **THEN** returns `5`

#### Scenario: length handles empty string
- **WHEN** `length("")` is called
- **THEN** returns `0`

### Requirement: offset() SHALL find substring position

The `offset()` function SHALL return the 1-based position of a substring, or 0 if not found.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 22434-22501

#### Scenario: offset finds substring
- **WHEN** `offset("ll", "hello")` is called
- **THEN** returns `3`

#### Scenario: offset returns 0 when not found
- **WHEN** `offset("xyz", "hello")` is called
- **THEN** returns `0`

#### Scenario: offset finds at beginning
- **WHEN** `offset("he", "hello")` is called
- **THEN** returns `1`

### Requirement: All string functions SHALL match Director MX 2004 exactly

Each string function SHALL behave exactly as documented in Director MX 2004. See individual spec files for full documentation:

- `chars.md` - Extract substring
- `length.md` - Get string length
- `offset.md` - Find substring position

#### Scenario: All functions implemented
- **WHEN** any string function is called
- **THEN** behavior matches Director MX 2004 documentation exactly
