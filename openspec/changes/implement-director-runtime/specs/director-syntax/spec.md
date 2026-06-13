## ADDED Requirements

### Requirement: the proxy SHALL provide system properties

The `the` object SHALL be a Proxy providing access to Director system properties. All 56 properties used in .ls files SHALL be implemented:

| Property | Maps to | Usage Count | Status |
|----------|---------|-------------|--------|
| `itemDelimiter` | `","` (default) | 360 | Implemented |
| `milliSeconds` | `Date.now()` | 138 | Implemented |
| `mouseLoc` | `_mouse.mouseLoc` | 55 | Implemented |
| `stage` | Stage dimensions | 54 | Stub |
| `doubleClick` | `_mouse.doubleClick` | 53 | Missing |
| `number` | Context-dependent | 25 | Missing |
| `mouseV` | `_mouse.mouseV` | 23 | Implemented |
| `mouseH` | `_mouse.mouseH` | 21 | Implemented |
| `runMode` | `"Plugin"` | 18 | Implemented |
| `stageRight` | Stage right edge | 16 | Implemented |
| `stageLeft` | Stage left edge | 15 | Implemented |
| `keyCode` | `_key.keyCode` | 14 | Missing |
| `time` | `time()` | 8 | Missing |
| `shiftDown` | `_key.shiftDown` | 8 | Missing |
| `rollover` | `_mouse.rollOver()` | 8 | Missing |
| `keyboardFocusSprite` | `_movie.keyboardFocusSprite` | 7 | Implemented |
| `key` | `_key.key` | 7 | Missing |
| `randomSeed` | `_system.randomSeed` | 6 | Missing |
| `alertHook` | `_player.alertHook` | 6 | Implemented |
| `optionDown` | `_key.optionDown` | 5 | Missing |
| `long` | Format modifier | 5 | Missing |
| `frameTempo` | `_movie.frameTempo` | 5 | Missing |
| `date` | `date()` | 5 | Missing |
| `colorDepth` | `_system.colorDepth` | 5 | Missing |
| `timer` | `_system.timer` | 4 | Missing |
| `moviePath` | `_movie.moviePath` | 4 | Missing |
| `last` | Context-dependent | 4 | Missing |
| `selStart` | Selection start | 3 | Missing |
| `platform` | `_system.platform` | 3 | Missing |
| `paramCount` | `arguments.length` | 3 | Missing |
| `list` | Context-dependent | 3 | Missing |
| `floatPrecision` | `_system.floatPrecision` | 3 | Missing |
| `debugPlaybackEnabled` | `_player.debugPlaybackEnabled` | 3 | Missing |
| `transaction` | Network transaction | 2 | Missing |
| `stageTop` | Stage top edge | 2 | Implemented |
| `stageBottom` | Stage bottom edge | 2 | Implemented |
| `server` | Network server | 2 | Missing |
| `selEnd` | Selection end | 2 | Missing |
| `reply` | Network reply | 2 | Missing |
| `remote` | Network remote | 2 | Missing |
| `maxinteger` | Max integer | 2 | Missing |
| `frame` | `_movie.frame` | 2 | Implemented |
| `xtraList` | `_player.xtraList` | 1 | Missing |
| `parameters` | `_player.parameters` | 1 | Missing |
| `Netscape` | Browser detection | 1 | Missing |
| `model` | 3D model | 1 | Missing |
| `exitLock` | `_player.exitLock` | 1 | Missing |
| `environment` | `_player.environment` | 1 | Implemented |
| `editShortcutsEnabled` | `_player.editShortcutsEnabled` | 1 | Missing |
| `download` | Network download | 1 | Missing |
| `doorbell` | Sound doorbell | 1 | Missing |
| `content` | Content type | 1 | Missing |
| `commandDown` | `_key.commandDown` | 1 | Missing |
| `clickOn` | `_mouse.clickOn` | 1 | Missing |
| `browser` | Browser detection | 1 | Missing |

#### Scenario: the.milliSeconds returns current time
- **WHEN** `the.milliSeconds` is accessed
- **THEN** returns `Date.now()` (milliseconds since epoch)

#### Scenario: the.keyCode returns last key code
- **WHEN** `_key.keyCode = 65` and `the.keyCode` is accessed
- **THEN** returns `65`

#### Scenario: the.doubleClick returns state
- **WHEN** `the.doubleClick` is accessed
- **THEN** returns boolean

