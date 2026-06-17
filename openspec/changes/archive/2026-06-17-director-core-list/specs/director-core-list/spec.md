## ADDED Requirements

### Requirement: List class SHALL be implemented in core/list.js

The `List` class SHALL be implemented in `apps/client/src/director/core/list.js` with all methods documented in Director MX 2004.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

**File**: `apps/client/src/director/core/list.js`
**Test**: `apps/client/src/director/core/__tests__/list.test.js`

#### Scenario: List class is importable
- **WHEN** code imports `import { List } from "../../director/core"`
- **THEN** List class is available

#### Scenario: List can be instantiated
- **WHEN** `new List(1, 2, 3)` is called
- **THEN** returns List containing [1, 2, 3]

### Requirement: List SHALL use 1-indexed positions

All position parameters in List methods SHALL be 1-indexed (first item is at position 1).

#### Scenario: getAt(1) returns first item
- **WHEN** `list.getAt(1)` is called on List(10, 20, 30)
- **THEN** returns `10`

#### Scenario: addAt(1, value) inserts at beginning
- **WHEN** `list.addAt(1, 99)` is called on List(10, 20, 30)
- **THEN** list becomes [99, 10, 20, 30]

### Requirement: List SHALL support sorted lists

When a List is sorted, the `add()` method SHALL insert items in sorted order.

#### Scenario: add() maintains sort order
- **WHEN** list is sorted and `list.add(15)` is called on List(10, 20, 30)
- **THEN** list becomes [10, 15, 20, 30]

### Requirement: List SHALL support bracket access via Proxy

List instances SHALL support bracket access syntax `list[n]` for getting and setting items.

#### Scenario: Bracket access gets item
- **WHEN** `list[1]` is accessed on List(10, 20, 30)
- **THEN** returns `10`

#### Scenario: Bracket access sets item
- **WHEN** `list[2] = 99` is executed on List(10, 20, 30)
- **THEN** list becomes [10, 99, 30]

### Requirement: List methods SHALL match Director MX 2004 exactly

Each List method SHALL behave exactly as documented in Director MX 2004. See individual spec files for full documentation:

- `add.md` - Add value to list
- `addAt.md` - Insert value at position
- `append.md` - Append value to end
- `count.md` - Get list count
- `deleteAt.md` - Delete item at position
- `deleteOne.md` - Delete first occurrence of value
- `deleteProp.md` - Delete property at index
- `duplicate-list-function.md` - Duplicate list
- `getAt.md` - Get item at position
- `getOne.md` - Get position of value
- `getPos.md` - Get position of value
- `getLast.md` - Get last item
- `setAt.md` - Set item at position
- `sort.md` - Sort list
- `list.md` - Create new list

#### Scenario: All methods implemented
- **WHEN** any List method is called
- **THEN** behavior matches Director MX 2004 documentation exactly
