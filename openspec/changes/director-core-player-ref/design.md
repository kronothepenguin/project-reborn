## Context

The `PlayerRef` class represents the player object in Director MX 2004, accessible as the global `_player` property. It provides access to player-level properties like run mode, debug settings, preferences, and the sound object.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

## Goals / Non-Goals

**Goals:**
- Implement complete `PlayerRef` class matching Director MX 2004 behavior exactly
- Each property has its own spec file with full documentation
- Support player control methods
- Co-located tests
- Read-only properties where Director specifies read-only

**Non-Goals:**
- Player initialization (that's the runtime's job)
- Preference storage implementation (that's a separate system)
- Xtra loading (that's a separate system)

## Decisions

### Decision 1: File structure

**Choice**: Single file for PlayerRef class, single test file
```
apps/client/src/director/core/
├── player-ref.js          # PlayerRef class implementation
├── __tests__/
│   └── player-ref.test.js # All PlayerRef tests
```

**Rationale**: PlayerRef is a single cohesive class. Splitting each property into its own file would be overkill for a singleton object.

### Decision 2: Singleton pattern

**Choice**: PlayerRef is a singleton accessible as `_player`
```javascript
_player.runMode         // Get run mode
_player.getPref("foo")  // Get preference
```

**Rationale**: Director has a single player instance, accessed via `_player`.

### Decision 3: Run mode

**Choice**: `runMode` returns "Plugin" for browser mode
```javascript
_player.runMode  // "Plugin" or "Standalone"
```

**Rationale**: Director uses runMode to distinguish between browser plugin and standalone projector.

### Decision 4: Preferences

**Choice**: `getPref` and `setPref` use browser localStorage
```javascript
_player.getPref("myPref")  // Get from localStorage
_player.setPref("myPref", "value")  // Set to localStorage
```

**Rationale**: Browser environment doesn't have Director's preference system, so we use localStorage as a substitute.

## Risks / Trade-offs

**Risk**: Many properties may not be used by the application
→ **Mitigation**: Implement all properties to match Director MX 2004 exactly, even if unused

**Risk**: Property behavior may not match Director exactly
→ **Mitigation**: Use Director's documented behavior from reference

**Trade-off**: Single file vs. one file per property
→ **Acceptable**: PlayerRef properties are tightly coupled, single file is clearer