#### Scenario: the.shiftDown returns key state
- **WHEN** `the.shiftDown` is accessed
- **THEN** returns boolean

#### Scenario: the.selStart returns selection start
- **WHEN** `the.selStart` is accessed
- **THEN** returns integer selection start position

#### Scenario: the.selEnd returns selection end
- **WHEN** `the.selEnd` is accessed
- **THEN** returns integer selection end position

#### Scenario: the.itemDelimiter returns delimiter
- **WHEN** `the.itemDelimiter` is accessed
- **THEN** returns `","` (default)

#### Scenario: the.itemDelimiter can be set
- **WHEN** `the.itemDelimiter = ";"` is executed
- **THEN** `the.itemDelimiter` returns `";"`

### Requirement: Chunk expressions SHALL use helper functions

Lingo chunk expressions SHALL be translated to helper function calls:

| Lingo | JavaScript |
|-------|-----------|
| `char[n] of str` | `charOf(str)[n]` |
| `char[n..m] of str` | `charOf(str).slice(n, m)` |
| `char n to m of str` | `char(n).to(m).of(str)` |
| `item[n] of str` | `itemOf(str)[n]` |
| `item[n..m] of str` | `itemOf(str).slice(n, m)` |
| `line[n] of str` | `lineOf(str)[n]` |
| `line[n..m] of str` | `lineOf(str).slice(n, m)` |
| `word[n] of str` | `wordOf(str)[n]` |
| `word[n..m] of str` | `wordOf(str).slice(n, m)` |
| `the number of chars in str` | `charOf(str).count` |
| `the number of items in str` | `itemOf(str).count` |
| `the number of lines in str` | `lineOf(str).count` |
| `the number of words in str` | `wordOf(str).count` |
| `the last char of str` | `charOf(str)[charOf(str).count]` |
| `the last item of str` | `itemOf(str)[itemOf(str).count]` |
| `the last line of str` | `lineOf(str)[lineOf(str).count]` |
| `the last word of str` | `wordOf(str)[wordOf(str).count]` |

#### Scenario: charOf returns character at position
- **WHEN** `charOf("hello")[2]` is accessed
- **THEN** returns `"e"` (1-indexed)

#### Scenario: charOf.slice returns substring
- **WHEN** `charOf("hello").slice(2, 4)` is called
- **THEN** returns `"ell"` (1-indexed, inclusive)

#### Scenario: itemOf splits by delimiter
- **WHEN** `itemOf("a,b,c")[2]` is accessed
- **THEN** returns `"b"` (1-indexed)

#### Scenario: itemOf respects itemDelimiter
- **WHEN** `the.itemDelimiter = ";"` and `itemOf("a;b;c")[2]` is accessed
- **THEN** returns `"b"`

#### Scenario: lineOf splits by carriage return
- **WHEN** `lineOf("line1\rline2\rline3")[2]` is accessed
- **THEN** returns `"line2"`

#### Scenario: wordOf splits by whitespace
- **WHEN** `wordOf("hello world foo")[2]` is accessed
- **THEN** returns `"world"`

#### Scenario: charOf.count returns length
- **WHEN** `charOf("hello").count` is accessed
- **THEN** returns `5`

#### Scenario: itemOf.count returns item count
- **WHEN** `itemOf("a,b,c").count` is accessed
- **THEN** returns `3`

### Requirement: String concatenation operators SHALL be translated

Lingo string concatenation SHALL be translated to JavaScript:

| Lingo | JavaScript |
|-------|-----------|
| `str1 & str2` | `str1 + str2` (no space) |
| `"a" && "b"` | `` `a b` `` (with space) |

#### Scenario: ampersand concatenates without space
- **WHEN** `"hello" & "world"` is evaluated
- **THEN** returns `"helloworld"`

#### Scenario: double-ampersand concatenates with space
- **WHEN** `"hello" && "world"` is evaluated
- **THEN** returns `"hello world"`

### Requirement: Comparison operators SHALL be translated

Lingo comparison operators SHALL be translated to JavaScript:

| Lingo | JavaScript |
|-------|-----------|
| `a = b` | `a === b` |
| `a <> b` | `a !== b` |
| `a < b` | `a < b` |
| `a > b` | `a > b` |
| `a <= b` | `a <= b` |
| `a >= b` | `a >= b` |

