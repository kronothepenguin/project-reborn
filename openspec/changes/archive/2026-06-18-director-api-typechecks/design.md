## Context

The Director MX 2004 type checking functions are pure functions that check the type of a value and return boolean or symbol results. These functions must follow Director's specific type system, which includes symbols for types like #integer, #float, #string, #list, #propList, etc.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

## Goals / Non-Goals

**Goals:**
- Implement all 8 type checking functions matching Director MX 2004 behavior exactly
- Each function has its own spec file with full documentation
- Each function has its own implementation file
- Each function has co-located tests
- Functions are pure (no side effects)
- Use JavaScript Symbol.for() for Director's symbol types

**Non-Goals:**
- Complex type inference beyond the 8 functions
- Integration with JavaScript's typeof operator (Director has its own type system)
- Performance optimization (these are simple checks)

## Decisions

### Decision 1: File structure

**Choice**: One file per function
```
apps/client/src/director/api/
├── floatP.js
├── ilk.js
├── integerP.js
├── listP.js
├── objectP.js
├── stringP.js
├── symbolP.js
├── voidP.js
├── __tests__/
│   ├── floatP.test.js
│   ├── ilk.test.js
│   └── ...
```

**Rationale**: Follows the atomic file structure established in director-architecture. Each function is independent and can be implemented/tested in isolation.

### Decision 2: Symbol-based type system

**Choice**: Use JavaScript Symbol.for() for Director's type symbols
```javascript
// Director: ilk(42) returns #integer
export function ilk(value) {
  if (Number.isInteger(value)) return Symbol.for("integer");
  if (typeof value === "number") return Symbol.for("float");
  if (typeof value === "string") return Symbol.for("string");
  // ... etc
}
```

**Rationale**: Director uses symbols (#integer, #float, etc.) for type identification. Symbol.for() provides global symbol registry matching Director's behavior.

### Decision 3: Type checking function naming

**Choice**: Use P suffix for predicate functions
```javascript
// Director: integerP(value) returns true/false
export function integerP(value) {
  return Number.isInteger(value);
}
```

**Rationale**: Director uses P suffix (integerP, floatP, etc.) for type predicates. This matches Director's naming convention.

### Decision 4: List vs PropList distinction

**Choice**: Check instanceof for List and PropList classes
```javascript
export function listP(value) {
  return value instanceof List;
}

export function ilk(value) {
  if (value instanceof List) return Symbol.for("list");
  if (value instanceof PropList) return Symbol.for("propList");
  // ...
}
```

**Rationale**: Director distinguishes between linear lists and property lists. We need to check against the actual class instances.

### Decision 5: Void vs undefined

**Choice**: Treat JavaScript undefined as Director's VOID
```javascript
export function voidP(value) {
  return value === undefined || value === null;
}
```

**Rationale**: Director's VOID is similar to JavaScript's undefined. We also treat null as void for compatibility.

### Decision 6: Export strategy

**Choice**: Each file exports a single named function
```javascript
// integerP.js
export function integerP(value) {
  return Number.isInteger(value);
}
```

**Rationale**: Follows ES6 module best practices. The api/index.js will re-export all functions.

## Risks / Trade-offs

**Risk**: Type checking may not match Director's exact behavior for edge cases
→ **Mitigation**: Follow Director MX 2004 documentation exactly, test edge cases

**Risk**: Symbol.for() may not match Director's symbol comparison
→ **Mitigation**: Director uses global symbol registry, Symbol.for() matches this

**Risk**: List/PropList detection requires core classes to be implemented
→ **Mitigation**: Import List/PropList from core, implement instanceof checks

**Trade-off**: One file per function vs. grouping in typechecks.js
→ **Acceptable**: Atomic structure is more important than file count for this project
