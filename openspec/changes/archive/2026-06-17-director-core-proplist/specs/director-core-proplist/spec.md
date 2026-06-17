## ADDED Requirements

### Requirement: PropList class SHALL be implemented in core/prop-list.js

The `PropList` class SHALL be implemented in `apps/client/src/director/core/prop-list.js` with all methods documented in Director MX 2004.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

**File**: `apps/client/src/director/core/prop-list.js`
**Test**: `apps/client/src/director/core/__tests__/prop-list.test.js`

#### Scenario: PropList class is importable
- **WHEN** code imports `import { PropList } from "../../director/core"`
- **THEN** PropList class is available

#### Scenario: PropList can be instantiated
- **WHEN** `new PropList(Symbol.for("name"), "John", Symbol.for("age"), 30)` is called
- **THEN** returns PropList containing {#name: "John", #age: 30}

### Requirement: PropList SHALL use Symbol keys

All property keys in PropList SHALL be JavaScript Symbols (using Symbol.for()).

#### Scenario: getaProp with symbol key
- **WHEN** `proplist.getaProp(Symbol.for("name"))` is called
- **THEN** returns the value associated with #name symbol

#### Scenario: setaProp with symbol key
- **WHEN** `proplist.setaProp(Symbol.for("age"), 25)` is called
- **THEN** sets #age property to 25

### Requirement: PropList SHALL use 1-indexed positions

All position parameters in PropList methods SHALL be 1-indexed (first item is at position 1).

#### Scenario: getAt(1) returns first item
- **WHEN** `proplist.getAt(1)` is called
- **THEN** returns the first property value

#### Scenario: setAt(1, value) sets first item
- **WHEN** `proplist.setAt(1, newValue)` is called
- **THEN** sets the first property value to newValue

### Requirement: PropList SHALL support sorted proplists

When a PropList is sorted, the `addProp()` method SHALL insert items in sorted order by symbol name.

#### Scenario: addProp() maintains sort order
- **WHEN** proplist is sorted and `proplist.addProp(Symbol.for("middle"), value)` is called
- **THEN** inserts in sorted position by symbol name

### Requirement: PropList SHALL support symbol access via Proxy

PropList instances SHALL support bracket access syntax `proplist[Symbol.for("key")]` for getting and setting properties.

#### Scenario: Bracket access gets property
- **WHEN** `proplist[Symbol.for("name")]` is accessed
- **THEN** returns the value associated with #name

#### Scenario: Bracket access sets property
- **WHEN** `proplist[Symbol.for("age")] = 30` is executed
- **THEN** sets #age property to 30

### Requirement: PropList methods SHALL match Director MX 2004 exactly

Each PropList method SHALL behave exactly as documented in Director MX 2004. See individual spec files for full documentation:

- `addProp.md` - Add property/value pair
- `count.md` - Get proplist count
- `deleteAt.md` - Delete item at position
- `deleteOne.md` - Delete first occurrence of value
- `deleteProp.md` - Delete property by symbol
- `duplicate.md` - Duplicate proplist
- `findPos.md` - Find position of property
- `findPosNear.md` - Find nearest position
- `getaProp.md` - Get property by symbol
- `getAt.md` - Get item at position
- `getOne.md` - Get position of value
- `getPos.md` - Get position of value
- `getProp.md` - Get property (throws if not found)
- `getPropAt.md` - Get property at index
- `setaProp.md` - Set property by symbol
- `setAt.md` - Set item at position
- `sort.md` - Sort proplist
- `propList.md` - Create new proplist

#### Scenario: All methods implemented
- **WHEN** any PropList method is called
- **THEN** behavior matches Director MX 2004 documentation exactly
