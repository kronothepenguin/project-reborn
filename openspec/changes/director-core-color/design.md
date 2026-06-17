## Context

The `Color` class is one of the core data types in Director MX 2004. It represents an RGB color with red, green, and blue components (each 0-255). Colors are used extensively in Director for sprite colors, background colors, and drawing operations.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

## Goals / Non-Goals

**Goals:**
- Implement complete `Color` class matching Director MX 2004 behavior exactly
- Each method/property has its own spec file with full documentation
- Support both constructor and property access
- Co-located tests

**Non-Goals:**
- Alpha channel support (Director MX 2004 Color doesn't have alpha)
- Color space conversions (HSL, HSV, etc.)

## Decisions

### Decision 1: File structure

**Choice**: Single file for Color class, single test file
```
apps/client/src/director/core/
├── color.js          # Color class implementation
├── __tests__/
│   └── color.test.js # All Color tests
```

**Rationale**: Color is a simple data structure with few methods. Single file is clearer.

### Decision 2: Property names

**Choice**: Use `red`, `green`, `blue` as property names
```javascript
const c = new Color(255, 128, 0)
c.red    // Returns 255
c.green  // Returns 128
c.blue   // Returns 0
```

**Rationale**: Director MX 2004 uses these property names.

### Decision 3: Constructor

**Choice**: Support both `new Color(r, g, b)` and `color(r, g, b)` factory function
```javascript
const c1 = new Color(255, 128, 0)
const c2 = color(255, 128, 0)  // Factory function
```

**Rationale**: Director supports both syntaxes. Factory function is more Lingo-like.

### Decision 4: Value range

**Choice**: RGB values are integers from 0 to 255
```javascript
const c = new Color(255, 128, 0)  // Valid
const c2 = new Color(300, 0, 0)   // Should clamp or error
```

**Rationale**: Director MX 2004 uses 0-255 range for RGB components.

## Risks / Trade-offs

**Risk**: No alpha channel support
→ **Mitigation**: Director MX 2004 Color doesn't have alpha, this matches the spec

**Trade-off**: Single file vs. separate files for color() and Color class
→ **Acceptable**: They're tightly coupled, single file is clearer
