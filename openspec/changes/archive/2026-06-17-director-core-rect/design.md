## Context

The `Rect` class is one of the core data types in Director MX 2004. It represents a rectangle with left, top, right, and bottom coordinates. Rects are used extensively in Director for sprite bounds, member dimensions, and geometric operations.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

## Goals / Non-Goals

**Goals:**
- Implement complete `Rect` class matching Director MX 2004 behavior exactly
- Each method/property has its own spec file with full documentation
- Support both constructor and property access
- Co-located tests

**Non-Goals:**
- Complex geometric operations (those would be separate functions)
- 3D bounding boxes

## Decisions

### Decision 1: File structure

**Choice**: Single file for Rect class, single test file
```
apps/client/src/director/core/
├── rect.js          # Rect class implementation
├── __tests__/
│   └── rect.test.js # All Rect tests
```

**Rationale**: Rect is a simple data structure with few methods. Single file is clearer.

### Decision 2: Property names

**Choice**: Use `left`, `top`, `right`, `bottom` as property names
```javascript
const r = new Rect(10, 20, 100, 200)
r.left    // Returns 10
r.top     // Returns 20
r.right   // Returns 100
r.bottom  // Returns 200
```

**Rationale**: Director MX 2004 uses these property names.

### Decision 3: Constructor

**Choice**: Support both `new Rect(left, top, right, bottom)` and `rect(left, top, right, bottom)` factory function
```javascript
const r1 = new Rect(10, 20, 100, 200)
const r2 = rect(10, 20, 100, 200)  // Factory function
```

**Rationale**: Director supports both syntaxes. Factory function is more Lingo-like.

### Decision 4: Proxy for numeric access

**Choice**: Use Proxy to support `rect[n]` syntax where 1=left, 2=top, 3=right, 4=bottom
```javascript
const r = createRectProxy(10, 20, 100, 200)
r[1]  // Returns 10 (left)
r[2]  // Returns 20 (top)
r[3]  // Returns 100 (right)
r[4]  // Returns 200 (bottom)
```

**Rationale**: Director allows numeric index access to rect components.

## Risks / Trade-offs

**Risk**: Proxy overhead for rect access
→ **Mitigation**: Only apply proxy when needed, direct property access is faster

**Trade-off**: Single file vs. separate files for rect() and Rect class
→ **Acceptable**: They're tightly coupled, single file is clearer
