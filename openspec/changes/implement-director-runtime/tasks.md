## 1. Module Architecture Refactoring

- [ ] 1.1 Create `api.js` with Director API surface (constants, globals, functions from current runtime.js)
- [ ] 1.2 Move constants (`VOID`, `EMPTY`, `PI`, `RETURN`, `SPACE`, `TAB`, `QUOTE`) from runtime.js to api.js
- [ ] 1.3 Move globals (`_global`, `_movie`, `_player`, `_mouse`, `_key`, `_sound`, `_system`, `_window`) from runtime.js to api.js
- [ ] 1.4 Move API functions (type checks, data types, conversions, math, member access, etc.) from runtime.js to api.js
- [ ] 1.5 Update api.js to import from core.js (classes, helpers)
- [ ] 1.6 Merge loader.js into core.js (loadImage, loadModule, loadPromise, pending tracking)
- [ ] 1.7 Refactor runtime.js to contain browser plugin replacement (custom elements, mount, run, canvas management)
- [ ] 1.8 Move custom element definitions (x-object, x-param) to runtime.js
- [ ] 1.9 Move setCanvas, setExternalParams, load, start, registerCast to runtime.js
- [ ] 1.10 Update index.js barrel export to export api.js, runtime.js, syntax.js (NOT core.js)
- [ ] 1.11 Delete loader.js (merged into core.js)
- [ ] 1.12 Verify all existing imports still work via barrel export
- [ ] 1.13 Verify no circular dependencies between modules

## 2. Type-check Function Aliases

- [ ] 2.1 Add `voidp` as alias for `voidP` in api.js
- [ ] 2.2 Add `integerp` as alias for `integerP` in api.js
- [ ] 2.3 Add `floatp` as alias for `floatP` in api.js
- [ ] 2.4 Add `listp` as alias for `listP` in api.js
- [ ] 2.5 Add `objectp` as alias for `objectP` in api.js
- [ ] 2.6 Add `stringp` as alias for `stringP` in api.js
- [ ] 2.7 Add `symbolp` as alias for `symbolP` in api.js
- [ ] 2.8 Add `rollover` as alias for `rollOver` in api.js
- [ ] 2.9 Verify all aliases work correctly

## 3. Math Functions

- [ ] 3.1 Implement `abs(numericExpression)` → `Math.abs()`
- [ ] 3.2 Implement `atan(angle)` → `Math.atan()`
- [ ] 3.3 Implement `sqrt(number)` → `Math.sqrt()`
- [ ] 3.4 Implement `tan(angle)` → `Math.tan()`
- [ ] 3.5 Implement `log(number)` → `Math.log()`
- [ ] 3.6 Implement `power(base, exponent)` → `Math.pow()`
- [ ] 3.7 Implement `max(a, b)` and `max(list)` → `Math.max()`
- [ ] 3.8 Implement `min(a, b)` and `min(list)` → `Math.min()`
- [ ] 3.9 Verify math functions with test cases

## 4. `the` Proxy Properties (High Priority)

- [ ] 4.1 Add `the.doubleClick` → `_mouse.doubleClick`
- [ ] 4.2 Add `the.stage` → Stage dimensions object
- [ ] 4.3 Add `the.keyCode` → `_key.keyCode`
- [ ] 4.4 Add `the.time` → formatted time string
- [ ] 4.5 Add `the.shiftDown` → `_key.shiftDown`
- [ ] 4.6 Add `the.rollover` → `_mouse.rollOver()`
- [ ] 4.7 Add `the.key` → `_key.key`
- [ ] 4.8 Add `the.selStart` → selection start position
- [ ] 4.9 Add `the.selEnd` → selection end position
- [ ] 4.10 Verify high-priority `the` properties

## 5. `the` Proxy Properties (Medium Priority)

