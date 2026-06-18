## Context

The Director MX 2004 control functions manage movie playback and event flow. These functions must follow Director's specific control flow rules, which include frame navigation and event handling.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

## Goals / Non-Goals

**Goals:**
- Implement all 5 control functions matching Director MX 2004 behavior exactly
- Each function has its own spec file with full documentation
- Each function has its own implementation file
- Each function has co-located tests
- Functions integrate with MovieRef for playback control

**Non-Goals:**
- Complex control flow algorithms beyond the 5 functions
- Integration with JavaScript's control flow (Director has its own functions)
- Performance optimization (these are simple operations)

## Decisions

### Decision 1: File structure

**Choice**: One file per function
```
apps/client/src/director/api/
├── abort.js
├── go.js
├── halt.js
├── quit.js
├── stopEvent.js
├── __tests__/
│   ├── abort.test.js
│   ├── go.test.js
│   ├── halt.test.js
│   ├── quit.test.js
│   └── stopEvent.test.js
```

**Rationale**: Follows the atomic file structure established in director-architecture. Each function is independent and can be implemented/tested in isolation.

### Decision 2: Abort function

**Choice**: Use JavaScript's throw to abort handler
```javascript
// Director: abort() aborts current handler
export function abort() {
  throw new Error("abort");
}
```

**Rationale**: Director's abort() function stops the current handler. We use throw to simulate this.

### Decision 3: Go function

**Choice**: Use MovieRef.go() for frame navigation
```javascript
import { _movie } from "../core";

// Director: go(5) goes to frame 5
export function go(frame) {
  _movie.go(frame);
}
```

**Rationale**: Director's go() function navigates to a frame. We delegate to MovieRef.go().

### Decision 4: Halt function

**Choice**: Use MovieRef.halt() to stop playback
```javascript
import { _movie } from "../core";

// Director: halt() stops movie playback
export function halt() {
  _movie.halt();
}
```

**Rationale**: Director's halt() function stops movie playback. We delegate to MovieRef.halt().

### Decision 5: Quit function

**Choice**: Use MovieRef.quit() to exit application
```javascript
import { _movie } from "../core";

// Director: quit() exits the application
export function quit() {
  _movie.quit();
}
```

**Rationale**: Director's quit() function exits the application. We delegate to MovieRef.quit().

### Decision 6: StopEvent function

**Choice**: Use MovieRef.stopEvent() to stop event propagation
```javascript
import { _movie } from "../core";

// Director: stopEvent() stops event propagation
export function stopEvent() {
  _movie.stopEvent();
}
```

**Rationale**: Director's stopEvent() function stops event propagation. We delegate to MovieRef.stopEvent().

### Decision 7: Export strategy

**Choice**: Each file exports a single named function
```javascript
// go.js
export function go(frame) {
  _movie.go(frame);
}
```

**Rationale**: Follows ES6 module best practices. The api/index.js will re-export all functions.

## Risks / Trade-offs

**Risk**: Control functions may not match Director's exact behavior for edge cases
→ **Mitigation**: Follow Director MX 2004 documentation exactly, test edge cases

**Risk**: Abort using throw may not match Director's abort behavior
→ **Mitigation**: Document that abort throws an error, catch in event handlers

**Trade-off**: One file per function vs. grouping in control.js
→ **Acceptable**: Atomic structure is more important than file count for this project
