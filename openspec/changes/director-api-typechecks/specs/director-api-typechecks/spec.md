## ADDED Requirements

### Requirement: Type checking functions SHALL be implemented in api/ directory

The Director MX 2004 type checking functions SHALL be implemented in `apps/client/src/director/api/` with each function in its own file.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

**Files**:
- `apps/client/src/director/api/floatP.js`
- `apps/client/src/director/api/ilk.js`
- `apps/client/src/director/api/integerP.js`
- `apps/client/src/director/api/listP.js`
- `apps/client/src/director/api/objectP.js`
- `apps/client/src/director/api/stringP.js`
- `apps/client/src/director/api/symbolP.js`
- `apps/client/src/director/api/voidP.js`

**Tests**:
- `apps/client/src/director/api/__tests__/floatP.test.js`
- `apps/client/src/director/api/__tests__/ilk.test.js`
- `apps/client/src/director/api/__tests__/integerP.test.js`
- `apps/client/src/director/api/__tests__/listP.test.js`
- `apps/client/src/director/api/__tests__/objectP.test.js`
- `apps/client/src/director/api/__tests__/stringP.test.js`
- `apps/client/src/director/api/__tests__/symbolP.test.js`
- `apps/client/src/director/api/__tests__/voidP.test.js`

#### Scenario: Type checking functions are importable
- **WHEN** code imports `import { voidP, integerP, listP } from "../../director/api"`
- **THEN** all type checking functions are available

#### Scenario: Type checking functions are pure
- **WHEN** type checking functions are called multiple times with same arguments
- **THEN** they return the same result without side effects

### Requirement: floatP() SHALL check for float type

The `floatP()` function SHALL return true if the value is a floating-point number (not an integer).

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 16417-16446

#### Scenario: floatP returns true for float
- **WHEN** `floatP(3.14)` is called
- **THEN** returns `true`

#### Scenario: floatP returns false for integer
- **WHEN** `floatP(42)` is called
- **THEN** returns `false`

#### Scenario: floatP returns false for string
- **WHEN** `floatP("3.14")` is called
- **THEN** returns `false`

### Requirement: ilk() SHALL return type symbol

The `ilk()` function SHALL return a symbol representing the data type of the value.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 18644-18891

#### Scenario: ilk returns #integer for integer
- **WHEN** `ilk(42)` is called
- **THEN** returns `Symbol.for("integer")`

#### Scenario: ilk returns #float for float
- **WHEN** `ilk(3.14)` is called
- **THEN** returns `Symbol.for("float")`

#### Scenario: ilk returns #string for string
- **WHEN** `ilk("hello")` is called
- **THEN** returns `Symbol.for("string")`

#### Scenario: ilk returns #list for List
- **WHEN** `ilk(list(1, 2, 3))` is called
- **THEN** returns `Symbol.for("list")`

#### Scenario: ilk returns #propList for PropList
- **WHEN** `ilk(propList(#a, 1))` is called
- **THEN** returns `Symbol.for("propList")`

#### Scenario: ilk returns #symbol for symbol
- **WHEN** `ilk(Symbol.for("test"))` is called
- **THEN** returns `Symbol.for("symbol")`

#### Scenario: ilk returns #void for undefined
- **WHEN** `ilk(undefined)` is called
- **THEN** returns `Symbol.for("void")`

### Requirement: integerP() SHALL check for integer type

The `integerP()` function SHALL return true if the value is an integer.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 19330-19359

#### Scenario: integerP returns true for integer
- **WHEN** `integerP(42)` is called
- **THEN** returns `true`

#### Scenario: integerP returns false for float
- **WHEN** `integerP(3.14)` is called
- **THEN** returns `false`

#### Scenario: integerP returns false for string
- **WHEN** `integerP("42")` is called
- **THEN** returns `false`

### Requirement: listP() SHALL check for list type

The `listP()` function SHALL return true if the value is a List instance.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 19966-19988

#### Scenario: listP returns true for List
- **WHEN** `listP(list(1, 2, 3))` is called
- **THEN** returns `true`

#### Scenario: listP returns false for PropList
- **WHEN** `listP(propList(#a, 1))` is called
- **THEN** returns `false`

#### Scenario: listP returns false for array
- **WHEN** `listP([1, 2, 3])` is called
- **THEN** returns `false`

### Requirement: objectP() SHALL check for object type

The `objectP()` function SHALL return true if the value is a script instance (object).

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 22400-22433

#### Scenario: objectP returns true for object
- **WHEN** `objectP(newFn(script("MyParent")))` is called
- **THEN** returns `true`

#### Scenario: objectP returns false for primitive
- **WHEN** `objectP(42)` is called
- **THEN** returns `false`

### Requirement: stringP() SHALL check for string type

The `stringP()` function SHALL return true if the value is a string.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 28556-28578

#### Scenario: stringP returns true for string
- **WHEN** `stringP("hello")` is called
- **THEN** returns `true`

#### Scenario: stringP returns false for number
- **WHEN** `stringP(42)` is called
- **THEN** returns `false`

### Requirement: symbolP() SHALL check for symbol type

The `symbolP()` function SHALL return true if the value is a symbol.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 28730-28751

#### Scenario: symbolP returns true for symbol
- **WHEN** `symbolP(Symbol.for("test"))` is called
- **THEN** returns `true`

#### Scenario: symbolP returns false for string
- **WHEN** `symbolP("test")` is called
- **THEN** returns `false`

### Requirement: voidP() SHALL check for void type

The `voidP()` function SHALL return true if the value is void (undefined or null).

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 30146-30168

#### Scenario: voidP returns true for undefined
- **WHEN** `voidP(undefined)` is called
- **THEN** returns `true`

#### Scenario: voidP returns true for null
- **WHEN** `voidP(null)` is called
- **THEN** returns `true`

#### Scenario: voidP returns false for value
- **WHEN** `voidP(42)` is called
- **THEN** returns `false`

### Requirement: All type checking functions SHALL match Director MX 2004 exactly

Each type checking function SHALL behave exactly as documented in Director MX 2004. See individual spec files for full documentation:

- `floatP.md` - Check if value is float
- `ilk.md` - Return type symbol
- `integerP.md` - Check if value is integer
- `listP.md` - Check if value is list
- `objectP.md` - Check if value is object
- `stringP.md` - Check if value is string
- `symbolP.md` - Check if value is symbol
- `voidP.md` - Check if value is void

#### Scenario: All functions implemented
- **WHEN** any type checking function is called
- **THEN** behavior matches Director MX 2004 documentation exactly