- [ ] 5.1 Add `the.randomSeed` → `_system.randomSeed`
- [ ] 5.2 Add `the.optionDown` → `_key.optionDown`
- [ ] 5.3 Add `the.frameTempo` → `_movie.frameTempo`
- [ ] 5.4 Add `the.date` → formatted date string
- [ ] 5.5 Add `the.colorDepth` → `_system.colorDepth`
- [ ] 5.6 Add `the.timer` → `_system.timer`
- [ ] 5.7 Add `the.moviePath` → `_movie.moviePath`
- [ ] 5.8 Add `the.platform` → `_system.platform`
- [ ] 5.9 Add `the.floatPrecision` → `_system.floatPrecision`
- [ ] 5.10 Add `the.debugPlaybackEnabled` → `_player.debugPlaybackEnabled`
- [ ] 5.11 Add `the.maxinteger` → `Number.MAX_SAFE_INTEGER`
- [ ] 5.12 Add `the.commandDown` → `_key.commandDown`
- [ ] 5.13 Add `the.clickOn` → `_mouse.clickOn`
- [ ] 5.14 Add `the.frame` → `_movie.frame`
- [ ] 5.15 Verify medium-priority `the` properties

## 6. `the` Proxy Properties (Low Priority)

- [ ] 6.1 Add `the.xtraList` → `_player.xtraList`
- [ ] 6.2 Add `the.parameters` → `_player.parameters`
- [ ] 6.3 Add `the.exitLock` → `_player.exitLock`
- [ ] 6.4 Add `the.editShortcutsEnabled` → `_player.editShortcutsEnabled`
- [ ] 6.5 Add remaining low-priority `the` properties
- [ ] 6.6 Verify all 56 `the` properties are accessible

## 7. List Operations

- [ ] 7.1 Implement `getAt(list, position)` → 1-indexed access
- [ ] 7.2 Implement `union(list1, list2)` → list union without duplicates
- [ ] 7.3 Implement `makeSubList(list, start, length)` → sublist extraction
- [ ] 7.4 Verify list operations

## 8. Property List Operations

- [ ] 8.1 Implement `getProp(propList, symbol)` → get property by symbol
- [ ] 8.2 Implement `getPropAt(propList, index)` → get property at position
- [ ] 8.3 Implement `findPos(propList, symbol)` → find position of property
- [ ] 8.4 Verify property list operations

## 9. String Operations

- [ ] 9.1 Implement `numToChar(code)` → `String.fromCharCode()`
- [ ] 9.2 Implement `contains(string, substring)` → string includes
- [ ] 9.3 Implement `starts(string, prefix)` → string starts with
- [ ] 9.4 Verify string operations

## 10. Conversion Functions

- [ ] 10.1 Verify `integer()` handles all cases
- [ ] 10.2 Verify `float()` handles all cases
- [ ] 10.3 Verify `string()` handles all cases
- [ ] 10.4 Verify `value()` handles all cases

## 11. Instance Creation

- [ ] 11.1 Implement `newFn(scriptRef)` → create instance from parent script
- [ ] 11.2 Implement `rawNew(scriptRef)` → create without initialization
- [ ] 11.3 Verify instance creation

## 12. Network Functions

- [ ] 12.1 Implement `netAbort(netID)` → abort network operation
- [ ] 12.2 Implement `netLastModDate(netID)` → last modified date
- [ ] 12.3 Implement `netMIME(netID)` → MIME type
- [ ] 12.4 Verify network functions

## 13. Sound Functions

- [ ] 13.1 Implement `soundBusy(channel)` → check if playing
- [ ] 13.2 Implement `playSound(channel, member)` → play sound
- [ ] 13.3 Implement `queueSound(channel, member)` → queue sound
- [ ] 13.4 Verify sound functions

## 14. Window and Stage Functions

- [ ] 14.1 Implement `updateStage()` → refresh stage
- [ ] 14.2 Implement `moveToFront(window)` → bring to front
- [ ] 14.3 Implement `moveToBack(window)` → send to back
- [ ] 14.4 Verify window functions

## 15. Cast and Media Functions

- [ ] 15.1 Implement `newMember(type)` → create cast member
- [ ] 15.2 Implement `unLoadMember(member)` → unload member
- [ ] 15.3 Implement `preLoadMember(member)` → preload member
- [ ] 15.4 Implement `resetCastLibs()` → reset cast libraries
- [ ] 15.5 Verify cast functions

## 16. Date and Time Functions

- [ ] 16.1 Implement `date()` → return current date string
- [ ] 16.2 Implement `date(year, month, day)` → create date object
- [ ] 16.3 Verify date functions

