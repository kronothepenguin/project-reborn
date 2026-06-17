## Context

The `List` class is one of the core data types in Director MX 2004. It represents an ordered collection of values (linear list) and provides methods for adding, removing, accessing, and manipulating items. Lists are 1-indexed in Director.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

## Goals / Non-Goals

**Goals:**
- Implement complete `List` class matching Director MX 2004 behavior exactly
- Each method has its own spec file with full documentation
- 1-indexed positions (first item is at position 1)
- Support both sorted and unsorted lists
- Co-located tests

**Non-Goals:**
- PropList methods (those go in director-core-proplist)
- JavaScript Array compatibility (we're implementing Director's List, not JS arrays)

## Decisions

### Decision 1: File structure

**Choice**: Single file for List class, single test file
```
apps/client/src/director/core/
├── list.js          # List class implementation
├── __tests__/
│   └── list.test.js # All List tests
```

**Rationale**: List is a single cohesive class. Splitting each method into its own file would be overkill for a data structure.

### Decision 2: 1-indexed positions

**Choice**: All position parameters are 1-indexed
```javascript
list.getAt(1)  // Returns first item
list.addAt(2, value)  // Inserts at second position
```

**Rationale**: Director MX 2004 uses 1-indexed lists. This matches the official behavior.

### Decision 3: Sorted list support

**Choice**: Support `sorted` flag that maintains sort order on add
```javascript
list.sort()  // Sorts the list and sets sorted flag
list.add(value)  // Inserts in sorted position if sorted flag is set
```

**Rationale**: Director MX 2004 supports sorted lists where add() maintains sort order.

### Decision 4: Proxy for bracket access

**Choice**: Use Proxy to support `list[1]` syntax
```javascript
const list = createList(10, 20, 30)
list[1]  // Returns 10 (via proxy)
list[2] = 99  // Sets second item (via proxy)
```

**Rationale**: Director allows bracket access to list items. Proxy enables this in JavaScript.

## Risks / Trade-offs

**Risk**: Proxy overhead for list access
→ **Mitigation**: Only apply proxy when needed, direct method calls are faster

**Risk**: Sorted list comparison may not match Director exactly
→ **Mitigation**: Use Director's comparison rules from documentation

**Trade-off**: Single file vs. one file per method
→ **Acceptable**: List methods are tightly coupled, single file is clearer