#### Scenario: equals comparison
- **WHEN** `5 = 5` is evaluated
- **THEN** returns `true`

#### Scenario: not-equals comparison
- **WHEN** `5 <> 3` is evaluated
- **THEN** returns `true`

### Requirement: Logical operators SHALL be translated

Lingo logical operators SHALL be translated to JavaScript:

| Lingo | JavaScript |
|-------|-----------|
| `a and b` | `a && b` |
| `a or b` | `a \|\| b` |
| `not a` | `!a` |

#### Scenario: and operator
- **WHEN** `true and false` is evaluated
- **THEN** returns `false`

#### Scenario: or operator
- **WHEN** `true or false` is evaluated
- **THEN** returns `true`

#### Scenario: not operator
- **WHEN** `not false` is evaluated
- **THEN** returns `true`

### Requirement: Control flow SHALL be translated

Lingo control flow SHALL be translated to JavaScript:

| Lingo | JavaScript |
|-------|-----------|
| `repeat with i = 1 to n` | `for (let i = 1; i <= n; i++)` |
| `repeat with i = n down to 1` | `for (let i = n; i >= 1; i--)` |
| `repeat with x in list` | `for (const x of list)` |
| `repeat while condition` | `while (condition)` |
| `case x of ... otherwise:` | `switch(x) { ... default: }` |
| `the paramCount` | `arguments.length` |
| `param(n)` | `arguments[n - 1]` (1-indexed) |

#### Scenario: counted repeat loop
- **WHEN** `repeat with i = 1 to 3` is translated
- **THEN** becomes `for (let i = 1; i <= 3; i++)`

#### Scenario: case with otherwise
- **WHEN** `case x of ... otherwise: ... end case` is translated
- **THEN** becomes `switch(x) { ... default: ... }`

#### Scenario: paramCount returns argument count
- **WHEN** `the paramCount` is accessed in a handler with 3 arguments
- **THEN** returns `3`

#### Scenario: param returns argument at position
- **WHEN** `param(2)` is called in a handler with arguments ("a", "b", "c")
- **THEN** returns `"b"` (1-indexed)

### Requirement: Property list literals SHALL be translated

Lingo property list literals SHALL be translated to `propList()` calls:

| Lingo | JavaScript |
|-------|-----------|
| `[:]` | `propList()` |
| `[#a: 1]` | `propList(Symbol.for("a"), 1)` |
| `[#a: 1, #b: 2]` | `propList(Symbol.for("a"), 1, Symbol.for("b"), 2)` |

#### Scenario: empty proplist
- **WHEN** `[:]` is translated
- **THEN** becomes `propList()`

#### Scenario: proplist with symbols
- **WHEN** `[#name: "John", #age: 30]` is translated
- **THEN** becomes `propList(Symbol.for("name"), "John", Symbol.for("age"), 30)`

### Requirement: List literals SHALL be translated

Lingo list literals SHALL be translated to `list()` calls:

| Lingo | JavaScript |
|-------|-----------|
| `[]` | `list()` |
| `[1, 2, 3]` | `list(1, 2, 3)` |

#### Scenario: empty list
- **WHEN** `[]` is translated
- **THEN** becomes `list()`

#### Scenario: list with values
- **WHEN** `[1, 2, 3]` is translated
- **THEN** becomes `list(1, 2, 3)`

### Requirement: Symbol literals SHALL be translated

Lingo symbol literals SHALL be translated to `Symbol.for()`:

| Lingo | JavaScript |
|-------|-----------|
| `#symbolName` | `Symbol.for("symbolName")` |

#### Scenario: symbol literal
- **WHEN** `#openConnection` is translated
- **THEN** becomes `Symbol.for("openConnection")`

### Requirement: JavaScript reserved word conflicts SHALL use Fn suffix

Handlers named with JavaScript reserved words SHALL be renamed:

| Lingo | JavaScript |
|-------|-----------|
| `on delete me` | `deleteFn()` |
| `on try me` | `tryFn()` |
| `on catch me` | `catchFn()` |
| `on new me` | `newFn()` |

#### Scenario: delete handler renamed
- **WHEN** `on delete me` is translated
- **THEN** becomes `deleteFn()`

#### Scenario: try handler renamed
- **WHEN** `on try me` is translated
- **THEN** becomes `tryFn()`
