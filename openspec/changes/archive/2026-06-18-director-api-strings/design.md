## Context

The Director MX 2004 string functions are pure functions that manipulate strings. These functions must follow Director's specific string handling rules, which may differ from JavaScript's native string methods.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

## Goals / Non-Goals

**Goals:**
- Implement all 3 string functions matching Director MX 2004 behavior exactly
- Each function has its own spec file with full documentation
- Each function has its own implementation file
- Each function has co-located tests
- Functions are pure (no side effects)

**Non-Goals:**
- Complex string parsing beyond what Director supports
- Integration with JavaScript's string methods (Director has its own rules)
- Performance optimization (these are simple operations)

## Decisions

### Decision 1: File structure

**Choice**: One file per function
```
apps/client/src/director/api/
├── chars.js
├── length.js
├── offset.js
├── __tests__/
│   ├── chars.test.js
│   ├── length.test.js
│   └── offset.test.js
```

**Rationale**: Follows the atomic file structure established in director-architecture. Each function is independent and can be implemented/tested in isolation.

### Decision 2: String indexing

**Choice**: Use 1-based indexing for Director string operations
```javascript
// Director: chars("hello", 2, 4) returns "ell"
export function chars(str, start, end) {
  return str.substring(start - 1, end);
}
```

**Rationale**: Director uses 1-based indexing for string positions, while JavaScript uses 0-based. We need to adjust the indices.

### Decision 3: Length function

**Choice**: Use String.prototype.length property
```javascript
// Director: length("hello") returns 5
export function length(str) {
  return str.length;
}
```

**Rationale**: Director's length() function returns the number of characters in a string. JavaScript's length property matches this behavior.

### Decision 4: Offset function

**Choice**: Use String.prototype.indexOf() with 1-based result
```javascript
// Director: offset("ll", "hello") returns 3
export function offset(substring, str) {
  const index = str.indexOf(substring);
  return index === -1 ? 0 : index + 1;
}
```

**Rationale**: Director's offset() returns the 1-based position of a substring, or 0 if not found. JavaScript's indexOf() returns 0-based position or -1. We need to adjust both the result and the not-found value.

### Decision 5: Export strategy

**Choice**: Each file exports a single named function
```javascript
// chars.js
export function chars(str, start, end) {
  return str.substring(start - 1, end);
}
```

**Rationale**: Follows ES6 module best practices. The api/index.js will re-export all functions.

## Risks / Trade-offs

**Risk**: String indexing may not match Director's exact behavior for edge cases
→ **Mitigation**: Follow Director MX 2004 documentation exactly, test edge cases

**Risk**: offset() may not handle all substring search patterns
→ **Mitigation**: Implement basic substring search, extend as needed

**Trade-off**: One file per function vs. grouping in strings.js
→ **Acceptable**: Atomic structure is more important than file count for this project
