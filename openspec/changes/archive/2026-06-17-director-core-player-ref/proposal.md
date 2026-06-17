## Why

The `PlayerRef` class represents the player object in Director MX 2004, accessible as `_player`. The current implementation in `core.js` is incomplete and may contain AI-hallucinated behavior. This change implements the complete `PlayerRef` class with all properties documented in the Director MX 2004 reference, with each property having its own spec file containing full documentation.

## What Changes

- Implement `PlayerRef` class in `apps/client/src/director/core/player-ref.js`
- Implement all PlayerRef properties with full Director MX 2004 documentation
- Create co-located tests in `apps/client/src/director/core/__tests__/player-ref.test.js`
- Each property gets its own spec file with full documentation from the reference

## Capabilities

### New Capabilities
- `director-core-player-ref`: Complete PlayerRef class implementation with all properties

### Modified Capabilities
None

## Impact

- **Code**: New file `apps/client/src/director/core/player-ref.js`
- **Tests**: New file `apps/client/src/director/core/__tests__/player-ref.test.js`
- **Dependencies**: None (foundational singleton)

## Properties to Implement

| Property | Lines | Description |
|----------|-------|-------------|
| _player | 31529-31554 | Top-level player reference |
| alertHook | - | Alert hook handler |
| debugPlaybackEnabled | - | Debug playback flag |
| editShortcutsEnabled | - | Edit shortcuts flag |
| exitLock | - | Exit lock flag |
| parameters | - | External parameters |
| runMode | - | Run mode ("Plugin", "Standalone") |
| sound | 49655-49677 | Sound object |
| xtra | - | Xtras (indexed) |
| xtraList | 54648-54683 | Xtra list |

## Methods to Implement

| Method | Description |
|--------|-------------|
| externalParamValue(name) | Get external parameter |
| getPref(name) | Get preference |
| setPref(name, value) | Set preference |
| quit() | Quit player |
