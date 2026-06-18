## Context

The Director MX 2004 API includes many general-purpose functions that don't fit into the specific categories (math, typechecks, conversions, strings, lists, members, network, bitwise, control, sound). This change covers all remaining functions in the `general` category.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

## Goals / Non-Goals

**Goals:**
- Implement all ~311 remaining general functions matching Director MX 2004 behavior exactly
- Each function has its own spec file with full documentation
- Each function has its own implementation file
- Each function has co-located tests
- Functions integrate with appropriate core classes

**Non-Goals:**
- Functions already covered by other API changes (math, typechecks, etc.)
- 3D and DVD functions (those are excluded)
- Performance optimization (these are simple operations)

## Decisions

### Decision 1: File structure

**Choice**: One file per function
```
apps/client/src/director/api/
├── alert.js
├── appMinimize.js
├── beginRecording.js
├── breakLoop.js
├── browserName.js
├── ... (311 files total)
├── __tests__/
│   ├── alert.test.js
│   ├── appMinimize.test.js
│   └── ... (311 test files)
```

**Rationale**: Follows the atomic file structure established in director-architecture. Each function is independent and can be implemented/tested in isolation.

### Decision 2: Function categorization

**Choice**: Group functions by purpose in implementation order
```
1. Alert/dialog functions
2. Application control functions
3. Browser functions
4. Cache functions
5. Call functions
6. Camera functions
7. Recording functions
8. ... etc.
```

**Rationale**: Makes it easier to implement related functions together and track progress.

### Decision 3: Dependencies

**Choice**: Each function imports only what it needs from core
```javascript
// Example: alert.js
import { _player } from "../core";

export function alert(message) {
  _player.alert(message);
}
```

**Rationale**: Minimizes coupling between functions and core classes.

### Decision 4: Export strategy

**Choice**: Each file exports a single named function
```javascript
// alert.js
export function alert(message) {
  _player.alert(message);
}
```

**Rationale**: Follows ES6 module best practices. The api/index.js will re-export all functions.

### Decision 5: Implementation order

**Choice**: Implement functions in alphabetical order within each category
```
1. alert()
2. appMinimize()
3. beginRecording()
4. breakLoop()
5. ... etc.
```

**Rationale**: Makes it easy to track progress and ensures no functions are missed.

## Risks / Trade-offs

**Risk**: Large number of functions (~311) may be overwhelming
→ **Mitigation**: Implement in batches, track progress with tasks

**Risk**: Some functions may have complex dependencies
→ **Mitigation**: Document dependencies in each spec file

**Risk**: Some functions may not be implementable in browser
→ **Mitigation**: Document limitations, provide stub implementations

**Trade-off**: One file per function vs. grouping by category
→ **Acceptable**: Atomic structure is more important than file count for this project

**Trade-off**: Implement all 311 functions vs. prioritizing commonly used ones
→ **Acceptable**: Full implementation ensures Director MX 2004 compatibility
