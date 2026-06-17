## ADDED Requirements

### Requirement: CastLibraryRef class SHALL be implemented in core/cast-library-ref.js

The `CastLibraryRef` class SHALL be implemented in `apps/client/src/director/core/cast-library-ref.js` with all properties documented in Director MX 2004.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

**File**: `apps/client/src/director/core/cast-library-ref.js`
**Test**: `apps/client/src/director/core/__tests__/cast-library-ref.test.js`

#### Scenario: CastLibraryRef class is importable
- **WHEN** code imports `import { CastLibraryRef } from "../../director/core"`
- **THEN** CastLibraryRef class is available

#### Scenario: CastLibraryRef can be instantiated
- **WHEN** `new CastLibraryRef()` is called
- **THEN** returns CastLibraryRef instance

### Requirement: CastLibraryRef SHALL have read-only properties

The following CastLibraryRef properties SHALL be read-only:
- `number` - Cast library number
- `member` - Member access (indexed registry)
- `castMemberList` - Cast member list

#### Scenario: number is read-only
- **WHEN** `castLib.number` is accessed
- **THEN** returns the cast library number
- **WHEN** `castLib.number = 5` is attempted
- **THEN** operation is ignored or throws error

### Requirement: CastLibraryRef SHALL have read-write properties

The following CastLibraryRef properties SHALL be read-write:
- `name` - Cast library name
- `fileName` - External file name
- `preLoadMode` - Preload mode

#### Scenario: name can be set
- **WHEN** `castLib.name = "External"` is executed
- **THEN** cast library name is updated

#### Scenario: fileName can be set
- **WHEN** `castLib.fileName = "external.cst"` is executed
- **THEN** external file name is updated

### Requirement: CastLibraryRef SHALL support indexed member access

CastLibraryRef SHALL provide indexed access to cast members.

#### Scenario: member access by number
- **WHEN** `castLib.member[1]` is accessed
- **THEN** returns the first cast member

#### Scenario: member access by name
- **WHEN** `castLib.member["myBitmap"]` is accessed
- **THEN** returns the cast member with that name

### Requirement: CastLibraryRef properties SHALL match Director MX 2004 exactly

Each CastLibraryRef property SHALL behave exactly as documented in Director MX 2004. See individual spec files for full documentation:

- `activeCastLib.md` - Active cast library
- `broadcastProps.md` - Broadcast properties
- `castLib.md` - Cast library reference
- `castLibNum.md` - Cast library number
- `castMemberList.md` - Cast member list
- `fileName.md` - External file name
- `member.md` - Member access
- `name.md` - Cast library name
- `number.md` - Cast library number
- `preLoadMode.md` - Preload mode

#### Scenario: All properties implemented
- **WHEN** any CastLibraryRef property is accessed
- **THEN** behavior matches Director MX 2004 documentation exactly
