## Context

The `Point` class is one of the core data types in Director MX 2004. It represents a 2D coordinate with horizontal (locH) and vertical (locV) components. Points are used extensively in Director for sprite positions, mouse locations, and geometric operations.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

## Goals / Non-Goals

**Goals:**
- Implement complete `Point` class matching Director MX 2004 behavior exactly
- Each method/property has its own spec file with full documentation
- Support both constructor and property access
- Co-located tests

**Non-Goals:**
- 3D vector operations (those would be a separate Vector class)
- Complex geometric operations beyond inside()

## Decisions

### Decision 1: File structure

**Choice**: Single file for Point class, single test file
```
apps/client/src/director/core/
├── point.js          # Point class implementation
├── __tests__/
│   └── point.test.js # All Point tests
```

**Rationale**: Point is a simple data structure with few methods. Single file is clearer.

### Decision 2: Property names

**Choice**: Use `locH` and `locV` as primary property names
```javascript
const pt = new Point(100, 200)
pt.locH  // Returns 100
pt.locV  // Returns 200
```

**Rationale**: Director MX 2004 uses locH/locV. We could also support x/y as aliases.

### Decision 3: Constructor

**Choice**: Support both `new Point(h, v)` and `point(h, v)` factory function
```javascript
const pt1 = new Point(100, 200)
const pt2 = point(100, 200)  // Factory function
```

**Rationale**: Director supports both syntaxes. Factory function is more Lingo-like.

### Decision 4: Proxy for numeric access

**Choice**: Use Proxy to support `pt[1]` and `pt[2]` syntax
```javascript
const pt = createPointProxy(100, 200)
pt[1]  // Returns 100 (locH)
pt[2]  // Returns 200 (locV)
```

**Rationale**: Director allows numeric index access to point components.

## Risks / Trade-offs

**Risk**: Proxy overhead for point access
→ **Mitigation**: Only apply proxy when needed, direct property access is faster

**Trade-off**: Single file vs. separate files for point() and Point class
→ **Acceptable**: They're tightly coupled, single file is clearer
