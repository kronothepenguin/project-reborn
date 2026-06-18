## Context

The Director MX 2004 list functions are factory and utility functions for creating and manipulating lists. These functions must follow Director's specific list handling rules, which include 1-based indexing and support for both linear lists and property lists.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

## Goals / Non-Goals

**Goals:**
- Implement all 6 list functions matching Director MX 2004 behavior exactly
- Each function has its own spec file with full documentation
- Each function has its own implementation file
- Each function has co-located tests
- Functions integrate with List and PropList classes from core

**Non-Goals:**
- Complex list algorithms beyond what Director supports
- Integration with JavaScript arrays (Director has its own list types)
- Performance optimization (these are simple operations)

## Decisions

### Decision 1: File structure

**Choice**: One file per function
```
apps/client/src/director/api/
├── list.js
├── propList.js
├── count.js
├── duplicate.js
├── makeSubList.js
├── union.js
├── __tests__/
│   ├── list.test.js
│   ├── propList.test.js
│   └── ...
```

**Rationale**: Follows the atomic file structure established in director-architecture. Each function is independent and can be implemented/tested in isolation.

### Decision 2: List creation

**Choice**: Use List and PropList classes from core
```javascript
import { List, PropList } from "../core";

// Director: list(1, 2, 3) creates a linear list
export function list(...args) {
  return new List(...args);
}

// Director: propList(#a, 1, #b, 2) creates a property list
export function propList(...args) {
  return new PropList(...args);
}
```

**Rationale**: Director's list() and propList() functions create instances of the List and PropList classes. We delegate to these classes.

### Decision 3: Count function

**Choice**: Use the count property of List/PropList
```javascript
// Director: count(myList) returns the number of items
export function count(list) {
  return list.count;
}
```

**Rationale**: Director's count() function returns the number of items in a list. The List and PropList classes already have a count property.

### Decision 4: Duplicate function

**Choice**: Use the duplicate() method of List/PropList
```javascript
// Director: duplicate(myList) creates a copy
export function duplicate(list) {
  return list.duplicate();
}
```

**Rationale**: Director's duplicate() function creates a shallow copy of a list. The List and PropList classes already have a duplicate() method.

### Decision 5: makeSubList function

**Choice**: Extract a range of items from a list
```javascript
// Director: makeSubList(myList, 2, 4) extracts items 2-4
export function makeSubList(list, start, end) {
  const result = new List();
  for (let i = start; i <= end; i++) {
    result.add(list.getAt(i));
  }
  return result;
}
```

**Rationale**: Director's makeSubList() extracts a contiguous range of items from a list using 1-based indexing.

### Decision 6: Union function

**Choice**: Combine two lists without duplicates
```javascript
// Director: union(list1, list2) combines lists
export function union(list1, list2) {
  const result = list1.duplicate();
  for (let i = 1; i <= list2.count; i++) {
    const item = list2.getAt(i);
    if (result.getOne(item) === 0) {
      result.add(item);
    }
  }
  return result;
}
```

**Rationale**: Director's union() combines two lists, adding items from the second list that aren't already in the first.

### Decision 7: Export strategy

**Choice**: Each file exports a single named function
```javascript
// list.js
export function list(...args) {
  return new List(...args);
}
```

**Rationale**: Follows ES6 module best practices. The api/index.js will re-export all functions.

## Risks / Trade-offs

**Risk**: List operations may not match Director's exact behavior for edge cases
→ **Mitigation**: Follow Director MX 2004 documentation exactly, test edge cases

**Risk**: Property list handling may not match Director's symbol-based keys
→ **Mitigation**: Use Symbol.for() for property keys as established in core

**Trade-off**: One file per function vs. grouping in lists.js
→ **Acceptable**: Atomic structure is more important than file count for this project
