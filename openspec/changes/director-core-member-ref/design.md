## Context

The `MemberRef` class is a reference to a cast member in Director MX 2004. Cast members are the building blocks of Director movies - they can be bitmaps, text, sounds, scripts, films, buttons, and many other types. MemberRef provides access to member properties like name, type, dimensions, and type-specific data.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

## Goals / Non-Goals

**Goals:**
- Implement complete `MemberRef` class matching Director MX 2004 behavior exactly
- Each property has its own spec file with full documentation
- Support all member types (bitmap, text, sound, script, film, etc.)
- Co-located tests
- Read-only properties where Director specifies read-only

**Non-Goals:**
- Member creation (that's the `member()` function in api)
- Member deletion (that's a separate operation)
- Cast library management (that's CastLibraryRef)

## Decisions

### Decision 1: File structure

**Choice**: Single file for MemberRef class, single test file
```
apps/client/src/director/core/
├── member-ref.js          # MemberRef class implementation
├── __tests__/
│   └── member-ref.test.js # All MemberRef tests
```

**Rationale**: MemberRef is a single cohesive class. Splitting each property into its own file would be overkill for a data structure.

### Decision 2: Property access

**Choice**: Direct property access with getters/setters
```javascript
member.name         // Get name
member.name = "foo" // Set name
member.type         // Get type (read-only)
```

**Rationale**: Director uses direct property access. Some properties are read-only (type, number), others are read-write (name, text).

### Decision 3: Type-specific properties

**Choice**: All properties present on all members, but type-specific ones return appropriate defaults
```javascript
member("bitmap").text      // Returns "" (empty string for non-text members)
member("text").duration    // Returns 0 (no duration for text members)
```

**Rationale**: Director doesn't throw errors when accessing type-specific properties on wrong member types - it returns sensible defaults.

### Decision 4: Symbol-based type

**Choice**: Use Symbol.for() for member type
```javascript
member.type === Symbol.for("bitmap")
member.type === Symbol.for("text")
member.type === Symbol.for("sound")
```

**Rationale**: Director uses symbols (#bitmap, #text, etc.) for member types. Symbol.for() provides global symbol registry matching Director's behavior.

## Risks / Trade-offs

**Risk**: Many properties may not be used by the application
→ **Mitigation**: Implement all properties to match Director MX 2004 exactly, even if unused

**Risk**: Type-specific property behavior may not match Director exactly
→ **Mitigation**: Use Director's documented behavior from reference

**Trade-off**: Single file vs. one file per property
→ **Acceptable**: MemberRef properties are tightly coupled, single file is clearer
