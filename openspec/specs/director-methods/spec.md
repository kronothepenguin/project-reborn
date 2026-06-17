## ADDED Requirements

### Requirement: Math functions SHALL be implemented

The runtime SHALL provide the following math functions matching Director MX 2004 behavior:

**abs(numericExpression)** - Returns absolute value
**atan(angle)** - Returns arctangent
**cos(angle)** - Returns cosine (already implemented)
**sin(angle)** - Returns sine (already implemented)
**sqrt(number)** - Returns square root
**tan(angle)** - Returns tangent
**log(number)** - Returns natural logarithm
**max(value1, value2)** or **max(list)** - Returns maximum value
**min(value1, value2)** or **min(list)** - Returns minimum value
**power(base, exponent)** - Returns base raised to exponent
**random(maxInt)** - Returns random integer 1 to maxInt (already implemented)

#### Scenario: abs returns absolute value
- **WHEN** `abs(-42)` is called
- **THEN** returns `42`

#### Scenario: abs with float
- **WHEN** `abs(-3.14)` is called
- **THEN** returns `3.14`

#### Scenario: sqrt returns square root
- **WHEN** `sqrt(16)` is called
- **THEN** returns `4`

#### Scenario: max with two arguments
- **WHEN** `max(5, 10)` is called
- **THEN** returns `10`

#### Scenario: min with two arguments
- **WHEN** `min(5, 10)` is called
- **THEN** returns `5`

#### Scenario: power returns exponentiation
- **WHEN** `power(2, 8)` is called
- **THEN** returns `256`

### Requirement: Type checking functions SHALL be implemented with case-insensitive aliases

The runtime SHALL provide type checking functions with both camelCase and lowercase exports to match Lingo's case-insensitive nature:

| Lingo | JavaScript Export | Returns |
|-------|------------------|---------|
| `voidP(x)` / `voidp(x)` | `voidP`, `voidp` | `x == undefined` |
| `integerP(x)` / `integerp(x)` | `integerP`, `integerp` | `Number.isInteger(x)` |
| `floatP(x)` / `floatp(x)` | `floatP`, `floatp` | is float |
| `listP(x)` / `listp(x)` | `listP`, `listp` | `x instanceof List` |
| `objectP(x)` / `objectp(x)` | `objectP`, `objectp` | is object instance |
| `stringP(x)` / `stringp(x)` | `stringP`, `stringp` | `typeof x === "string"` |
| `symbolP(x)` / `symbolp(x)` | `symbolP`, `symbolp` | `typeof x === "symbol"` |
| `ilk(x, type)` | `ilk` | type symbol |

#### Scenario: voidp lowercase alias works
- **WHEN** `voidp(undefined)` is called
- **THEN** returns `true`

#### Scenario: voidP camelCase works
- **WHEN** `voidP(undefined)` is called
- **THEN** returns `true`

#### Scenario: integerp lowercase alias works
- **WHEN** `integerp(42)` is called
- **THEN** returns `true`

#### Scenario: listp lowercase alias works
- **WHEN** `listp(list(1, 2, 3))` is called
- **THEN** returns `true`

### Requirement: List operations SHALL be implemented

The runtime SHALL provide the following list operations:

**addAt(list, position, value)** - Insert value at position (1-indexed)
**count** - Property returning list length (already on List class)
**deleteAt(list, position)** - Delete item at position
**deleteOne(list, value)** - Delete first occurrence of value
**duplicate(list)** - Create shallow copy
**getAt(list, position)** - Get item at position (1-indexed)
**getLast(list)** - Get last item
**getOne(list, value)** - Get position of value (1-indexed, 0 if not found)
**getPos(list, value)** - Same as getOne
**setAt(list, position, value)** - Set item at position
**sort(list)** - Sort list in place
**union(list1, list2)** - Return union of two lists
**makeSubList(list, start, length)** - Return sublist

#### Scenario: getAt returns item at 1-indexed position
- **WHEN** `getAt(list(10, 20, 30), 2)` is called
- **THEN** returns `20`