## 17. Miscellaneous Functions

- [ ] 17.1 Implement `halt()` → stop movie execution
- [ ] 17.2 Implement `quit()` → quit application
- [ ] 17.3 Implement `bitNot(int)` → bitwise NOT
- [ ] 17.4 Verify `bitAnd()`, `bitOr()`, `bitXor()` work correctly
- [ ] 17.5 Verify miscellaneous functions

## 18. Image Functions

- [ ] 18.1 Implement `copyPixels()` → copy pixels between images
- [ ] 18.2 Implement `fill()` → fill region with color
- [ ] 18.3 Implement `getPixel()` → get pixel color
- [ ] 18.4 Implement `setPixel()` → set pixel color
- [ ] 18.5 Implement `createMask()` → create mask from image
- [ ] 18.6 Verify image functions

## 19. Core Object Properties

- [ ] 19.1 Implement `_movie.moviePath` property in api.js
- [ ] 19.2 Implement `_movie.actorList` property in api.js
- [ ] 19.3 Implement `_player.alertHook` property in api.js
- [ ] 19.4 Implement `_player.runMode` property in api.js
- [ ] 19.5 Implement `_player.debugPlaybackEnabled` property in api.js
- [ ] 19.6 Implement `_player.exitLock` property in api.js
- [ ] 19.7 Implement `_player.xtraList` property in api.js
- [ ] 19.8 Implement `_mouse.clickOn` property in api.js
- [ ] 19.9 Implement `_mouse.doubleClick` property in api.js
- [ ] 19.10 Implement `_key.keyCode` property in api.js
- [ ] 19.11 Implement `_key.key` property in api.js
- [ ] 19.12 Implement `_key.shiftDown` property in api.js
- [ ] 19.13 Implement `_key.controlDown` property in api.js
- [ ] 19.14 Implement `_key.optionDown` property in api.js
- [ ] 19.15 Implement `_key.commandDown` property in api.js
- [ ] 19.16 Implement `_system.milliseconds` property in api.js
- [ ] 19.17 Implement `_system.timer` property in api.js
- [ ] 19.18 Implement `_system.platform` property in api.js
- [ ] 19.19 Implement `_system.colorDepth` property in api.js
- [ ] 19.20 Implement `_system.randomSeed` property in api.js
- [ ] 19.21 Verify all core object properties

## 20. Member and Sprite Properties

- [ ] 20.1 Implement `member.regPoint` property in core.js
- [ ] 20.2 Implement `member.fontSize` property (text members) in core.js
- [ ] 20.3 Implement `member.font` property (text members) in core.js
- [ ] 20.4 Implement `member.text` property (text members) in core.js
- [ ] 20.5 Implement `member.picture` property (bitmap members) in core.js
- [ ] 20.6 Implement `member.ink` property in core.js
- [ ] 20.7 Implement `sprite.num` property in core.js
- [ ] 20.8 Implement `sprite.member` property in core.js
- [ ] 20.9 Implement `sprite.loc` property in core.js
- [ ] 20.10 Implement `sprite.locH` and `sprite.locV` properties in core.js
- [ ] 20.11 Implement `sprite.rect` property in core.js
- [ ] 20.12 Implement `sprite.ink` property in core.js
- [ ] 20.13 Implement `sprite.blend` property in core.js
- [ ] 20.14 Implement `sprite.visible` property in core.js
- [ ] 20.15 Implement `sprite.foreColor` and `sprite.backColor` properties in core.js
- [ ] 20.16 Verify member and sprite properties

## 21. Build Verification

- [ ] 21.1 Run `make build` to verify all exports compile
- [ ] 21.2 Verify TypeScript LSP recognizes all Director API imports
- [ ] 21.3 Verify no circular dependencies
- [ ] 21.4 Verify no breaking changes to existing code

## 22. Documentation

- [ ] 22.1 Create naming mismatch table in specs
- [ ] 22.2 Document all 310 methods with signatures
- [ ] 22.3 Document all 577 properties by object
- [ ] 22.4 Document all 56 `the` properties
- [ ] 22.5 Document chunk expression syntax
- [ ] 22.6 Document operator translations
- [ ] 22.7 Document reserved word conflicts
