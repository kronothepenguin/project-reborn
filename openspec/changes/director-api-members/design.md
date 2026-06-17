## Context

The Director MX 2004 member access functions are factory and accessor functions for creating and accessing Director objects. These functions must follow Director's specific object access rules, which include 1-based indexing for sprites and members, and support for both numeric and name-based access.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

## Goals / Non-Goals

**Goals:**
- Implement all 7 member access functions matching Director MX 2004 behavior exactly
- Each function has its own spec file with full documentation
- Each function has its own implementation file
- Each function has co-located tests
- Functions integrate with core Ref classes

**Non-Goals:**
- Complex object creation beyond what Director supports
- Integration with JavaScript objects (Director has its own object types)
- Performance optimization (these are simple operations)

## Decisions

### Decision 1: File structure

**Choice**: One file per function
```
apps/client/src/director/api/
├── member.js
├── sprite.js
├── castLib.js
├── script.js
├── point.js
├── rect.js
├── color.js
├── __tests__/
│   ├── member.test.js
│   ├── sprite.test.js
│   └── ...
```

**Rationale**: Follows the atomic file structure established in director-architecture. Each function is independent and can be implemented/tested in isolation.

### Decision 2: Member access

**Choice**: Use MemberRef class from core with indexed registry
```javascript
import { _movie } from "../core";

// Director: member(1) returns first member
// Director: member("name") returns member by name
export function member(id, castLibNum = 1) {
  const castLib = _movie.castLib[castLibNum];
  if (typeof id === "number") {
    return castLib.member[id];
  }
  return castLib.member[id];
}
```

**Rationale**: Director's member() function accesses cast members by number or name from the current cast library.

### Decision 3: Sprite access

**Choice**: Use SpriteRef class from core with indexed registry
```javascript
import { _movie } from "../core";

// Director: sprite(1) returns sprite in channel 1
export function sprite(channel) {
  return _movie.sprite[channel];
}
```

**Rationale**: Director's sprite() function accesses sprites by channel number (1-based).

### Decision 4: Cast library access

**Choice**: Use CastLibraryRef class from core
```javascript
import { _movie } from "../core";

// Director: castLib(1) returns first cast library
export function castLib(id) {
  if (typeof id === "number") {
    return _movie.castLib[id];
  }
  // Search by name
  for (let i = 1; i <= _movie.castLib.count; i++) {
    if (_movie.castLib[i].name === id) {
      return _movie.castLib[i];
    }
  }
  return null;
}
```

**Rationale**: Director's castLib() function accesses cast libraries by number or name.

### Decision 5: Script access

**Choice**: Use script member type
```javascript
import { member } from "./member";

// Director: script("name") returns script member
export function script(nameOrNum) {
  const mem = member(nameOrNum);
  if (mem.type === Symbol.for("script")) {
    return mem;
  }
  return null;
}
```

**Rationale**: Director's script() function accesses script cast members.

### Decision 6: Point/Rect/Color creation

**Choice**: Use Point, Rect, Color classes from core
```javascript
import { Point, Rect, Color } from "../core";

// Director: point(100, 200) creates a point
export function point(h, v) {
  return new Point(h, v);
}

// Director: rect(10, 20, 100, 200) creates a rect
export function rect(left, top, right, bottom) {
  return new Rect(left, top, right, bottom);
}

// Director: color(255, 128, 0) creates a color
export function color(r, g, b) {
  return new Color(r, g, b);
}
```

**Rationale**: Director's point(), rect(), and color() functions create instances of the Point, Rect, and Color classes.

### Decision 7: Export strategy

**Choice**: Each file exports a single named function
```javascript
// member.js
export function member(id, castLibNum = 1) {
  // ...
}
```

**Rationale**: Follows ES6 module best practices. The api/index.js will re-export all functions.

## Risks / Trade-offs

**Risk**: Member access may not match Director's exact behavior for edge cases
→ **Mitigation**: Follow Director MX 2004 documentation exactly, test edge cases

**Risk**: Indexed registry may not handle all access patterns
→ **Mitigation**: Implement both numeric and name-based access as documented

**Trade-off**: One file per function vs. grouping in members.js
→ **Acceptable**: Atomic structure is more important than file count for this project
