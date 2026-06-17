## ADDED Requirements

### Requirement: Sound functions SHALL be implemented in api/ directory

The Director MX 2004 sound functions SHALL be implemented in `apps/client/src/director/api/` with each function in its own file.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

**Files**:
- `apps/client/src/director/api/beep.js`
- `apps/client/src/director/api/sound.js`

**Tests**:
- `apps/client/src/director/api/__tests__/beep.test.js`
- `apps/client/src/director/api/__tests__/sound.test.js`

#### Scenario: Sound functions are importable
- **WHEN** code imports `import { beep, sound } from "../../director/api"`
- **THEN** all sound functions are available

#### Scenario: Sound functions integrate with SoundRef
- **WHEN** sound functions are called
- **THEN** they delegate to SoundRef methods

### Requirement: beep() SHALL play system beep

The `beep()` function SHALL play the system beep sound.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 12396-12430

#### Scenario: beep plays sound
- **WHEN** `beep()` is called
- **THEN** system beep sound is played

### Requirement: sound() SHALL access sound channel

The `sound()` function SHALL return a sound channel reference.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 28010-28038

#### Scenario: sound returns channel
- **WHEN** `sound(1)` is called
- **THEN** returns sound channel 1 reference

### Requirement: All sound functions SHALL match Director MX 2004 exactly

Each sound function SHALL behave exactly as documented in Director MX 2004. See individual spec files for full documentation:

- `beep.md` - Play system beep
- `sound.md` - Access sound channel

#### Scenario: All functions implemented
- **WHEN** any sound function is called
- **THEN** behavior matches Director MX 2004 documentation exactly
