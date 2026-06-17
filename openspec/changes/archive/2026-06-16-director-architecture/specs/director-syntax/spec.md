## MODIFIED Requirements

### Requirement: the proxy SHALL provide system properties

The `the` object SHALL be a Proxy providing access to Director system properties. All properties used in .ls files SHALL be implemented.

**Location**: `apps/client/src/director/syntax/the-proxy.js`

**Reference**: `docs/drmx2004_scripting_ref.txt` - Properties chapter (lines 31404+)

**Properties to implement** (each as a separate task):
- `the.alertHook` → `_player.alertHook`
- `the.colorDepth` → `_system.colorDepth`
- `the.commandDown` → `_key.commandDown`
- `the.controlDown` → `_key.controlDown`
- `the.date` → current date string
- `the.doubleClick` → `_mouse.doubleClick`
- `the.editShortcutsEnabled` → `_player.editShortcutsEnabled`
- `the.environment` → environment info object
- `the.exitLock` → `_player.exitLock`
- `the.floatPrecision` → `_system.floatPrecision`
- `the.frame` → `_movie.frame`
- `the.frameTempo` → `_movie.frameTempo`
- `the.key` → `_key.key`
- `the.keyCode` → `_key.keyCode`
- `the.keyboardFocusSprite` → `_movie.keyboardFocusSprite`
- `the.lastChannel` → `_movie.lastChannel`
- `the.longTime` → long format time
- `the.maxinteger` → Number.MAX_SAFE_INTEGER
- `the.milliSeconds` → Date.now()
- `the.mouseH` → `_mouse.mouseH`
- `the.mouseLoc` → `_mouse.mouseLoc`
- `the.mouseV` → `_mouse.mouseV`
- `the.moviePath` → `_movie.moviePath`
- `the.numberOfCastLibs` → cast library count
- `the.optionDown` → `_key.optionDown`
- `the.parameters` → `_player.parameters`
- `the.platform` → `_system.platform`
- `the.randomSeed` → `_system.randomSeed`
- `the.rollOver` → `_movie.rollOver()`
- `the.runMode` → `_player.runMode`
- `the.selEnd` → selection end
- `the.selStart` → selection start
- `the.shiftDown` → `_key.shiftDown`
- `the.stage` → stage dimensions object
- `the.stageBottom` → stage bottom edge
- `the.stageLeft` → stage left edge
- `the.stageRight` → stage right edge
- `the.stageTop` → stage top edge
- `the.time` → current time string
- `the.timer` → `_system.timer`
- `the.xtraList` → `_player.xtraList`
- `the.itemDelimiter` → item delimiter character (default ",")

#### Scenario: the.frame returns current frame
- **WHEN** `the.frame` is accessed
- **THEN** returns `_movie.frame`

#### Scenario: the.mouseH returns mouse horizontal position
- **WHEN** `the.mouseH` is accessed
- **THEN** returns `_mouse.mouseH`

#### Scenario: the.milliSeconds returns current time
- **WHEN** `the.milliSeconds` is accessed
- **THEN** returns `Date.now()`

#### Scenario: the.itemDelimiter is readable and writable
- **WHEN** `the.itemDelimiter = ";"` is set
- **THEN** subsequent item operations use ";" as delimiter
