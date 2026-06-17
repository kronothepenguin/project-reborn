## ADDED Requirements

### Requirement: MemberRef class SHALL be implemented in core/member-ref.js

The `MemberRef` class SHALL be implemented in `apps/client/src/director/core/member-ref.js` with all properties documented in Director MX 2004.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

**File**: `apps/client/src/director/core/member-ref.js`
**Test**: `apps/client/src/director/core/__tests__/member-ref.test.js`

#### Scenario: MemberRef class is importable
- **WHEN** code imports `import { MemberRef } from "../../director/core"`
- **THEN** MemberRef class is available

#### Scenario: MemberRef can be instantiated
- **WHEN** `new MemberRef(Symbol.for("bitmap"), "myBitmap")` is called
- **THEN** returns MemberRef with type=#bitmap, name="myBitmap"

### Requirement: MemberRef SHALL have read-only properties

The following MemberRef properties SHALL be read-only:
- `type` - Member type symbol
- `number` - Member number in cast
- `castLibNum` - Cast library number

#### Scenario: type is read-only
- **WHEN** `member.type` is accessed
- **THEN** returns the member type symbol
- **WHEN** `member.type = Symbol.for("text")` is attempted
- **THEN** operation is ignored or throws error

#### Scenario: number is read-only
- **WHEN** `member.number` is accessed
- **THEN** returns the member number in cast

### Requirement: MemberRef SHALL have read-write properties

The following MemberRef properties SHALL be read-write:
- `name` - Member name
- `text` - Text content (for text members)
- `font` - Font name (for text members)
- `fontSize` - Font size (for text members)
- `picture` - Picture data (for bitmap members)
- `ink` - Ink effect
- `rect` - Member rectangle (for field members)

#### Scenario: name can be set
- **WHEN** `member.name = "newName"` is executed
- **THEN** member name is updated

#### Scenario: text can be set
- **WHEN** `member.text = "Hello World"` is executed on text member
- **THEN** member text is updated

### Requirement: MemberRef SHALL support type-specific properties

MemberRef SHALL provide properties for all member types, returning appropriate defaults for non-matching types.

#### Scenario: duration returns 0 for non-media members
- **WHEN** `member.duration` is accessed on text member
- **THEN** returns `0`

#### Scenario: text returns empty string for non-text members
- **WHEN** `member.text` is accessed on bitmap member
- **THEN** returns `""`

### Requirement: MemberRef properties SHALL match Director MX 2004 exactly

Each MemberRef property SHALL behave exactly as documented in Director MX 2004. See individual spec files for full documentation:

- `castLibNum.md` - Cast library number
- `duration.md` - Duration of media member
- `fileName.md` - External file name
- `font.md` - Font name for text members
- `fontSize.md` - Font size for text members
- `height.md` - Member height
- `ink.md` - Ink effect
- `loop.md` - Loop flag for media
- `name.md` - Member name
- `number.md` - Member number in cast
- `percentStreamed.md` - Streaming percentage
- `picture.md` - Picture data
- `preLoad.md` - Preload flag
- `rect.md` - Member rectangle
- `regPoint.md` - Registration point
- `scale.md` - Scale factor
- `sound.md` - Sound data
- `text.md` - Text content
- `trackCount.md` - Number of tracks
- `trackStartTime.md` - Track start time
- `trackStopTime.md` - Track stop time
- `trackType.md` - Track type
- `type.md` - Member type
- `volume.md` - Volume level
- `width.md` - Member width

#### Scenario: All properties implemented
- **WHEN** any MemberRef property is accessed
- **THEN** behavior matches Director MX 2004 documentation exactly
