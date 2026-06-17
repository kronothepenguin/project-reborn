## 1. Module Architecture Refactoring

- [x] 1.1 Create `api.js` with Director API surface (constants, globals, functions from current runtime.js)
- [x] 1.2 Move constants (`VOID`, `EMPTY`, `PI`, `RETURN`, `SPACE`, `TAB`, `QUOTE`) from runtime.js to api.js
- [x] 1.3 Move globals (`_global`, `_movie`, `_player`, `_mouse`, `_key`, `_sound`, `_system`, `_window`) from runtime.js to api.js
- [x] 1.4 Move API functions (type checks, data types, conversions, math, member access, etc.) from runtime.js to api.js
- [x] 1.5 Update api.js to import from core.js (classes, helpers)
- [x] 1.6 Merge loader.js into core.js (loadImage, loadModule, loadPromise, pending tracking)
- [x] 1.7 Refactor runtime.js to contain browser plugin replacement (custom elements, mount, run, canvas management)
- [x] 1.8 Move custom element definitions (x-object, x-param) to runtime.js
- [x] 1.9 Move setCanvas, setExternalParams, load, start, registerCast to runtime.js
- [x] 1.10 Update index.js barrel export to export api.js, runtime.js, syntax.js (NOT core.js)
- [x] 1.11 Delete loader.js (merged into core.js)
- [x] 1.12 Verify all existing imports still work via barrel export
- [x] 1.13 Verify no circular dependencies between modules

## 2. Type-check Function Aliases

- [x] 2.1 Add `voidp` as alias for `voidP` in api.js
- [x] 2.2 Add `integerp` as alias for `integerP` in api.js
- [x] 2.3 Add `floatp` as alias for `floatP` in api.js
- [x] 2.4 Add `listp` as alias for `listP` in api.js
- [x] 2.5 Add `objectp` as alias for `objectP` in api.js
- [x] 2.6 Add `stringp` as alias for `stringP` in api.js
- [x] 2.7 Add `symbolp` as alias for `symbolP` in api.js
- [x] 2.8 Add `rollover` as alias for `rollOver` in api.js
- [x] 2.9 Verify all aliases work correctly

## 3. Math Functions

- [x] 3.1 Implement `abs(numericExpression)` → `Math.abs()`
- [x] 3.2 Implement `atan(angle)` → `Math.atan()`
- [x] 3.3 Implement `sqrt(number)` → `Math.sqrt()`
- [x] 3.4 Implement `tan(angle)` → `Math.tan()`
- [x] 3.5 Implement `log(number)` → `Math.log()`
- [x] 3.6 Implement `power(base, exponent)` → `Math.pow()`
- [x] 3.7 Implement `max(a, b)` and `max(list)` → `Math.max()`
- [x] 3.8 Implement `min(a, b)` and `min(list)` → `Math.min()`
- [x] 3.9 Verify math functions with test cases

## 4. `the` Proxy Properties (High Priority)

- [x] 4.1 Add `the.doubleClick` → `_mouse.doubleClick`
- [x] 4.2 Add `the.stage` → Stage dimensions object
- [x] 4.3 Add `the.keyCode` → `_key.keyCode`
- [x] 4.4 Add `the.time` → formatted time string
- [x] 4.5 Add `the.shiftDown` → `_key.shiftDown`
- [x] 4.6 Add `the.rollover` → `_mouse.rollOver()`
- [x] 4.7 Add `the.key` → `_key.key`
- [x] 4.8 Add `the.selStart` → selection start position
- [x] 4.9 Add `the.selEnd` → selection end position
- [x] 4.10 Verify high-priority `the` properties

## 5. `the` Proxy Properties (Medium Priority)

