## 1. PlayerRef Class Implementation

- [x] 1.1 Create `apps/client/src/director/core/player-ref.js` with PlayerRef class skeleton
- [x] 1.2 Implement PlayerRef constructor (singleton)
- [x] 1.3 Implement `runMode` property (read-only)
- [x] 1.4 Implement `sound` property (read-only)
- [x] 1.5 Implement `xtra` property (indexed)
- [x] 1.6 Implement `xtraList` property (read-only)

## 2. Control Properties

- [x] 2.1 Implement `alertHook` property per `specs/director-core-player-ref/alertHook.md`
- [x] 2.2 Implement `debugPlaybackEnabled` property per `specs/director-core-player-ref/debugPlaybackEnabled.md`
- [x] 2.3 Implement `editShortcutsEnabled` property per `specs/director-core-player-ref/editShortcutsEnabled.md`
- [x] 2.4 Implement `exitLock` property per `specs/director-core-player-ref/exitLock.md`
- [x] 2.5 Implement `parameters` property per `specs/director-core-player-ref/parameters.md`

## 3. Player Methods

- [x] 3.1 Implement `externalParamValue(name)` method
- [x] 3.2 Implement `getPref(name)` method
- [x] 3.3 Implement `setPref(name, value)` method
- [x] 3.4 Implement `quit()` method

## 4. Tests

- [x] 4.1 Create `apps/client/src/director/core/__tests__/player-ref.test.js`
- [x] 4.2 Write tests for PlayerRef singleton
- [x] 4.3 Write tests for read-only properties (runMode, sound, xtraList)
- [x] 4.4 Write tests for read-write properties (debugPlaybackEnabled, exitLock)
- [x] 4.5 Write tests for preference methods (getPref, setPref)
- [x] 4.6 Write tests for player control methods (quit, externalParamValue)

## 5. Export

- [x] 5.1 Export PlayerRef class from `core/index.js`
- [x] 5.2 Export _player singleton from `core/index.js`
