## Context

The `CastLibraryRef` class represents a cast library in Director MX 2004. Cast libraries are containers for cast members (bitmaps, sounds, scripts, etc.). A movie can have multiple cast libraries, with the first being the internal cast and others being external casts.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

## Goals / Non-Goals

**Goals:**
- Implement complete `CastLibraryRef` class matching Director MX 2004 behavior exactly
- Each property has its own spec file with full documentation
- Support cast library access and member retrieval
- Co-located tests
- Read-only properties where Director specifies read-only

**Non-Goals:**
- Cast library creation/deletion (that's a separate operation)
- External cast loading (that's the runtime's job)
- Cast member creation (that's MemberRef)

## Decisions

### Decision 1: File structure

**Choice**: Single file for CastLibraryRef class, single test file
```
apps/client/src/director/core/
├── cast-library-ref.js          # CastLibraryRef class implementation
├── __tests__/
│   └── cast-library-ref.test.js # All CastLibraryRef tests
```

**Rationale**: CastLibraryRef is a single cohesive class. Splitting each property into its own file would be overkill for a data structure.

### Decision 2: Indexed member access

**Choice**: Use indexed registry for member access
```javascript
castLib.member[1]    // Get first member
castLib.member["name"]  // Get member by name
```

**Rationale**: Director uses indexed access for cast members, supporting both numeric and name-based access.

### Decision 3: Preload mode

**Choice**: `preLoadMode` controls when external cast is loaded
```javascript
castLib.preLoadMode = 0  // Load when needed (default)
castLib.preLoadMode = 1  // Load before frame 1
castLib.preLoadMode = 2  // Load after frame 1
```

**Rationale**: Director uses preLoadMode to control external cast loading timing.

### Decision 4: File name for external casts

**Choice**: `fileName` specifies external cast file
```javascript
castLib.fileName = "external.cst"  // Set external cast file
```

**Rationale**: Director uses fileName to specify external cast library files.

## Risks / Trade-offs

**Risk**: Many properties may not be used by the application
→ **Mitigation**: Implement all properties to match Director MX 2004 exactly, even if unused

**Risk**: Property behavior may not match Director exactly
→ **Mitigation**: Use Director's documented behavior from reference

**Trade-off**: Single file vs. one file per property
→ **Acceptable**: CastLibraryRef properties are tightly coupled, single file is clearer
