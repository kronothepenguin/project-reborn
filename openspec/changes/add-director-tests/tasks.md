## 1. Test Infrastructure Setup

- [x] 1.1 Add vitest to devDependencies in apps/client/package.json using `pnpm add -D vitest`
- [x] 1.2 Create vitest.config.js with jsdom environment
- [x] 1.3 Add test script to package.json ("test": "vitest")
- [x] 1.4 Create apps/client/src/director/__tests__/ directory structure
- [x] 1.5 Verify vitest runs with `pnpm test` command

## 2. Director API Tests - Constants

- [x] 2.1 Create __tests__/constants.test.js for VOID, EMPTY, PI, RETURN, SPACE, TAB, QUOTE
- [x] 2.2 Test VOID equals undefined
- [x] 2.3 Test EMPTY equals empty string
- [x] 2.4 Test PI equals Math.PI
- [x] 2.5 Test string constants (RETURN, SPACE, TAB, QUOTE)

## 3. Director API Tests - Math Functions

- [x] 3.1 Create __tests__/math.test.js for all math functions
- [x] 3.2 Test abs() with positive, negative, and float values
- [x] 3.3 Test sqrt() with perfect squares and zero
- [x] 3.4 Test max() with two arguments and with list
- [x] 3.5 Test min() with two arguments and with list
- [x] 3.6 Test power() with various base/exponent combinations
- [x] 3.7 Test trigonometric functions (sin, cos, tan, atan)
- [x] 3.8 Test log() with various values
- [x] 3.9 Test random() returns values in expected range

## 4. Director API Tests - Type Checking Functions

- [x] 4.1 Create __tests__/typechecks.test.js for all type check functions
- [x] 4.2 Test voidP() and voidp() alias
- [x] 4.3 Test integerP() and integerp() alias
- [x] 4.4 Test floatP() and floatp() alias
- [x] 4.5 Test listP() and listp() alias
- [x] 4.6 Test objectP() and objectp() alias
- [x] 4.7 Test stringP() and stringp() alias
- [x] 4.8 Test symbolP() and symbolp() alias
- [x] 4.9 Test rollover and rollOver alias
- [x] 4.10 Test ilk() function with various types

## 5. Director API Tests - List Operations

- [x] 5.1 Create __tests__/list-operations.test.js for list functions
- [x] 5.2 Test list() creation with various arguments
- [x] 5.3 Test getAt() with 1-indexed positions
- [x] 5.4 Test union() combines lists without duplicates
- [x] 5.5 Test makeSubList() extracts correct sublist
- [x] 5.6 Test List class methods (add, addAt, deleteAt, deleteOne, duplicate, sort)
- [x] 5.7 Test List proxy access with numeric indices

## 6. Director API Tests - Property List Operations

- [x] 6.1 Create __tests__/proplist-operations.test.js for property list functions
- [x] 6.2 Test propList() creation with symbol/value pairs
- [x] 6.3 Test getProp() retrieves value by symbol
- [x] 6.4 Test getPropAt() retrieves key at position
- [x] 6.5 Test findPos() finds position of property
- [x] 6.6 Test PropList class methods (addProp, deleteProp, duplicate, getaProp, setaProp)
- [x] 6.7 Test PropList proxy access with symbols

## 7. Director API Tests - String Operations

- [x] 7.1 Create __tests__/string-operations.test.js for string functions
- [x] 7.2 Test numToChar() converts codes to characters
- [x] 7.3 Test charToNum() converts characters to codes
- [x] 7.4 Test contains() checks for substring presence
- [x] 7.5 Test starts() checks for prefix
- [x] 7.6 Test chars() extracts substring (1-indexed)
- [x] 7.7 Test offset() finds substring position (1-indexed)
- [x] 7.8 Test length() returns string length

## 8. Director API Tests - Conversion Functions

- [x] 8.1 Create __tests__/conversions.test.js for conversion functions
- [x] 8.2 Test integer() converts strings and truncates floats
- [x] 8.3 Test float() converts strings to floats
- [x] 8.4 Test string() converts various types to strings
- [x] 8.5 Test value() parses strings to appropriate types
- [x] 8.6 Test symbol() creates Symbol.for()

## 9. Director API Tests - Instance Creation

- [x] 9.1 Create __tests__/instance-creation.test.js for instance functions
- [x] 9.2 Test newFn() creates instance from script reference
- [x] 9.3 Test rawNew() creates instance without initialization

## 10. Director API Tests - Network Functions

- [x] 10.1 Create __tests__/network.test.js for network function stubs
- [x] 10.2 Test netAbort() is callable
- [x] 10.3 Test netDone() is callable
- [x] 10.4 Test netError() is callable
- [x] 10.5 Test netTextResult() is callable
- [x] 10.6 Test netLastModDate() is callable
- [x] 10.7 Test netMIME() is callable

