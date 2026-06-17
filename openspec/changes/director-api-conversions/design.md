## Context

The Director MX 2004 conversion functions are pure functions that convert values between different types. These functions must follow Director's specific conversion rules, which may differ from JavaScript's native type coercion.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

## Goals / Non-Goals

**Goals:**
- Implement all 7 conversion functions matching Director MX 2004 behavior exactly
- Each function has its own spec file with full documentation
- Each function has its own implementation file
- Each function has co-located tests
- Functions are pure (no side effects)
- Use JavaScript Symbol.for() for Director's symbol type

**Non-Goals:**
- Complex parsing beyond what Director supports
- Integration with JavaScript's type coercion (Director has its own rules)
- Performance optimization (these are simple conversions)

## Decisions

### Decision 1: File structure

**Choice**: One file per function
```
apps/client/src/director/api/
├── charToNum.js
├── float.js
├── integer.js
├── numToChar.js
├── string.js
├── symbol.js
├── value.js
├── __tests__/
│   ├── charToNum.test.js
│   ├── float.test.js
│   └── ...
```

**Rationale**: Follows the atomic file structure established in director-architecture. Each function is independent and can be implemented/tested in isolation.

### Decision 2: Symbol conversion

**Choice**: Use JavaScript Symbol.for() for Director's symbols
```javascript
// Director: symbol("test") returns #test
export function symbol(str) {
  return Symbol.for(str);
}
```

**Rationale**: Director uses symbols (#test, #integer, etc.) for type identification. Symbol.for() provides global symbol registry matching Director's behavior.

### Decision 3: Integer conversion

**Choice**: Use Math.trunc() for integer conversion (truncates toward zero)
```javascript
// Director: integer(3.9) returns 4 (rounds)
// Director: integer(-3.9) returns -4 (rounds)
export function integer(value) {
  return Math.round(value);
}
```

**Rationale**: Director's integer() rounds to nearest integer, not truncates. Math.round() matches this behavior.

### Decision 4: Float conversion

**Choice**: Use parseFloat() for float conversion
```javascript
// Director: float("3.14") returns 3.14
export function float(value) {
  return parseFloat(value);
}
```

**Rationale**: Director's float() converts strings and numbers to floating-point. parseFloat() matches this behavior.

### Decision 5: String conversion

**Choice**: Use String() for string conversion with special handling for symbols
```javascript
// Director: string(42) returns "42"
// Director: string(#test) returns "test"
export function string(value) {
  if (typeof value === "symbol") {
    return value.description;
  }
  return String(value);
}
```

**Rationale**: Director's string() converts symbols to their description (without the #). We need special handling for symbols.

### Decision 6: Value parsing

**Choice**: Parse strings to their corresponding Director values
```javascript
// Director: value("42") returns 42
// Director: value("TRUE") returns true
// Director: value("VOID") returns undefined
export function value(str) {
  if (str === "TRUE") return true;
  if (str === "FALSE") return false;
  if (str === "VOID") return undefined;
  if (str === "EMPTY") return "";
  const num = Number(str);
  if (!isNaN(num)) return num;
  return str;
}
```

**Rationale**: Director's value() parses strings to their corresponding values, including special keywords like TRUE, FALSE, VOID, EMPTY.

### Decision 7: Character/number conversion

**Choice**: Use charCodeAt() and String.fromCharCode()
```javascript
// Director: charToNum("A") returns 65
export function charToNum(char) {
  return char.charCodeAt(0);
}

// Director: numToChar(65) returns "A"
export function numToChar(code) {
  return String.fromCharCode(code);
}
```

**Rationale**: Director's charToNum() and numToChar() convert between characters and their ASCII/Unicode codes. JavaScript's built-in methods match this behavior.

### Decision 8: Export strategy

**Choice**: Each file exports a single named function
```javascript
// integer.js
export function integer(value) {
  return Math.round(value);
}
```

**Rationale**: Follows ES6 module best practices. The api/index.js will re-export all functions.

## Risks / Trade-offs

**Risk**: Conversion may not match Director's exact behavior for edge cases
→ **Mitigation**: Follow Director MX 2004 documentation exactly, test edge cases

**Risk**: Symbol.for() may not match Director's symbol comparison
→ **Mitigation**: Director uses global symbol registry, Symbol.for() matches this

**Risk**: value() parsing may not handle all Director value types
→ **Mitigation**: Implement basic parsing for common types, extend as needed

**Trade-off**: One file per function vs. grouping in conversions.js
→ **Acceptable**: Atomic structure is more important than file count for this project
