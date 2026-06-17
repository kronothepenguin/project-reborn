## Context

The Director `the` keyword is a special syntax that provides access to system properties. In Lingo, you write `the frame` to get the current frame number, `the mouseH` to get the mouse X coordinate, etc. This needs to be implemented as a JavaScript Proxy that intercepts property access and returns the appropriate values from the core Ref classes.

**Source**: `docs/drmx2004_scripting_ref.txt` Chapter 14: Properties
**Current State**: Partial implementation in `syntax.js` with many properties missing

## Goals / Non-Goals

**Goals:**
- Implement complete `the` proxy with all system properties
- Each property has its own spec file with full documentation
- Properties delegate to appropriate core Ref classes
- Co-located tests for each property

**Non-Goals:**
- Writing to read-only properties (should throw or be ignored)
- Properties that require 3D or DVD support

## Decisions

### Decision 1: Proxy implementation

**Choice**: Use JavaScript Proxy for property access
```javascript
export const the = new Proxy({}, {
  get(target, prop) {
    switch (prop) {
      case 'frame': return _movie.frame;
      case 'mouseH': return _mouse.mouseH;
      // ... etc
    }
  }
});
```

**Rationale**: Proxy allows intercepting property access and delegating to appropriate objects.

### Decision 2: Property delegation

**Choice**: Each property delegates to the appropriate Ref class
```javascript
case 'frame': return _movie.frame;
case 'mouseH': return _mouse.mouseH;
case 'stage': return _movie.stage;
```

**Rationale**: Properties are already implemented in Ref classes. Proxy just provides the `the` syntax.

### Decision 3: Read-only enforcement

**Choice**: Throw error when setting read-only properties
```javascript
set(target, prop, value) {
  if (readOnlyProps.includes(prop)) {
    throw new Error(`Cannot set read-only property: the ${prop}`);
  }
  // ... handle writable properties
}
```

**Rationale**: Director enforces read-only on many properties. We should match this behavior.

### Decision 4: File structure

**Choice**: Single file for the proxy
```
apps/client/src/director/syntax/
├── the-proxy.js
└── __tests__/
    └── the-proxy.test.js
```

**Rationale**: The proxy is a single cohesive unit. Splitting would be over-engineering.

## Risks / Trade-offs

**Risk**: Proxy overhead for property access
→ **Mitigation**: Proxy is only used for `the` syntax, not general property access

**Risk**: Missing properties may cause runtime errors
→ **Mitigation**: Implement all properties documented in Director MX 2004

**Trade-off**: Single file vs. one file per property
→ **Acceptable**: Proxy is a single unit, properties are just cases in a switch
