## ADDED Requirements

### Requirement: Math functions SHALL be tested against Director MX 2004 reference

The runtime SHALL provide comprehensive tests for all math functions based on Director MX 2004 reference documentation:

**Functions to test:**
- `abs(numericExpression)` - absolute value
- `atan(angle)` - arctangent
- `cos(angle)` - cosine
- `sin(angle)` - sine
- `sqrt(number)` - square root
- `tan(angle)` - tangent
- `log(number)` - natural logarithm
- `max(a, b)` and `max(list)` - maximum value
- `min(a, b)` and `min(list)` - minimum value
- `power(base, exponent)` - exponentiation
- `random(maxInt)` - random integer 1 to maxInt

#### Scenario: abs returns absolute value for negative numbers
- **WHEN** `abs(-42)` is called
- **THEN** returns `42`

#### Scenario: abs returns same value for positive numbers
- **WHEN** `abs(42)` is called
- **THEN** returns `42`

#### Scenario: abs handles float values
- **WHEN** `abs(-3.14)` is called
- **THEN** returns `3.14`

#### Scenario: sqrt returns square root
- **WHEN** `sqrt(16)` is called
- **THEN** returns `4`

#### Scenario: sqrt handles zero
- **WHEN** `sqrt(0)` is called
- **THEN** returns `0`

#### Scenario: max with two arguments returns larger
- **WHEN** `max(5, 10)` is called
- **THEN** returns `10`

#### Scenario: max with list returns maximum value
- **WHEN** `max(list(3, 7, 2, 9, 1))` is called
- **THEN** returns `9`

#### Scenario: min with two arguments returns smaller
- **WHEN** `min(5, 10)` is called
- **THEN** returns `5`

#### Scenario: min with list returns minimum value
- **WHEN** `min(list(3, 7, 2, 9, 1))` is called
- **THEN** returns `1`

#### Scenario: power returns exponentiation
- **WHEN** `power(2, 8)` is called
- **THEN** returns `256`

#### Scenario: random returns value in range
- **WHEN** `random(10)` is called multiple times
- **THEN** all returned values are integers between 1 and 10 inclusive

### Requirement: Type checking functions SHALL be tested

The runtime SHALL provide tests for all type checking functions including lowercase aliases:

**Functions to test:**
- `voidP(x)` / `voidp(x)` - checks for undefined
- `integerP(x)` / `integerp(x)` - checks for integer
- `floatP(x)` / `floatp(x)` - checks for float
- `listP(x)` / `listp(x)` - checks for List instance
- `objectP(x)` / `objectp(x)` - checks for object instance
- `stringP(x)` / `stringp(x)` - checks for string
- `symbolP(x)` / `symbolp(x)` - checks for symbol
- `ilk(object, type)` - returns type symbol

#### Scenario: voidp returns true for undefined
- **WHEN** `voidp(undefined)` is called
- **THEN** returns `true`

#### Scenario: voidp returns false for defined values
- **WHEN** `voidp(0)` is called
- **THEN** returns `false`

#### Scenario: voidP and voidp are equivalent
- **WHEN** both `voidP(x)` and `voidp(x)` are called with same value
- **THEN** both return same result

#### Scenario: integerp returns true for integers
- **WHEN** `integerp(42)` is called
- **THEN** returns `true`

#### Scenario: integerp returns false for floats
- **WHEN** `integerp(3.14)` is called
- **THEN** returns `false`

#### Scenario: floatp returns true for floats
- **WHEN** `floatp(3.14)` is called
- **THEN** returns `true`

#### Scenario: floatp returns false for integers
- **WHEN** `floatp(42)` is called
- **THEN** returns `false`

#### Scenario: listp returns true for List instances
- **WHEN** `listp(list(1, 2, 3))` is called
- **THEN** returns `true`

#### Scenario: stringp returns true for strings
- **WHEN** `stringp("hello")` is called
- **THEN** returns `true`

#### Scenario: symbolp returns true for symbols
- **WHEN** `symbolp(Symbol.for("test"))` is called
- **THEN** returns `true`

