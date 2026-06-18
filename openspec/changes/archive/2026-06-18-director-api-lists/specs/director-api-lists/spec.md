## ADDED Requirements

### Requirement: List functions SHALL be implemented in api/ directory

The Director MX 2004 list functions SHALL be implemented in `apps/client/src/director/api/` with each function in its own file.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

**Files**:
- `apps/client/src/director/api/list.js`
- `apps/client/src/director/api/propList.js`
- `apps/client/src/director/api/count.js`
- `apps/client/src/director/api/duplicate.js`
- `apps/client/src/director/api/makeSubList.js`
- `apps/client/src/director/api/union.js`

**Tests**:
- `apps/client/src/director/api/__tests__/list.test.js`
- `apps/client/src/director/api/__tests__/propList.test.js`
- `apps/client/src/director/api/__tests__/count.test.js`
- `apps/client/src/director/api/__tests__/duplicate.test.js`
- `apps/client/src/director/api/__tests__/makeSubList.test.js`
- `apps/client/src/director/api/__tests__/union.test.js`

#### Scenario: List functions are importable
- **WHEN** code imports `import { list, propList, count } from "../../director/api"`
- **THEN** all list functions are available

#### Scenario: List functions integrate with core classes
- **WHEN** list functions are called
- **THEN** they return List or PropList instances from core

### Requirement: list() SHALL create linear list

The `list()` function SHALL create a new linear list with the provided values.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 19924-19965

#### Scenario: list creates empty list
- **WHEN** `list()` is called
- **THEN** returns empty List instance

#### Scenario: list creates list with values
- **WHEN** `list(1, 2, 3)` is called
- **THEN** returns List containing [1, 2, 3]

### Requirement: propList() SHALL create property list

The `propList()` function SHALL create a new property list with the provided key-value pairs.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 24462-24514

#### Scenario: propList creates empty proplist
- **WHEN** `propList()` is called
- **THEN** returns empty PropList instance

#### Scenario: propList creates proplist with pairs
- **WHEN** `propList(Symbol.for("a"), 1, Symbol.for("b"), 2)` is called
- **THEN** returns PropList containing {#a: 1, #b: 2}

### Requirement: count() SHALL return list count

The `count()` function SHALL return the number of items in a list.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 14057-14091

#### Scenario: count returns list count
- **WHEN** `count(list(1, 2, 3))` is called
- **THEN** returns `3`

#### Scenario: count returns 0 for empty list
- **WHEN** `count(list())` is called
- **THEN** returns `0`

### Requirement: duplicate() SHALL duplicate list

The `duplicate()` function SHALL create a shallow copy of a list.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 15435-15456

#### Scenario: duplicate creates copy
- **WHEN** `duplicate(list(1, 2, 3))` is called
- **THEN** returns new List containing [1, 2, 3]

#### Scenario: duplicate is shallow copy
- **WHEN** original list is modified after duplicate
- **THEN** duplicate remains unchanged

### Requirement: makeSubList() SHALL extract sublist

The `makeSubList()` function SHALL extract a range of items from a list.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 20182-20207

#### Scenario: makeSubList extracts range
- **WHEN** `makeSubList(list(1, 2, 3, 4, 5), 2, 4)` is called
- **THEN** returns List containing [2, 3, 4]

#### Scenario: makeSubList handles full range
- **WHEN** `makeSubList(list(1, 2, 3), 1, 3)` is called
- **THEN** returns List containing [1, 2, 3]

### Requirement: union() SHALL combine lists

The `union()` function SHALL combine two lists, adding items from the second that aren't in the first.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 29183-29207

#### Scenario: union combines lists
- **WHEN** `union(list(1, 2), list(2, 3))` is called
- **THEN** returns List containing [1, 2, 3]

#### Scenario: union preserves first list
- **WHEN** `union(list(1, 2), list(3, 4))` is called
- **THEN** returns List containing [1, 2, 3, 4]

### Requirement: All list functions SHALL match Director MX 2004 exactly

Each list function SHALL behave exactly as documented in Director MX 2004. See individual spec files for full documentation:

- `list.md` - Create linear list
- `propList.md` - Create property list
- `count.md` - Get list count
- `duplicate.md` - Duplicate list
- `makeSubList.md` - Create sublist
- `union.md` - Union of two lists

#### Scenario: All functions implemented
- **WHEN** any list function is called
- **THEN** behavior matches Director MX 2004 documentation exactly
