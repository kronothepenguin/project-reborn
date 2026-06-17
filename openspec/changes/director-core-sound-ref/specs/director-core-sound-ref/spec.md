## ADDED Requirements

### Requirement: SoundRef class SHALL be implemented in core/sound-ref.js

The `SoundRef` class SHALL be implemented in `apps/client/src/director/core/sound-ref.js` with all properties documented in Director MX 2004.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

**File**: `apps/client/src/director/core/sound-ref.js`
**Test**: `apps/client/src/director/core/__tests__/sound-ref.test.js`

#### Scenario: SoundRef class is importable
- **WHEN** code imports `import { SoundRef } from "../../director/core"`
- **THEN** SoundRef class is available

#### Scenario: SoundRef is accessible as _sound
- **WHEN** code accesses `_sound`
- **THEN** returns SoundRef instance

### Requirement: SoundRef SHALL have read-write properties

The following SoundRef properties SHALL be read-write:
- `soundEnabled` - Sound enabled flag

#### Scenario: soundEnabled can be set
- **WHEN** `_sound.soundEnabled = false` is executed
- **THEN** sound is disabled

### Requirement: SoundRef SHALL support sound control methods

SoundRef SHALL provide methods for controlling sound.

#### Scenario: beep plays system beep
- **WHEN** `_sound.beep()` is called
- **THEN** system beep sound is played

### Requirement: SoundRef properties SHALL match Director MX 2004 exactly

Each SoundRef property SHALL behave exactly as documented in Director MX 2004. See individual spec files for full documentation:

- `_sound.md` - Top-level sound reference
- `soundEnabled.md` - Sound enabled flag

#### Scenario: All properties implemented
- **WHEN** any SoundRef property is accessed
- **THEN** behavior matches Director MX 2004 documentation exactly