#### Scenario: ilk returns correct type symbol
- **WHEN** `ilk(42)` is called
- **THEN** returns `Symbol.for("integer")`

### Requirement: List operations SHALL be tested

The runtime SHALL provide tests for all list operations:

**Functions to test:**
- `getAt(list, position)` - 1-indexed access
- `union(list1, list2)` - list union without duplicates
- `makeSubList(list, start, length)` - sublist extraction
- `list(...args)` - create list
- List class methods: `add`, `addAt`, `deleteAt`, `deleteOne`, `duplicate`, `getOne`, `getPos`, `setAt`, `sort`

#### Scenario: getAt returns item at 1-indexed position
- **WHEN** `getAt(list(10, 20, 30), 2)` is called
- **THEN** returns `20`

#### Scenario: union combines lists without duplicates
- **WHEN** `union(list(1, 2), list(2, 3))` is called
- **THEN** returns list containing `[1, 2, 3]`

#### Scenario: makeSubList extracts sublist
- **WHEN** `makeSubList(list(1, 2, 3, 4, 5), 2, 3)` is called
- **THEN** returns list containing `[2, 3, 4]`

#### Scenario: list creates new list with values
- **WHEN** `list(1, 2, 3)` is called
- **THEN** returns List instance with count 3

#### Scenario: list.add appends value
- **WHEN** `list(1, 2).add(3)` is called
- **THEN** list contains `[1, 2, 3]`

#### Scenario: list.deleteAt removes at position
- **WHEN** `list(1, 2, 3).deleteAt(2)` is called
- **THEN** list contains `[1, 3]`

#### Scenario: list.duplicate creates shallow copy
- **WHEN** `list(1, 2, 3).duplicate()` is called
- **THEN** returns new List with same values

### Requirement: Property list operations SHALL be tested

The runtime SHALL provide tests for all property list operations:

**Functions to test:**
- `getProp(propList, symbol)` - get property by symbol
- `getPropAt(propList, index)` - get property at position
- `findPos(propList, symbol)` - find position of property
- `propList(...args)` - create property list
- PropList class methods: `addProp`, `deleteProp`, `duplicate`, `getaProp`, `setaProp`, `sort`

#### Scenario: getProp returns value by symbol
- **WHEN** `getProp(propList(Symbol.for("name"), "John"), Symbol.for("name"))` is called
- **THEN** returns `"John"`

#### Scenario: getPropAt returns key at position
- **WHEN** `getPropAt(propList(Symbol.for("a"), 1, Symbol.for("b"), 2), 1)` is called
- **THEN** returns `Symbol.for("a")`

#### Scenario: findPos returns position of property
- **WHEN** `findPos(propList(Symbol.for("a"), 1, Symbol.for("b"), 2), Symbol.for("b"))` is called
- **THEN** returns `2`

#### Scenario: propList creates new property list
- **WHEN** `propList(Symbol.for("x"), 10, Symbol.for("y"), 20)` is called
- **THEN** returns PropList instance with count 2

### Requirement: String operations SHALL be tested

The runtime SHALL provide tests for all string operations:

**Functions to test:**
- `numToChar(code)` - convert code to character
- `charToNum(string)` - get character code
- `contains(string, substring)` - check if string contains substring
- `starts(string, prefix)` - check if string starts with prefix
- `chars(string, start, end)` - extract substring
- `offset(substring, string)` - find position of substring
- `length(string)` - return string length

#### Scenario: numToChar converts code to character
- **WHEN** `numToChar(65)` is called
- **THEN** returns `"A"`

#### Scenario: charToNum converts character to code
- **WHEN** `charToNum("A")` is called
- **THEN** returns `65`

#### Scenario: contains returns true for substring
- **WHEN** `contains("hello world", "world")` is called
- **THEN** returns `true`

#### Scenario: contains returns false when not found
- **WHEN** `contains("hello world", "xyz")` is called
- **THEN** returns `false`

