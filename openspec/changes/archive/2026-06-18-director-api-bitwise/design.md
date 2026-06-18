## Context

The Director MX 2004 bitwise functions perform bitwise operations on integers. These functions must follow Director's specific bitwise operation rules, which use JavaScript's bitwise operators.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

## Goals / Non-Goals

**Goals:**
- Implement all 4 bitwise functions matching Director MX 2004 behavior exactly
- Each function has its own spec file with full documentation
- Each function has its own implementation file
- Each function has co-located tests
- Functions are pure (no side effects)

**Non-Goals:**
- Complex bitwise algorithms beyond the 4 functions
- Integration with JavaScript's bitwise operators (Director has its own functions)
- Performance optimization (these are simple operations)

## Decisions

### Decision 1: File structure

**Choice**: One file per function
```
apps/client/src/director/api/
├── bitAnd.js
├── bitNot.js
├── bitOr.js
├── bitXor.js
├── __tests__/
│   ├── bitAnd.test.js
│   ├── bitNot.test.js
│   ├── bitOr.test.js
│   └── bitXor.test.js
```

**Rationale**: Follows the atomic file structure established in director-architecture. Each function is independent and can be implemented/tested in isolation.

### Decision 2: Bitwise operations

**Choice**: Use JavaScript's bitwise operators
```javascript
// Director: bitAnd(5, 3) returns 1 (101 & 011 = 001)
export function bitAnd(a, b) {
  return a & b;
}

// Director: bitNot(5) returns -6 (~101 = ...111010)
export function bitNot(a) {
  return ~a;
}

// Director: bitOr(5, 3) returns 7 (101 | 011 = 111)
export function bitOr(a, b) {
  return a | b;
}

// Director: bitXor(5, 3) returns 6 (101 ^ 011 = 110)
export function bitXor(a, b) {
  return a ^ b;
}
```

**Rationale**: Director's bitwise functions map directly to JavaScript's bitwise operators.

### Decision 3: Integer handling

**Choice**: JavaScript bitwise operators work on 32-bit integers
```javascript
// All bitwise operations work on 32-bit signed integers
export function bitAnd(a, b) {
  return a & b;  // Automatically converts to 32-bit
}
```

**Rationale**: JavaScript's bitwise operators automatically convert operands to 32-bit signed integers, matching Director's behavior.

### Decision 4: Export strategy

**Choice**: Each file exports a single named function
```javascript
// bitAnd.js
export function bitAnd(a, b) {
  return a & b;
}
```

**Rationale**: Follows ES6 module best practices. The api/index.js will re-export all functions.

## Risks / Trade-offs

**Risk**: Bitwise operations may not match Director's exact behavior for edge cases
→ **Mitigation**: Follow Director MX 2004 documentation exactly, test edge cases

**Risk**: 32-bit integer overflow may differ from Director
→ **Mitigation**: JavaScript's bitwise operators handle this consistently

**Trade-off**: One file per function vs. grouping in bitwise.js
→ **Acceptable**: Atomic structure is more important than file count for this project
