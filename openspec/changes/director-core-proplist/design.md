## Context

The `PropList` class is one of the core data types in Director MX 2004. It represents a property list (dictionary/map) where keys are symbols and values can be any type. PropLists are used extensively in Director for passing named parameters and storing structured data.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

## Goals / Non-Goals

**Goals:**
- Implement complete `PropList` class matching Director MX 2004 behavior exactly
- Each method has its own spec file with full documentation
- 1-indexed positions (first item is at position 1)
- Support sorted and unsorted proplists
- Co-located tests
- Symbol keys (using JavaScript Symbol.for())

**Non-Goals:**
- List methods (those go in director-core-list)
- JavaScript Map/Object compatibility (we're implementing Director's PropList)

## Decisions

### Decision 1: File structure

**Choice**: Single file for PropList class, single test file
```
apps/client/src/director/core/
├── prop-list.js          # PropList class implementation
├── __tests__/
│   └── prop-list.test.js # All PropList tests
```

**Rationale**: PropList is a single cohesive class. Splitting each method into its own file would be overkill for a data structure.

### Decision 2: Symbol keys

**Choice**: Use JavaScript Symbol.for() for property keys
```javascript
const pl = new PropList(Symbol.for("name"), "John", Symbol.for("age"), 30)
pl.getaProp(Symbol.for("name"))  // Returns "John"
```

**Rationale**: Director uses symbols (#name in Lingo) for property keys. Symbol.for() provides global symbol registry matching Director's behavior.

### Decision 3: 1-indexed positions

**Choice**: All position parameters are 1-indexed
```javascript
proplist.getAt(1)  // Returns first item
proplist.setAt(2, value)  // Sets second item
```

**Rationale**: Director MX 2004 uses 1-indexed lists. This matches the official behavior.

### Decision 4: Proxy for symbol access

**Choice**: Use Proxy to support `proplist[Symbol.for("name")]` syntax
```javascript
const pl = createPropList(Symbol.for("name"), "John")
pl[Symbol.for("name")]  // Returns "John" (via proxy)
pl[Symbol.for("age")] = 30  // Sets property (via proxy)
```

**Rationale**: Director allows bracket access with symbols. Proxy enables this in JavaScript.

### Decision 5: Sorted proplist support

**Choice**: Support `sorted` flag that maintains sort order on addProp
```javascript
proplist.sort()  // Sorts the proplist and sets sorted flag
proplist.addProp(Symbol.for("key"), value)  // Inserts in sorted position
```

**Rationale**: Director MX 2004 supports sorted proplists where addProp() maintains sort order by symbol name.

## Risks / Trade-offs

**Risk**: Proxy overhead for symbol access
→ **Mitigation**: Only apply proxy when needed, direct method calls are faster

**Risk**: Symbol comparison may not match Director exactly
→ **Mitigation**: Use Director's comparison rules from documentation

**Trade-off**: Single file vs. one file per method
→ **Acceptable**: PropList methods are tightly coupled, single file is clearer