#### Scenario: starts returns true for prefix
- **WHEN** `starts("hello", "hel")` is called
- **THEN** returns `true`

#### Scenario: chars extracts substring (1-indexed)
- **WHEN** `chars("hello", 2, 4)` is called
- **THEN** returns `"ell"`

#### Scenario: offset returns position (1-indexed)
- **WHEN** `offset("world", "hello world")` is called
- **THEN** returns `7`

#### Scenario: length returns string length
- **WHEN** `length("hello")` is called
- **THEN** returns `5`

### Requirement: Conversion functions SHALL be tested

The runtime SHALL provide tests for all conversion functions:

**Functions to test:**
- `integer(expression)` - convert to integer
- `float(expression)` - convert to float
- `string(value)` - convert to string
- `value(string)` - parse string to value
- `symbol(string)` - convert string to symbol

#### Scenario: integer converts string to integer
- **WHEN** `integer("42")` is called
- **THEN** returns `42`

#### Scenario: integer truncates float
- **WHEN** `integer(3.7)` is called
- **THEN** returns `3`

#### Scenario: float converts string to float
- **WHEN** `float("3.14")` is called
- **THEN** returns `3.14`

#### Scenario: string converts number to string
- **WHEN** `string(42)` is called
- **THEN** returns `"42"`

#### Scenario: string converts symbol to description
- **WHEN** `string(Symbol.for("test"))` is called
- **THEN** returns `"test"`

#### Scenario: value parses boolean TRUE
- **WHEN** `value("TRUE")` is called
- **THEN** returns `true`

#### Scenario: value parses integer string
- **WHEN** `value("42")` is called
- **THEN** returns `42`

#### Scenario: symbol creates Symbol.for
- **WHEN** `symbol("test")` is called
- **THEN** returns `Symbol.for("test")`

### Requirement: Instance creation functions SHALL be tested

The runtime SHALL provide tests for instance creation:

**Functions to test:**
- `newFn(scriptRef)` - create instance from parent script
- `rawNew(scriptRef)` - create instance without initialization

#### Scenario: newFn creates instance from script reference
- **WHEN** `newFn(scriptRef)` is called with valid script reference
- **THEN** returns new instance object

#### Scenario: rawNew creates instance without initialization
- **WHEN** `rawNew(scriptRef)` is called
- **THEN** returns new instance object

### Requirement: Network functions SHALL be tested

The runtime SHALL provide tests for network function stubs:

**Functions to test:**
- `netAbort(netID)` - abort network operation
- `netLastModDate(netID)` - last modified date
- `netMIME(netID)` - MIME type
- `netDone()` - check if complete
- `netError()` - get error
- `netTextResult()` - get text result

#### Scenario: netAbort is callable
- **WHEN** `netAbort(1)` is called
- **THEN** does not throw error

#### Scenario: netDone is callable
- **WHEN** `netDone()` is called
- **THEN** does not throw error

### Requirement: Sound functions SHALL be tested

The runtime SHALL provide tests for sound functions:

**Functions to test:**
- `soundBusy(channel)` - check if channel playing
- `playSound(channel, member)` - play sound
- `queueSound(channel, member)` - queue sound

#### Scenario: soundBusy returns false for inactive channel
- **WHEN** `soundBusy(1)` is called
- **THEN** returns `false`

#### Scenario: playSound is callable
- **WHEN** `playSound(1, member)` is called
- **THEN** does not throw error

#### Scenario: queueSound is callable
- **WHEN** `queueSound(1, member)` is called
- **THEN** does not throw error

### Requirement: Window and stage functions SHALL be tested

The runtime SHALL provide tests for window/stage functions:

**Functions to test:**
- `updateStage()` - refresh stage
- `moveToFront(window)` - bring to front
- `moveToBack(window)` - send to back

#### Scenario: updateStage is callable
- **WHEN** `updateStage()` is called
- **THEN** does not throw error

#### Scenario: moveToFront is callable
- **WHEN** `moveToFront(window)` is called
- **THEN** does not throw error