#### Scenario: union combines lists
- **WHEN** `union(list(1, 2), list(2, 3))` is called
- **THEN** returns `list(1, 2, 3)` (no duplicates)

#### Scenario: duplicate creates copy
- **WHEN** `duplicate(list(1, 2, 3))` is called
- **THEN** returns new list with same values

### Requirement: Property list operations SHALL be implemented

The runtime SHALL provide the following property list operations:

**addProp(propList, symbol, value)** - Add property
**count** - Property returning number of properties
**deleteProp(propList, symbol)** - Delete property by symbol
**duplicate(propList)** - Create shallow copy
**getaProp(propList, symbol)** - Get property value by symbol
**getProp(propList, symbol)** - Alias for getaProp
**getPropAt(propList, index)** - Get property at position (1-indexed)
**setaProp(propList, symbol, value)** - Set property value
**findPos(propList, symbol)** - Find position of property (1-indexed)
**getOne(propList, value)** - Find position of value (1-indexed)
**sort(propList)** - Sort by keys

#### Scenario: getProp returns value by symbol
- **WHEN** `getProp(propList(Symbol.for("name"), "John"), Symbol.for("name"))` is called
- **THEN** returns `"John"`

#### Scenario: getPropAt returns property at position
- **WHEN** `getPropAt(propList(Symbol.for("a"), 1, Symbol.for("b"), 2), 1)` is called
- **THEN** returns `Symbol.for("a")` (the key at position 1)

### Requirement: String operations SHALL be implemented

The runtime SHALL provide the following string operations:

**chars(string, start, end)** - Extract substring (1-indexed, already implemented)
**charToNum(string)** - Get character code (already implemented)
**numToChar(code)** - Convert code to character
**offset(substring, string)** - Find position of substring (1-indexed, 0 if not found, already implemented)
**length(string)** - Return string length (already implemented)
**contains(string, substring)** - Check if string contains substring
**starts(string, prefix)** - Check if string starts with prefix

#### Scenario: numToChar converts code to character
- **WHEN** `numToChar(65)` is called
- **THEN** returns `"A"`

#### Scenario: contains checks substring
- **WHEN** `contains("hello world", "world")` is called
- **THEN** returns `true`

#### Scenario: starts checks prefix
- **WHEN** `starts("hello", "hel")` is called
- **THEN** returns `true`

### Requirement: Conversion functions SHALL be implemented

The runtime SHALL provide the following conversion functions:

**integer(expression)** - Convert to integer (already implemented)
**float(expression)** - Convert to float (already implemented)
**string(value)** - Convert to string (already implemented)
**value(string)** - Parse string to value (already implemented)
**symbol(string)** - Convert string to symbol (already implemented)

#### Scenario: integer converts string
- **WHEN** `integer("42")` is called
- **THEN** returns `42`

#### Scenario: value parses boolean
- **WHEN** `value("TRUE")` is called
- **THEN** returns `true`

### Requirement: Instance creation functions SHALL be implemented

The runtime SHALL provide functions for creating instances from parent scripts:

**new(scriptRef)** - Create new instance (note: `new` is JS reserved, export as `newFn`)
**rawNew(scriptRef)** - Create instance without initialization

#### Scenario: new creates instance
- **WHEN** `script("MyClass").new()` is called
- **THEN** returns new instance of MyClass

### Requirement: Network functions SHALL be implemented

The runtime SHALL provide the following network functions:

**getNetText(url)** - Fetch text from URL (already stubbed)
**netDone(netID)** - Check if network operation complete (already stubbed)
**netError(netID)** - Get network error (already stubbed)
**netTextResult(netID)** - Get text result (already stubbed)
**postNetText(url, data)** - POST data to URL (already stubbed)
**preloadNetThing(url)** - Preload network resource (already stubbed)
**netAbort(netID)** - Abort network operation
**netLastModDate(netID)** - Get last modified date
**netMIME(netID)** - Get MIME type

