## Context

The `MovieRef` class represents the movie object in Director MX 2004, accessible as the global `_movie` property. It provides access to movie-level properties like the current frame, cast libraries, sprites, stage dimensions, and methods for controlling playback.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

## Goals / Non-Goals

**Goals:**
- Implement complete `MovieRef` class matching Director MX 2004 behavior exactly
- Each property has its own spec file with full documentation
- Support movie playback control methods
- Co-located tests
- Read-only properties where Director specifies read-only

**Non-Goals:**
- Movie loading (that's the runtime's job)
- Frame navigation UI (that's the application's job)
- Score editing (that's a separate system)

## Decisions

### Decision 1: File structure

**Choice**: Single file for MovieRef class, single test file
```
apps/client/src/director/core/
├── movie-ref.js          # MovieRef class implementation
├── __tests__/
│   └── movie-ref.test.js # All MovieRef tests
```

**Rationale**: MovieRef is a single cohesive class. Splitting each property into its own file would be overkill for a singleton object.

### Decision 2: Singleton pattern

**Choice**: MovieRef is a singleton accessible as `_movie`
```javascript
_movie.frame         // Get current frame
_movie.go(5)         // Go to frame 5
```

**Rationale**: Director has a single active movie at a time, accessed via `_movie`.

### Decision 3: Indexed registries

**Choice**: Use indexed registries for castLib and sprite access
```javascript
_movie.castLib[1]    // Get first cast library
_movie.sprite[5]     // Get sprite in channel 5
```

**Rationale**: Director uses 1-indexed registries for cast libraries and sprites.

### Decision 4: Stage dimensions

**Choice**: `stage` property returns object with left, top, right, bottom
```javascript
_movie.stage.left    // 0
_movie.stage.right   // 640
```

**Rationale**: Director provides stage dimensions as a rectangle-like object.

## Risks / Trade-offs

**Risk**: Many properties may not be used by the application
→ **Mitigation**: Implement all properties to match Director MX 2004 exactly, even if unused

**Risk**: Property behavior may not match Director exactly
→ **Mitigation**: Use Director's documented behavior from reference

**Trade-off**: Single file vs. one file per property
→ **Acceptable**: MovieRef properties are tightly coupled, single file is clearer
