## 1. PlayerRef Class Implementation

- [ ] 1.1 Create `apps/client/src/director/core/player-ref.js` with PlayerRef class skeleton
- [ ] 1.2 Implement PlayerRef constructor (singleton)
- [ ] 1.3 Implement `runMode` property (read-only)
- [ ] 1.4 Implement `sound` property (read-only)
- [ ] 1.5 Implement `xtra` property (indexed)
- [ ] 1.6 Implement `xtraList` property (read-only)

## 2. Control Properties

- [ ] 2.1 Implement `alertHook` property per `specs/director-core-player-ref/alertHook.md`
- [ ] 2.2 Implement `debugPlaybackEnabled` property per `specs/director-core-player-ref/debugPlaybackEnabled.md`
- [ ] 2.3 Implement `editShortcutsEnabled` property per `specs/director-core-player-ref/editShortcutsEnabled.md`
- [ ] 2.4 Implement `exitLock` property per `specs/director-core-player-ref/exitLock.md`
- [ ] 2.5 Implement `parameters` property per `specs/director-core-player-ref/parameters.md`

## 3. Player Methods

- [ ] 3.1 Implement `externalParamValue(name)` method
- [ ] 3.2 Implement `getPref(name)` method
- [ ] 3.3 Implement `setPref(name, value)` method
- [ ] 3.4 Implement `quit()` method

## 4. Tests

- [ ] 4.1 Create `apps/client/src/director/core/__tests__/player-ref.test.js`
- [ ] 4.2 Write tests for PlayerRef singleton
- [ ] 4.3 Write tests for read-only properties (runMode, sound, xtraList)
- [ ] 4.4 Write tests for read-write properties (debugPlaybackEnabled, exitLock)
- [ ] 4.5 Write tests for preference methods (getPref, setPref)
- [ ] 4.6 Write tests for player control methods (quit, externalParamValue)

## 5. Export

- [ ] 5.1 Export PlayerRef class from `core/index.js`
- [ ] 5.2 Export _player singleton from `core/index.js`
