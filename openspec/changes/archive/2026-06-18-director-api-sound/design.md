## Context

The Director MX 2004 sound functions provide audio playback capabilities. These functions must follow Director's specific sound handling rules, which include system beep and sound channel access.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

## Goals / Non-Goals

**Goals:**
- Implement all 2 sound functions matching Director MX 2004 behavior exactly
- Each function has its own spec file with full documentation
- Each function has its own implementation file
- Each function has co-located tests
- Functions integrate with SoundRef for audio control

**Non-Goals:**
- Complex audio processing beyond the 2 functions
- Integration with Web Audio API (Director has its own sound system)
- Performance optimization (these are simple operations)

## Decisions

### Decision 1: File structure

**Choice**: One file per function
```
apps/client/src/director/api/
├── beep.js
├── sound.js
├── __tests__/
│   ├── beep.test.js
│   └── sound.test.js
```

**Rationale**: Follows the atomic file structure established in director-architecture. Each function is independent and can be implemented/tested in isolation.

### Decision 2: Beep function

**Choice**: Use SoundRef.beep() for system beep
```javascript
import { _sound } from "../core";

// Director: beep() plays system beep
export function beep() {
  _sound.beep();
}
```

**Rationale**: Director's beep() function plays the system beep. We delegate to SoundRef.beep().

### Decision 3: Sound function

**Choice**: Return SoundChannelRef for channel access
```javascript
import { _sound } from "../core";

// Director: sound(1) returns sound channel 1
export function sound(channel) {
  return _sound[channel];
}
```

**Rationale**: Director's sound() function returns a sound channel reference. We access the channel from SoundRef.

### Decision 4: Export strategy

**Choice**: Each file exports a single named function
```javascript
// beep.js
export function beep() {
  _sound.beep();
}
```

**Rationale**: Follows ES6 module best practices. The api/index.js will re-export all functions.

## Risks / Trade-offs

**Risk**: Sound functions may not match Director's exact behavior for edge cases
→ **Mitigation**: Follow Director MX 2004 documentation exactly, test edge cases

**Risk**: Browser beep may not match Director's beep
→ **Mitigation**: Use Web Audio API or audio file for beep sound

**Trade-off**: One file per function vs. grouping in sound.js
→ **Acceptable**: Atomic structure is more important than file count for this project