- [x] 5.1 Add `the.randomSeed` → `_system.randomSeed`
- [x] 5.2 Add `the.optionDown` → `_key.optionDown`
- [x] 5.3 Add `the.frameTempo` → `_movie.frameTempo`
- [x] 5.4 Add `the.date` → formatted date string
- [x] 5.5 Add `the.colorDepth` → `_system.colorDepth`
- [x] 5.6 Add `the.timer` → `_system.timer`
- [x] 5.7 Add `the.moviePath` → `_movie.moviePath`
- [x] 5.8 Add `the.platform` → `_system.platform`
- [x] 5.9 Add `the.floatPrecision` → `_system.floatPrecision`
- [x] 5.10 Add `the.debugPlaybackEnabled` → `_player.debugPlaybackEnabled`
- [x] 5.11 Add `the.maxinteger` → `Number.MAX_SAFE_INTEGER`
- [x] 5.12 Add `the.commandDown` → `_key.commandDown`
- [x] 5.13 Add `the.clickOn` → `_mouse.clickOn`
- [x] 5.14 Add `the.frame` → `_movie.frame`
- [x] 5.15 Verify medium-priority `the` properties

## 6. `the` Proxy Properties (Low Priority)

- [x] 6.1 Add `the.xtraList` → `_player.xtraList`
- [x] 6.2 Add `the.parameters` → `_player.parameters`
- [x] 6.3 Add `the.exitLock` → `_player.exitLock`
- [x] 6.4 Add `the.editShortcutsEnabled` → `_player.editShortcutsEnabled`
- [x] 6.5 Add remaining low-priority `the` properties
- [x] 6.6 Verify all 56 `the` properties are accessible

## 7. List Operations

- [x] 7.1 Implement `getAt(list, position)` → 1-indexed access
- [x] 7.2 Implement `union(list1, list2)` → list union without duplicates
- [x] 7.3 Implement `makeSubList(list, start, length)` → sublist extraction
- [x] 7.4 Verify list operations

## 8. Property List Operations

- [x] 8.1 Implement `getProp(propList, symbol)` → get property by symbol
- [x] 8.2 Implement `getPropAt(propList, index)` → get property at position
- [x] 8.3 Implement `findPos(propList, symbol)` → find position of property
- [x] 8.4 Verify property list operations

## 9. String Operations

- [x] 9.1 Implement `numToChar(code)` → `String.fromCharCode()`
- [x] 9.2 Implement `contains(string, substring)` → string includes
- [x] 9.3 Implement `starts(string, prefix)` → string starts with
- [x] 9.4 Verify string operations

## 10. Conversion Functions

- [x] 10.1 Verify `integer()` handles all cases
- [x] 10.2 Verify `float()` handles all cases
- [x] 10.3 Verify `string()` handles all cases
- [x] 10.4 Verify `value()` handles all cases

## 11. Instance Creation

- [x] 11.1 Implement `newFn(scriptRef)` → create instance from parent script
- [x] 11.2 Implement `rawNew(scriptRef)` → create without initialization
- [x] 11.3 Verify instance creation

## 12. Network Functions

- [x] 12.1 Implement `netAbort(netID)` → abort network operation
- [x] 12.2 Implement `netLastModDate(netID)` → last modified date
- [x] 12.3 Implement `netMIME(netID)` → MIME type
- [x] 12.4 Verify network functions

## 13. Sound Functions

- [x] 13.1 Implement `soundBusy(channel)` → check if playing
- [x] 13.2 Implement `playSound(channel, member)` → play sound
- [x] 13.3 Implement `queueSound(channel, member)` → queue sound
- [x] 13.4 Verify sound functions

## 14. Window and Stage Functions

- [x] 14.1 Implement `updateStage()` → refresh stage
- [x] 14.2 Implement `moveToFront(window)` → bring to front
- [x] 14.3 Implement `moveToBack(window)` → send to back
- [x] 14.4 Verify window functions

## 15. Cast and Media Functions

- [x] 15.1 Implement `newMember(type)` → create cast member
- [x] 15.2 Implement `unLoadMember(member)` → unload member
- [x] 15.3 Implement `preLoadMember(member)` → preload member
- [x] 15.4 Implement `resetCastLibs()` → reset cast libraries
- [x] 15.5 Verify cast functions

## 16. Date and Time Functions

- [x] 16.1 Implement `date()` → return current date string
- [x] 16.2 Implement `date(year, month, day)` → create date object
- [x] 16.3 Verify date functions

