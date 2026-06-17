## Context

The `SpriteRef` class is a reference to a sprite in Director MX 2004. Sprites are the visual elements displayed on the stage - they occupy channels in the Score and display cast members at specific frame ranges. SpriteRef provides access to sprite properties like position, size, visibility, ink effects, and type-specific data.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

## Goals / Non-Goals

**Goals:**
- Implement complete `SpriteRef` class matching Director MX 2004 behavior exactly
- Each property has its own spec file with full documentation
- Support sprite positioning, sizing, and visual effects
- Co-located tests
- Read-only properties where Director specifies read-only

**Non-Goals:**
- Sprite creation/deletion (that's Score manipulation)
- Score navigation (that's MovieRef)
- Sprite behaviors (that's a separate system)

## Decisions

### Decision 1: File structure

**Choice**: Single file for SpriteRef class, single test file
```
apps/client/src/director/core/
├── sprite-ref.js          # SpriteRef class implementation
├── __tests__/
│   └── sprite-ref.test.js # All SpriteRef tests
```

**Rationale**: SpriteRef is a single cohesive class. Splitting each property into its own file would be overkill for a data structure.

### Decision 2: Property access

**Choice**: Direct property access with getters/setters
```javascript
sprite.locH         // Get horizontal location
sprite.locH = 100   // Set horizontal location
sprite.num          // Get channel number (read-only)
```

**Rationale**: Director uses direct property access. Some properties are read-only (num), others are read-write (locH, blend).

### Decision 3: Location properties

**Choice**: Provide both `locH`/`locV` and `loc` (Point) access
```javascript
sprite.locH = 100        // Set horizontal
sprite.locV = 200        // Set vertical
sprite.loc = point(100, 200)  // Set both via Point
```

**Rationale**: Director supports both individual coordinate access and Point-based access.

### Decision 4: Rectangle calculation

**Choice**: `rect` property calculates from locH/locV and member dimensions
```javascript
sprite.rect  // Returns Rect(locH, locV, locH + width, locV + height)
```

**Rationale**: Director calculates sprite rect from position and member size.

## Risks / Trade-offs

**Risk**: Many properties may not be used by the application
→ **Mitigation**: Implement all properties to match Director MX 2004 exactly, even if unused

**Risk**: Property behavior may not match Director exactly
→ **Mitigation**: Use Director's documented behavior from reference

**Trade-off**: Single file vs. one file per property
→ **Acceptable**: SpriteRef properties are tightly coupled, single file is clearer
