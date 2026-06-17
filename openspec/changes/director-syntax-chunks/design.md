## Context

Director chunk expressions provide a way to access parts of strings using natural language-like syntax. In Lingo, you write `char 3 of "hello"` to get the third character, `item 2 of "a,b,c"` to get the second item, etc. This needs to be implemented as JavaScript functions that parse and extract string chunks.

**Source**: `docs/drmx2004_scripting_ref.txt` Chapter 11: Keywords
**Current State**: Partial implementation in `syntax.js` with incomplete functionality

## Goals / Non-Goals

**Goals:**
- Implement all 4 chunk helpers (char, item, line, word)
- Each helper has its own spec file with full documentation
- Support 1-based indexing as in Director
- Co-located tests for each helper

**Non-Goals:**
- Complex chunk expressions with multiple levels
- Chunk expressions on field members (only strings)

## Decisions

### Decision 1: File structure

**Choice**: One file per helper
```
apps/client/src/director/syntax/
├── char.js
├── item.js
├── line.js
├── word.js
├── __tests__/
│   ├── char.test.js
│   ├── item.test.js
│   ├── line.test.js
│   └── word.test.js
```

**Rationale**: Each helper is independent and can be implemented/tested in isolation.

### Decision 2: Function signatures

**Choice**: Match Director's chunk expression syntax
```javascript
// Director: char 3 of "hello" returns "l"
export function char(n, str) {
  return str[n - 1];  // Convert 1-based to 0-based
}

// Director: item 2 of "a,b,c" returns "b"
export function item(n, str, delimiter = ",") {
  return str.split(delimiter)[n - 1];
}
```

**Rationale**: Director uses 1-based indexing. We convert to JavaScript's 0-based internally.

### Decision 3: Range support

**Choice**: Support ranges with `to` keyword
```javascript
// Director: char 2 to 4 of "hello" returns "ell"
export function charRange(start, end, str) {
  return str.substring(start - 1, end);
}
```

**Rationale**: Director supports ranges in chunk expressions.

### Decision 4: Delimiter handling

**Choice**: Use `the itemDelimiter` for item chunks
```javascript
import { the } from "./the-proxy";

export function item(n, str) {
  return str.split(the.itemDelimiter)[n - 1];
}
```

**Rationale**: Director uses `the itemDelimiter` property to determine item separator.

## Risks / Trade-offs

**Risk**: Chunk expressions may not match Director's exact behavior for edge cases
→ **Mitigation**: Follow Director MX 2004 documentation exactly, test edge cases

**Risk**: Performance overhead for string splitting
→ **Mitigation**: Cache split results when possible

**Trade-off**: One file per helper vs. single chunks.js file
→ **Acceptable**: Atomic structure is more important than file count for this project