## 17. Miscellaneous Functions

- [x] 17.1 Implement `halt()` → stop movie execution
- [x] 17.2 Implement `quit()` → quit application
- [x] 17.3 Implement `bitNot(int)` → bitwise NOT
- [x] 17.4 Verify `bitAnd()`, `bitOr()`, `bitXor()` work correctly
- [x] 17.5 Verify miscellaneous functions

## 18. Image Functions

- [x] 18.1 Implement `copyPixels()` → copy pixels between images
- [x] 18.2 Implement `fill()` → fill region with color
- [x] 18.3 Implement `getPixel()` → get pixel color
- [x] 18.4 Implement `setPixel()` → set pixel color
- [x] 18.5 Implement `createMask()` → create mask from image
- [x] 18.6 Verify image functions

## 19. Core Object Properties

- [x] 19.1 Implement `_movie.moviePath` property in api.js
- [x] 19.2 Implement `_movie.actorList` property in api.js
- [x] 19.3 Implement `_player.alertHook` property in api.js
- [x] 19.4 Implement `_player.runMode` property in api.js
- [x] 19.5 Implement `_player.debugPlaybackEnabled` property in api.js
- [x] 19.6 Implement `_player.exitLock` property in api.js
- [x] 19.7 Implement `_player.xtraList` property in api.js
- [x] 19.8 Implement `_mouse.clickOn` property in api.js
- [x] 19.9 Implement `_mouse.doubleClick` property in api.js
- [x] 19.10 Implement `_key.keyCode` property in api.js
- [x] 19.11 Implement `_key.key` property in api.js
- [x] 19.12 Implement `_key.shiftDown` property in api.js
- [x] 19.13 Implement `_key.controlDown` property in api.js
- [x] 19.14 Implement `_key.optionDown` property in api.js
- [x] 19.15 Implement `_key.commandDown` property in api.js
- [x] 19.16 Implement `_system.milliseconds` property in api.js
- [x] 19.17 Implement `_system.timer` property in api.js
- [x] 19.18 Implement `_system.platform` property in api.js
- [x] 19.19 Implement `_system.colorDepth` property in api.js
- [x] 19.20 Implement `_system.randomSeed` property in api.js
- [x] 19.21 Verify all core object properties

## 20. Member and Sprite Properties

- [x] 20.1 Implement `member.regPoint` property in core.js
- [x] 20.2 Implement `member.fontSize` property (text members) in core.js
- [x] 20.3 Implement `member.font` property (text members) in core.js
- [x] 20.4 Implement `member.text` property (text members) in core.js
- [x] 20.5 Implement `member.picture` property (bitmap members) in core.js
- [x] 20.6 Implement `member.ink` property in core.js
- [x] 20.7 Implement `sprite.num` property in core.js
- [x] 20.8 Implement `sprite.member` property in core.js
- [x] 20.9 Implement `sprite.loc` property in core.js
- [x] 20.10 Implement `sprite.locH` and `sprite.locV` properties in core.js
- [x] 20.11 Implement `sprite.rect` property in core.js
- [x] 20.12 Implement `sprite.ink` property in core.js
- [x] 20.13 Implement `sprite.blend` property in core.js
- [x] 20.14 Implement `sprite.visible` property in core.js
- [x] 20.15 Implement `sprite.foreColor` and `sprite.backColor` properties in core.js
- [x] 20.16 Verify member and sprite properties

## 21. Build Verification

- [x] 21.1 Run `make build` to verify all exports compile
- [x] 21.2 Verify TypeScript LSP recognizes all Director API imports
- [x] 21.3 Verify no circular dependencies
- [x] 21.4 Verify no breaking changes to existing code

## 22. Documentation

- [x] 22.1 Create naming mismatch table in specs
- [x] 22.2 Document all 310 methods with signatures
- [x] 22.3 Document all 577 properties by object
- [x] 22.4 Document all 56 `the` properties
- [x] 22.5 Document chunk expression syntax
- [x] 22.6 Document operator translations
- [x] 22.7 Document reserved word conflicts