#### Scenario: moveToBack is callable
- **WHEN** `moveToBack(window)` is called
- **THEN** does not throw error

### Requirement: Cast and media functions SHALL be tested

The runtime SHALL provide tests for cast/media functions:

**Functions to test:**
- `newMember(type)` - create cast member
- `unLoadMember(member)` - unload member
- `preLoadMember(member)` - preload member
- `resetCastLibs()` - reset cast libraries

#### Scenario: newMember creates member with type
- **WHEN** `newMember(Symbol.for("bitmap"))` is called
- **THEN** returns Member instance with type `Symbol.for("bitmap")`

#### Scenario: unLoadMember is callable
- **WHEN** `unLoadMember(member)` is called
- **THEN** does not throw error

#### Scenario: preLoadMember is callable
- **WHEN** `preLoadMember(member)` is called
- **THEN** does not throw error

#### Scenario: resetCastLibs is callable
- **WHEN** `resetCastLibs()` is called
- **THEN** does not throw error

### Requirement: Date and time functions SHALL be tested

The runtime SHALL provide tests for date/time functions:

**Functions to test:**
- `date()` - return current date string
- `date(year, month, day)` - create date object
- `time()` - return current time string

#### Scenario: date returns current date string
- **WHEN** `date()` is called
- **THEN** returns non-empty string

#### Scenario: date with arguments creates date object
- **WHEN** `date(2024, 1, 15)` is called
- **THEN** returns Date object for January 15, 2024

#### Scenario: time returns current time string
- **WHEN** `time()` is called
- **THEN** returns non-empty string

### Requirement: Miscellaneous functions SHALL be tested

The runtime SHALL provide tests for miscellaneous functions:

**Functions to test:**
- `halt()` - stop movie execution
- `quit()` - quit application
- `bitNot(int)` - bitwise NOT
- `bitAnd(a, b)` - bitwise AND
- `bitOr(a, b)` - bitwise OR
- `bitXor(a, b)` - bitwise XOR

#### Scenario: halt is callable
- **WHEN** `halt()` is called
- **THEN** does not throw error

#### Scenario: quit is callable
- **WHEN** `quit()` is called
- **THEN** does not throw error

#### Scenario: bitNot performs bitwise NOT
- **WHEN** `bitNot(0)` is called
- **THEN** returns `-1`

#### Scenario: bitAnd performs bitwise AND
- **WHEN** `bitAnd(0xFF, 0x0F)` is called
- **THEN** returns `0x0F` (15)

#### Scenario: bitOr performs bitwise OR
- **WHEN** `bitOr(0xF0, 0x0F)` is called
- **THEN** returns `0xFF` (255)

#### Scenario: bitXor performs bitwise XOR
- **WHEN** `bitXor(0xFF, 0x0F)` is called
- **THEN** returns `0xF0` (240)

### Requirement: Constants SHALL be tested

The runtime SHALL provide tests for all constants:

**Constants to test:**
- `VOID` - undefined value
- `EMPTY` - empty string
- `PI` - mathematical constant π
- `RETURN` - carriage return
- `SPACE` - space character
- `TAB` - tab character
- `QUOTE` - double quote character

#### Scenario: VOID equals undefined
- **WHEN** `VOID === undefined` is evaluated
- **THEN** returns `true`

#### Scenario: EMPTY equals empty string
- **WHEN** `EMPTY === ""` is evaluated
- **THEN** returns `true`

#### Scenario: PI equals Math.PI
- **WHEN** `PI === Math.PI` is evaluated
- **THEN** returns `true`

#### Scenario: RETURN is carriage return
- **WHEN** `RETURN === "\r"` is evaluated
- **THEN** returns `true`

#### Scenario: SPACE is space character
- **WHEN** `SPACE === " "` is evaluated
- **THEN** returns `true`

#### Scenario: TAB is tab character
- **WHEN** `TAB === "\t"` is evaluated
- **THEN** returns `true`

#### Scenario: QUOTE is double quote
- **WHEN** `QUOTE === '"'` is evaluated
- **THEN** returns `true`
