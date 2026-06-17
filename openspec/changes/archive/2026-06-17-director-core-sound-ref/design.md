## Context

The `SoundRef` class represents the sound object in Director MX 2004, accessible as the global `_sound` property. It provides access to sound control properties and methods.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

## Goals / Non-Goals

**Goals:**
- Implement complete `SoundRef` class matching Director MX 2004 behavior exactly
- Each property has its own spec file with full documentation
- Support sound control methods
- Co-located tests
- Read-only properties where Director specifies read-only

**Non-Goals:**
- Sound playback implementation (that's a separate system)
- Audio format support (that's a separate system)
- Sound channel management (that's SoundChannel)

## Decisions

### Decision 1: File structure

**Choice**: Single file for SoundRef class, single test file
```
apps/client/src/director/core/
├── sound-ref.js          # SoundRef class implementation
├── __tests__/
│   └── sound-ref.test.js # All SoundRef tests
```

**Rationale**: SoundRef is a simple singleton with few properties. Single file is clearer.

### Decision 2: Singleton pattern

**Choice**: SoundRef is a singleton accessible as `_sound`
```javascript
_sound.soundEnabled    // Get sound enabled flag
_sound.beep()          // Play system beep
```

**Rationale**: Director has a single sound object, accessed via `_sound`.

### Decision 3: Sound enabled

**Choice**: `soundEnabled` controls whether sound is enabled
```javascript
_sound.soundEnabled = false  // Disable sound
_sound.beep()                // No sound
```

**Rationale**: Director uses soundEnabled to globally enable/disable sound.

### Decision 4: Beep implementation

**Choice**: `beep()` uses browser's audio capabilities
```javascript
_sound.beep()  // Play system beep sound
```

**Rationale**: Browser environment doesn't have Director's beep, so we use Web Audio API or a beep sound file.

## Risks / Trade-offs

**Risk**: Many properties may not be used by the application
→ **Mitigation**: Implement all properties to match Director MX 2004 exactly, even if unused

**Risk**: Property behavior may not match Director exactly
→ **Mitigation**: Use Director's documented behavior from reference

**Trade-off**: Single file vs. one file per property
→ **Acceptable**: SoundRef has very few properties, single file is clearer
