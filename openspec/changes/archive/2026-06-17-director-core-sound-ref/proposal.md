## Why

The `SoundRef` class represents the sound object in Director MX 2004, accessible as `_sound`. The current implementation in `core.js` is incomplete (empty class). This change implements the complete `SoundRef` class with all properties documented in the Director MX 2004 reference, with each property having its own spec file containing full documentation.

## What Changes

- Implement `SoundRef` class in `apps/client/src/director/core/sound-ref.js`
- Implement all SoundRef properties with full Director MX 2004 documentation
- Create co-located tests in `apps/client/src/director/core/__tests__/sound-ref.test.js`
- Each property gets its own spec file with full documentation from the reference

## Capabilities

### New Capabilities
- `director-core-sound-ref`: Complete SoundRef class implementation with all properties

### Modified Capabilities
None

## Impact

- **Code**: New file `apps/client/src/director/core/sound-ref.js`
- **Tests**: New file `apps/client/src/director/core/__tests__/sound-ref.test.js`
- **Dependencies**: None (foundational singleton)

## Properties to Implement

| Property | Lines | Description |
|----------|-------|-------------|
| _sound | 31555-31584 | Top-level sound reference |
| soundEnabled | - | Sound enabled flag |

## Methods to Implement

| Method | Description |
|--------|-------------|
| beep() | Play system beep |