#### Scenario: netAbort cancels operation
- **WHEN** `netAbort(netID)` is called
- **THEN** aborts the network operation

### Requirement: Sound functions SHALL be implemented

The runtime SHALL provide the following sound functions:

**sound(channel)** - Get sound channel (already stubbed)
**soundBusy(channel)** - Check if channel playing
**playSound(channel, member)** - Play sound
**queueSound(channel, member)** - Queue sound

#### Scenario: soundBusy checks channel
- **WHEN** `soundBusy(1)` is called
- **THEN** returns `true` if channel 1 is playing

### Requirement: Window and stage functions SHALL be implemented

The runtime SHALL provide the following window/stage functions:

**updateStage()** - Refresh stage display
**moveToFront(window)** - Bring window to front
**moveToBack(window)** - Send window to back

#### Scenario: updateStage refreshes display
- **WHEN** `updateStage()` is called
- **THEN** stage is redrawn

### Requirement: Cast and media functions SHALL be implemented

The runtime SHALL provide the following cast/media functions:

**member(nameOrNum, castLibNum)** - Get cast member (already implemented)
**script(nameOrNum, castLibNum)** - Get script (already implemented)
**castLib(nameOrNum)** - Get cast library (already stubbed)
**newMember(type)** - Create new cast member
**unLoadMember(member)** - Unload member from memory
**preLoadMember(member)** - Preload member into memory
**resetCastLibs()** - Reset all cast libraries

#### Scenario: newMember creates member
- **WHEN** `newMember(#bitmap)` is called
- **THEN** creates new bitmap cast member

### Requirement: Date and time functions SHALL be implemented

The runtime SHALL provide the following date/time functions:

**date()** - Return current date
**time()** - Return current time (already implemented)
**date(year, month, day)** - Create date object

#### Scenario: date returns current date
- **WHEN** `date()` is called
- **THEN** returns current date string

### Requirement: Miscellaneous functions SHALL be implemented

The runtime SHALL provide the following miscellaneous functions:

**beep()** - Play system beep (already stubbed)
**cursor(cursorType)** - Set cursor (already stubbed)
**error(message)** - Display error (already stubbed)
**halt()** - Stop movie execution
**quit()** - Quit application
**go(frame)** - Go to frame (already implemented)
**rollOver(spriteNum)** - Check if mouse over sprite (already implemented)
**puppetSprite(spriteNum, flag)** - Puppet sprite (already implemented)
**puppetTempo(tempo)** - Set tempo (already implemented)

#### Scenario: halt stops execution
- **WHEN** `halt()` is called
- **THEN** movie execution stops

### Requirement: rollOver alias SHALL be exported

The runtime SHALL export `rollover` as an alias for `rollOver` to match Lingo's case-insensitive nature.

#### Scenario: rollover lowercase alias works
- **WHEN** `rollover(1)` is called
- **THEN** returns same result as `rollOver(1)`

### Requirement: Bitwise functions SHALL be implemented

The runtime SHALL provide the following bitwise functions:

**bitAnd(int1, int2)** - Bitwise AND (already stubbed)
**bitOr(int1, int2)** - Bitwise OR (already stubbed)
**bitXor(int1, int2)** - Bitwise XOR (already stubbed)
**bitNot(int)** - Bitwise NOT

#### Scenario: bitAnd performs AND
- **WHEN** `bitAnd(0xFF, 0x0F)` is called
- **THEN** returns `0x0F` (15)

### Requirement: Image functions SHALL be implemented

The runtime SHALL provide the following image functions:

**image(width, height, depth)** - Create image (already stubbed)
**copyPixels(destImage, srcImage, destRect, srcRect)** - Copy pixels
**fill(image, color, rect)** - Fill region
**draw(image, ...)** - Draw on image
**getPixel(image, x, y)** - Get pixel color
**setPixel(image, x, y, color)** - Set pixel color
**createMask(image)** - Create mask from image

#### Scenario: image creates new image
- **WHEN** `image(100, 100, 32)` is called
- **THEN** returns new 100x100 32-bit image
