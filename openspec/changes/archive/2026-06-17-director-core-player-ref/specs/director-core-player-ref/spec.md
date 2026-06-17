## ADDED Requirements

### Requirement: PlayerRef class SHALL be implemented in core/player-ref.js

The `PlayerRef` class SHALL be implemented in `apps/client/src/director/core/player-ref.js` with all properties documented in Director MX 2004.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

**File**: `apps/client/src/director/core/player-ref.js`
**Test**: `apps/client/src/director/core/__tests__/player-ref.test.js`

#### Scenario: PlayerRef class is importable
- **WHEN** code imports `import { PlayerRef } from "../../director/core"`
- **THEN** PlayerRef class is available

#### Scenario: PlayerRef is accessible as _player
- **WHEN** code accesses `_player`
- **THEN** returns PlayerRef instance

### Requirement: PlayerRef SHALL have read-only properties

The following PlayerRef properties SHALL be read-only:
- `runMode` - Run mode ("Plugin", "Standalone")
- `sound` - Sound object
- `xtra` - Xtras (indexed)
- `xtraList` - Xtra list

#### Scenario: runMode is read-only
- **WHEN** `_player.runMode` is accessed
- **THEN** returns the run mode string
- **WHEN** `_player.runMode = "Standalone"` is attempted
- **THEN** operation is ignored or throws error

### Requirement: PlayerRef SHALL have read-write properties

The following PlayerRef properties SHALL be read-write:
- `alertHook` - Alert hook handler
- `debugPlaybackEnabled` - Debug playback flag
- `editShortcutsEnabled` - Edit shortcuts flag
- `exitLock` - Exit lock flag
- `parameters` - External parameters

#### Scenario: debugPlaybackEnabled can be set
- **WHEN** `_player.debugPlaybackEnabled = true` is executed
- **THEN** debug playback is enabled

### Requirement: PlayerRef SHALL support preference methods

PlayerRef SHALL provide methods for getting and setting preferences.

#### Scenario: getPref returns preference value
- **WHEN** `_player.getPref("myPref")` is called
- **THEN** returns the preference value or undefined

#### Scenario: setPref stores preference value
- **WHEN** `_player.setPref("myPref", "value")` is called
- **THEN** preference is stored

### Requirement: PlayerRef SHALL support player control methods

PlayerRef SHALL provide methods for controlling the player.

#### Scenario: quit exits the player
- **WHEN** `_player.quit()` is called
- **THEN** player exits

#### Scenario: externalParamValue returns parameter
- **WHEN** `_player.externalParamValue("src")` is called
- **THEN** returns the parameter value or undefined

### Requirement: PlayerRef properties SHALL match Director MX 2004 exactly

Each PlayerRef property SHALL behave exactly as documented in Director MX 2004. See individual spec files for full documentation:

- `_player.md` - Top-level player reference
- `alertHook.md` - Alert hook handler
- `debugPlaybackEnabled.md` - Debug playback flag
- `editShortcutsEnabled.md` - Edit shortcuts flag
- `exitLock.md` - Exit lock flag
- `parameters.md` - External parameters
- `runMode.md` - Run mode
- `sound.md` - Sound object
- `xtra.md` - Xtras
- `xtraList.md` - Xtra list

#### Scenario: All properties implemented
- **WHEN** any PlayerRef property is accessed
- **THEN** behavior matches Director MX 2004 documentation exactly
