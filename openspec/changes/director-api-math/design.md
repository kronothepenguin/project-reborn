## Context

The Director MX 2004 math functions are pure mathematical operations that need to be implemented as part of the public API. These functions wrap JavaScript's built-in Math object but must follow Director's specific behavior and naming conventions.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

## Goals / Non-Goals

**Goals:**
- Implement all 11 math functions matching Director MX 2004 behavior exactly
- Each function has its own spec file with full documentation
- Each function has its own implementation file
- Each function has co-located tests
- Functions are pure (no side effects)

**Non-Goals:**
- Complex mathematical operations beyond the 11 functions
- Integration with Director's List/PropList for max/min (those are separate functions)
- Performance optimization (these are simple wrappers)

## Decisions

### Decision 1: File structure

**Choice**: One file per function
```
apps/client/src/director/api/
├── abs.js
├── atan.js
├── cos.js
├── log.js
├── max.js
├── min.js
├── power.js
├── random.js
├── sin.js
├── sqrt.js
├── tan.js
├── __tests__/
│   ├── abs.test.js
│   ├── atan.test.js
│   └── ...
```

**Rationale**: Follows the atomic file structure established in director-architecture. Each function is independent and can be implemented/tested in isolation.

### Decision 2: Function signatures

**Choice**: Match Director MX 2004 signatures exactly
```javascript
// Director: abs(numericExpression)
export function abs(numericExpression) {
  return Math.abs(numericExpression);
}

// Director: max(value1, value2) or max(list)
export function max(value1, value2) {
  if (value1 instanceof List) {
    return Math.max(...value1._values);
  }
  return Math.max(value1, value2);
}
```

**Rationale**: Director's API must be matched exactly for compatibility. Some functions like max/min have multiple signatures.

### Decision 3: List support for max/min

**Choice**: Check if first argument is a List instance
```javascript
export function max(value1, value2) {
  if (value1 instanceof List) {
    return Math.max(...value1._values);
  }
  return Math.max(value1, value2);
}
```

**Rationale**: Director's max/min can accept either two values or a list. We need to handle both cases.

### Decision 4: Random number generation

**Choice**: Use JavaScript's Math.random() with Director's 1-indexed range
```javascript
export function random(maxValue) {
  return Math.floor(Math.random() * maxValue) + 1;
}
```

**Rationale**: Director's random() returns 1 to maxValue (inclusive), not 0 to maxValue-1 like JavaScript.

### Decision 5: Export strategy

**Choice**: Each file exports a single named function
```javascript
// abs.js
export function abs(numericExpression) {
  return Math.abs(numericExpression);
}
```

**Rationale**: Follows ES6 module best practices. The api/index.js will re-export all functions.

## Risks / Trade-offs

**Risk**: max/min with List requires List class to be implemented
→ **Mitigation**: Import List from core, implement basic instanceof check

**Risk**: random() may not match Director's random number sequence
→ **Mitigation**: Director's random sequence is not guaranteed, only the range matters

**Risk**: Trigonometric functions use radians, not degrees
→ **Mitigation**: Document this clearly in specs, Director also uses radians

**Trade-off**: One file per function vs. grouping in math.js
→ **Acceptable**: Atomic structure is more important than file count for this project