## 11. Director API Tests - Sound Functions

- [x] 11.1 Create __tests__/sound.test.js for sound functions
- [x] 11.2 Test soundBusy() returns false for inactive channel
- [x] 11.3 Test playSound() is callable
- [x] 11.4 Test queueSound() is callable

## 12. Director API Tests - Window and Stage Functions

- [x] 12.1 Create __tests__/window-stage.test.js for window/stage functions
- [x] 12.2 Test updateStage() is callable
- [x] 12.3 Test moveToFront() is callable
- [x] 12.4 Test moveToBack() is callable

## 13. Director API Tests - Cast and Media Functions

- [x] 13.1 Create __tests__/cast-media.test.js for cast/media functions
- [x] 13.2 Test newMember() creates member with correct type
- [x] 13.3 Test unLoadMember() is callable
- [x] 13.4 Test preLoadMember() is callable
- [x] 13.5 Test resetCastLibs() is callable

## 14. Director API Tests - Date and Time Functions

- [x] 14.1 Create __tests__/datetime.test.js for date/time functions
- [x] 14.2 Test date() returns current date string
- [x] 14.3 Test date(year, month, day) creates Date object
- [x] 14.4 Test time() returns current time string

## 15. Director API Tests - Miscellaneous Functions

- [x] 15.1 Create __tests__/misc.test.js for miscellaneous functions
- [x] 15.2 Test halt() is callable
- [x] 15.3 Test quit() is callable
- [x] 15.4 Test bitNot() performs bitwise NOT
- [x] 15.5 Test bitAnd() performs bitwise AND
- [x] 15.6 Test bitOr() performs bitwise OR
- [x] 15.7 Test bitXor() performs bitwise XOR

## 16. Director Proxy Tests - High Priority Properties

- [x] 16.1 Create __tests__/the-proxy-high.test.js for high-priority properties
- [x] 16.2 Test the.doubleClick maps to _mouse.doubleClick
- [x] 16.3 Test the.stage returns stage dimensions
- [x] 16.4 Test the.keyCode maps to _key.keyCode
- [x] 16.5 Test the.time returns formatted time string
- [x] 16.6 Test the.shiftDown maps to _key.shiftDown
- [x] 16.7 Test the.rollover returns rollover state
- [x] 16.8 Test the.key maps to _key.key
- [x] 16.9 Test the.selStart returns selection start
- [x] 16.10 Test the.selEnd returns selection end

## 17. Director Proxy Tests - Medium Priority Properties

- [x] 17.1 Create __tests__/the-proxy-medium.test.js for medium-priority properties
- [x] 17.2 Test the.randomSeed maps to _system.randomSeed
- [x] 17.3 Test the.optionDown maps to _key.optionDown
- [x] 17.4 Test the.frameTempo maps to _movie.frameTempo
- [x] 17.5 Test the.date returns formatted date string
- [x] 17.6 Test the.colorDepth maps to _system.colorDepth
- [x] 17.7 Test the.timer maps to _system.timer
- [x] 17.8 Test the.moviePath maps to _movie.moviePath
- [x] 17.9 Test the.platform maps to _system.platform
- [x] 17.10 Test the.floatPrecision maps to _system.floatPrecision
- [x] 17.11 Test the.debugPlaybackEnabled maps to _player.debugPlaybackEnabled
- [x] 17.12 Test the.maxinteger returns Number.MAX_SAFE_INTEGER
- [x] 17.13 Test the.commandDown maps to _key.commandDown
- [x] 17.14 Test the.clickOn maps to _mouse.clickOn
- [x] 17.15 Test the.frame maps to _movie.frame

## 18. Director Proxy Tests - Low Priority Properties

- [x] 18.1 Create __tests__/the-proxy-low.test.js for low-priority properties
- [x] 18.2 Test the.xtraList maps to _player.xtraList
- [x] 18.3 Test the.parameters maps to _player.parameters
- [x] 18.4 Test the.exitLock maps to _player.exitLock
- [x] 18.5 Test the.editShortcutsEnabled maps to _player.editShortcutsEnabled

## 19. Director Proxy Tests - Existing Properties

- [x] 19.1 Create __tests__/the-proxy-existing.test.js for existing properties
- [x] 19.2 Test the.milliSeconds returns Date.now()
- [x] 19.3 Test the.mouseLoc returns Point-like object
- [x] 19.4 Test the.mouseV and the.mouseH map correctly
- [x] 19.5 Test the.itemDelimiter default and setter
- [x] 19.6 Test the.numberOfCastLibs maps to _movie._castCount
- [x] 19.7 Test the.runMode returns "Plugin"
- [x] 19.8 Test the.stageRight, stageLeft, stageTop, stageBottom
- [x] 19.9 Test the.alertHook, environment, lastChannel

## 20. Plugin Integration Tests - Custom Elements

