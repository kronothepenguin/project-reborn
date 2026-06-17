## ADDED Requirements

### Requirement: SpriteRef class SHALL be implemented in core/sprite-ref.js

The `SpriteRef` class SHALL be implemented in `apps/client/src/director/core/sprite-ref.js` with all properties documented in Director MX 2004.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

**File**: `apps/client/src/director/core/sprite-ref.js`
**Test**: `apps/client/src/director/core/__tests__/sprite-ref.test.js`

#### Scenario: SpriteRef class is importable
- **WHEN** code imports `import { SpriteRef } from "../../director/core"`
- **THEN** SpriteRef class is available

#### Scenario: SpriteRef can be instantiated
- **WHEN** `new SpriteRef(1)` is called
- **THEN** returns SpriteRef with num=1

### Requirement: SpriteRef SHALL have read-only properties

The following SpriteRef properties SHALL be read-only:
- `num` - Sprite channel number

#### Scenario: num is read-only
- **WHEN** `sprite.num` is accessed
- **THEN** returns the sprite channel number
- **WHEN** `sprite.num = 5` is attempted
- **THEN** operation is ignored or throws error

### Requirement: SpriteRef SHALL have read-write properties

The following SpriteRef properties SHALL be read-write:
- `member` - Associated member
- `memberNum` - Member number
- `castLib` - Cast library number
- `locH` - Horizontal location
- `locV` - Vertical location
- `loc` - Location as Point
- `ink` - Ink effect
- `blend` - Blend percentage
- `visible` - Visibility flag
- `foreColor` - Foreground color
- `backColor` - Background color
- `name` - Sprite name

#### Scenario: locH can be set
- **WHEN** `sprite.locH = 100` is executed
- **THEN** sprite horizontal location is updated

#### Scenario: loc can be set via Point
- **WHEN** `sprite.loc = point(100, 200)` is executed
- **THEN** sprite locH becomes 100 and locV becomes 200

### Requirement: SpriteRef SHALL support media properties

SpriteRef SHALL provide properties for media sprites (sound, digital video, etc.).

#### Scenario: currentTime returns 0 for non-media sprites
- **WHEN** `sprite.currentTime` is accessed on bitmap sprite
- **THEN** returns `0`

#### Scenario: volume can be set for sound sprites
- **WHEN** `sprite.volume = 128` is executed on sound sprite
- **THEN** sprite volume is updated

### Requirement: SpriteRef properties SHALL match Director MX 2004 exactly

Each SpriteRef property SHALL behave exactly as documented in Director MX 2004. See individual spec files for full documentation:

- `num.md` - Sprite channel number
- `member.md` - Associated member
- `memberNum.md` - Member number
- `castLib.md` - Cast library number
- `locH.md` - Horizontal location
- `locV.md` - Vertical location
- `loc.md` - Location as Point
- `ink.md` - Ink effect
- `blend.md` - Blend percentage
- `visible.md` - Visibility flag
- `foreColor.md` - Foreground color
- `backColor.md` - Background color
- `rect.md` - Sprite rectangle
- `name.md` - Sprite name
- `currentTime.md` - Current time for media
- `trackCount.md` - Number of tracks
- `trackStartTime.md` - Track start time
- `trackStopTime.md` - Track stop time
- `trackType.md` - Track type
- `volume.md` - Volume level

#### Scenario: All properties implemented
- **WHEN** any SpriteRef property is accessed
- **THEN** behavior matches Director MX 2004 documentation exactly
