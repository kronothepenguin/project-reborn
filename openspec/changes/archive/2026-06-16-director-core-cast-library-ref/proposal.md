## Why

The `CastLibraryRef` class represents a cast library in Director MX 2004. The current implementation in `core.js` is incomplete and may contain AI-hallucinated behavior. This change implements the complete `CastLibraryRef` class with all properties documented in the Director MX 2004 reference, with each property having its own spec file containing full documentation.

## What Changes

- Implement `CastLibraryRef` class in `apps/client/src/director/core/cast-library-ref.js`
- Implement all CastLibraryRef properties with full Director MX 2004 documentation
- Create co-located tests in `apps/client/src/director/core/__tests__/cast-library-ref.test.js`
- Each property gets its own spec file with full documentation from the reference

## Capabilities

### New Capabilities
- `director-core-cast-library-ref`: Complete CastLibraryRef class implementation with all properties

### Modified Capabilities
None

## Impact

- **Code**: New file `apps/client/src/director/core/cast-library-ref.js`
- **Tests**: New file `apps/client/src/director/core/__tests__/cast-library-ref.test.js`
- **Dependencies**: `director-core-member-ref` (for member property)

## Properties to Implement

| Property | Lines | Description |
|----------|-------|-------------|
| activeCastLib | 31698-31727 | Active cast library |
| broadcastProps | 34071-34103 | Broadcast properties |
| castLib | 34378-34405 | Cast library reference |
| castLibNum | 34406-34432 | Cast library number |
| castMemberList | 34433-34464 | Cast member list |
| fileName | 38644-38704 | External file name |
| member | 42921-42948 | Member access |
| name | - | Cast library name |
| number | 44752-44777 | Cast library number |
| preLoadMode | - | Preload mode |
