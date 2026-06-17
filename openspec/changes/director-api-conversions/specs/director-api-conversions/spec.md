## ADDED Requirements

### Requirement: Conversion functions SHALL be implemented in api/ directory

The Director MX 2004 conversion functions SHALL be implemented in `apps/client/src/director/api/` with each function in its own file.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

**Files**:
- `apps/client/src/director/api/charToNum.js`
- `apps/client/src/director/api/float.js`
- `apps/client/src/director/api/integer.js`
- `apps/client/src/director/api/numToChar.js`
- `apps/client/src/director/api/string.js`
- `apps/client/src/director/api/symbol.js`
- `apps/client/src/director/api/value.js`

**Tests**:
- `apps/client/src/director/api/__tests__/charToNum.test.js`
- `apps/client/src/director/api/__tests__/float.test.js`
- `apps/client/src/director/api/__tests__/integer.test.js`
- `apps/client/src/director/api/__tests__/numToChar.test.js`
- `apps/client/src/director/api/__tests__/string.test.js`
- `apps/client/src/director/api/__tests__/symbol.test.js`
- `apps/client/src/director/api/__tests__/value.test.js`

#### Scenario: Conversion functions are importable
- **WHEN** code imports `import { integer, float, string } from "../../director/api"`
- **THEN** all conversion functions are available

#### Scenario: Conversion functions are pure
- **WHEN** conversion functions are called multiple times with same arguments
- **THEN** they return the same result without side effects

### Requirement: charToNum() SHALL convert character to number

The `charToNum()` function SHALL return the character code of the first character.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 13309-13357

#### Scenario: charToNum converts character
- **WHEN** `charToNum("A")` is called
- **THEN** returns `65`

#### Scenario: charToNum handles lowercase
- **WHEN** `charToNum("a")` is called
- **THEN** returns `97`

### Requirement: float() SHALL convert to float

The `float()` function SHALL convert a value to a floating-point number.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 16384-16416

#### Scenario: float converts string
- **WHEN** `float("3.14")` is called
- **THEN** returns `3.14`

#### Scenario: float converts integer
- **WHEN** `float(42)` is called
- **THEN** returns `42`

### Requirement: integer() SHALL convert to integer

The `integer()` function SHALL convert a value to an integer (rounds to nearest).

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 19303-19329

#### Scenario: integer rounds float
- **WHEN** `integer(3.9)` is called
- **THEN** returns `4`

#### Scenario: integer converts string
- **WHEN** `integer("42")` is called
- **THEN** returns `42`

### Requirement: numToChar() SHALL convert number to character

The `numToChar()` function SHALL return the character for the given character code.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 22342-22399

#### Scenario: numToChar converts code
- **WHEN** `numToChar(65)` is called
- **THEN** returns `"A"`

#### Scenario: numToChar handles lowercase
- **WHEN** `numToChar(97)` is called
- **THEN** returns `"a"`

### Requirement: string() SHALL convert to string

The `string()` function SHALL convert a value to a string.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 28533-28555

#### Scenario: string converts number
- **WHEN** `string(42)` is called
- **THEN** returns `"42"`

#### Scenario: string converts symbol
- **WHEN** `string(Symbol.for("test"))` is called
- **THEN** returns `"test"`

### Requirement: symbol() SHALL convert to symbol

The `symbol()` function SHALL create a symbol from a string.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 28701-28729

#### Scenario: symbol creates symbol
- **WHEN** `symbol("test")` is called
- **THEN** returns `Symbol.for("test")`

### Requirement: value() SHALL parse string to value

The `value()` function SHALL parse a string to its corresponding Director value.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 29543-29607

#### Scenario: value parses number string
- **WHEN** `value("42")` is called
- **THEN** returns `42`

#### Scenario: value parses TRUE
- **WHEN** `value("TRUE")` is called
- **THEN** returns `true`

#### Scenario: value parses VOID
- **WHEN** `value("VOID")` is called
- **THEN** returns `undefined`

### Requirement: All conversion functions SHALL match Director MX 2004 exactly

Each conversion function SHALL behave exactly as documented in Director MX 2004. See individual spec files for full documentation:

- `charToNum.md` - Convert character to number
- `float.md` - Convert to float
- `integer.md` - Convert to integer
- `numToChar.md` - Convert number to character
- `string.md` - Convert to string
- `symbol.md` - Convert to symbol
- `value.md` - Parse string to value

#### Scenario: All functions implemented
- **WHEN** any conversion function is called
- **THEN** behavior matches Director MX 2004 documentation exactly
