## Context

Director's `put` statement provides ways to insert text into containers. In Lingo, you write `put "hello" into char 3 of myString` to replace a character, `put "x" before word 2 of myString` to insert before a word, etc. This needs to be implemented as JavaScript functions that modify strings or field members.

**Source**: `docs/drmx2004_scripting_ref.txt` Chapter 11: Keywords
**Current State**: Partial implementation in `syntax.js` with incomplete functionality

## Goals / Non-Goals

**Goals:**
- Implement all 3 put helpers (putInto, putBefore, putAfter)
- Each helper has its own spec file with full documentation
- Support chunk expressions (char, item, line, word)
- Co-located tests for each helper

**Non-Goals:**
- Complex put expressions with multiple levels
- Put to field members (only strings for now)

## Decisions

### Decision 1: File structure

**Choice**: One file per helper
```
apps/client/src/director/syntax/
├── put-into.js
├── put-before.js
├── put-after.js
├── __tests__/
│   ├── put-into.test.js
│   ├── put-before.test.js
│   └── put-after.test.js
```

**Rationale**: Each helper is independent and can be implemented/tested in isolation.

### Decision 2: Function signatures

**Choice**: Match Director's put statement syntax
```javascript
// Director: put "X" into char 3 of myString
export function putInto(value, chunk, str) {
  // Replace chunk with value
}

// Director: put "X" before word 2 of myString
export function putBefore(value, chunk, str) {
  // Insert value before chunk
}

// Director: put "X" after line 1 of myString
export function putAfter(value, chunk, str) {
  // Insert value after chunk
}
```

**Rationale**: Director's put statement has three variants. We implement each as a separate function.

### Decision 3: Chunk integration

**Choice**: Use chunk helpers to locate positions
```javascript
import { char, charRange } from "./char";

export function putInto(value, chunkStart, chunkEnd, str) {
  return str.substring(0, chunkStart - 1) + value + str.substring(chunkEnd);
}
```

**Rationale**: Put helpers need to know where chunks are located. We use chunk helpers for this.

### Decision 4: Immutability

**Choice**: Return new string, don't modify original
```javascript
export function putInto(value, chunkStart, chunkEnd, str) {
  return str.substring(0, chunkStart - 1) + value + str.substring(chunkEnd);
}
```

**Rationale**: JavaScript strings are immutable. We return a new string with the modification.

## Risks / Trade-offs

**Risk**: Put helpers may not match Director's exact behavior for edge cases
→ **Mitigation**: Follow Director MX 2004 documentation exactly, test edge cases

**Risk**: Chunk position calculation may be complex
→ **Mitigation**: Use chunk helpers to abstract position calculation

**Trade-off**: One file per helper vs. single put.js file
→ **Acceptable**: Atomic structure is more important than file count for this project