- [x] 20.1 Create __tests__/plugin-custom-elements.test.js with jsdom environment
- [x] 20.2 Test x-object element is registered
- [x] 20.3 Test x-param element is registered
- [x] 20.4 Test x-object connectedCallback is called
- [x] 20.5 Test x-param connectedCallback is called

## 21. Plugin Integration Tests - Canvas Management

- [x] 21.1 Create __tests__/plugin-canvas.test.js with jsdom environment
- [x] 21.2 Test setCanvas() stores canvas reference
- [x] 21.3 Test setCanvas() accepts null
- [x] 21.4 Test setCanvas() with valid canvas element

## 22. Plugin Integration Tests - Parameter Parsing

- [x] 22.1 Create __tests__/plugin-params.test.js with jsdom environment
- [x] 22.2 Test setExternalParams() stores parameters
- [x] 22.3 Test setExternalParams() extracts src parameter
- [x] 22.4 Test setExternalParams() handles empty params

## 23. Plugin Integration Tests - Mouse Events

- [x] 23.1 Create __tests__/plugin-mouse-events.test.js with jsdom environment
- [x] 23.2 Test mousemove updates _mouse.mouseH and _mouse.mouseV
- [x] 23.3 Test mousemove updates _mouse.mouseLoc
- [x] 23.4 Test mousedown updates _mouse.clickOn
- [x] 23.5 Test mouseup updates mouse button state

## 24. Plugin Integration Tests - Keyboard Events

- [x] 24.1 Create __tests__/plugin-keyboard-events.test.js with jsdom environment
- [x] 24.2 Test keydown updates _key.keyCode
- [x] 24.3 Test keydown updates _key.key
- [x] 24.4 Test keydown with shift updates _key.shiftDown
- [x] 24.5 Test keydown with ctrl updates _key.controlDown
- [x] 24.6 Test keydown with alt updates _key.optionDown
- [x] 24.7 Test keydown with meta updates _key.commandDown
- [x] 24.8 Test keyup clears key state

## 25. Plugin Integration Tests - Movie Lifecycle

- [x] 25.1 Create __tests__/plugin-movie-lifecycle.test.js with jsdom environment
- [x] 25.2 Test prepareMovie event is dispatched on canvas
- [x] 25.3 Test prepareMovie event listeners are called
- [x] 25.4 Test movie scripts receive prepareMovie callback
- [x] 25.5 Test requestAnimationFrame is called
- [x] 25.6 Test animation frame respects tempo
- [x] 25.7 Test animation frame updates frame counter

## 26. Plugin Integration Tests - Member Creation

- [x] 26.1 Create __tests__/plugin-member-creation.test.js with jsdom environment
- [x] 26.2 Test createBitmapMember() creates bitmap member
- [x] 26.3 Test createFieldMember() creates field member
- [x] 26.4 Test createScriptMember() creates script member
- [x] 26.5 Test createScriptMember() stores factory

## 27. Plugin Integration Tests - Cast Registration

- [x] 27.1 Create __tests__/plugin-cast-registration.test.js with jsdom environment
- [x] 27.2 Test registerCast() adds cast to movie
- [x] 27.3 Test registerCast() assigns cast number
- [x] 27.4 Test registerCast() stores members
- [x] 27.5 Test multiple casts can be registered

## 28. Plugin Integration Tests - Loader Functions

- [x] 28.1 Create __tests__/plugin-loader.test.js with jsdom environment
- [x] 28.2 Test loadImage() creates Image element
- [x] 28.3 Test loadImage() tracks pending loads
- [x] 28.4 Test loadImage() completes tracking on load
- [x] 28.5 Test loadModule() imports module
- [x] 28.6 Test loadModule() tracks pending loads
- [x] 28.7 Test addFinishedListener() registers callback
- [x] 28.8 Test finished() returns true when no pending loads

## 29. Plugin Integration Tests - Script References

- [x] 29.1 Create __tests__/plugin-script-refs.test.js with jsdom environment
- [x] 29.2 Test script() returns ScriptRef for valid script
- [x] 29.3 Test script() returns stub for missing script
- [x] 29.4 Test ScriptRef.new() creates instance

## 30. Documentation

- [x] 30.1 Create TESTING.md documenting test conventions and patterns
- [x] 30.2 Add test examples to TESTING.md with Director MX 2004 reference citations
- [x] 30.3 Document how to run specific test files
- [x] 30.4 Document how to run tests in watch mode
- [x] 30.5 Document Director MX 2004 reference sections used for test verification

## 31. Final Verification

- [x] 31.1 Run full test suite and verify all tests pass
- [x] 31.2 Verify all tests match Director MX 2004 reference documentation
- [x] 31.3 Verify tests run in watch mode without errors
- [x] 31.4 Verify test output is clear and readable
- [x] 31.5 Verify no test interdependencies or flaky tests
