## ADDED Requirements

### Requirement: Director API SHALL be organized as atomic files in api/ directory

The Director public API SHALL be organized as individual files in `apps/client/src/director/api/`, with each top-level function having its own file. Tests SHALL be co-located in `apps/client/src/director/api/__tests__/`.

**File structure:**
```
apps/client/src/director/api/
├── __tests__/
│   ├── abort.test.js
│   ├── abs.test.js
│   ├── atan.test.js
│   └── ...
├── abort.js
├── abs.js
├── atan.js
├── index.js (barrel export)
└── ...
```

#### Scenario: API functions are importable from barrel export
- **WHEN** code imports `import { abs, sqrt, voidP } from "../director/api"`
- **THEN** all API functions are available

#### Scenario: API tests are co-located
- **WHEN** looking for abs() function tests
- **THEN** they exist at `api/__tests__/abs.test.js`

### Requirement: abort() SHALL exit current handler and callers

The `abort()` function SHALL tell Lingo to exit the current handler and any handler that called it without executing remaining statements.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 11737-11763

**Lingo syntax**: `abort`
**JavaScript syntax**: `abort();`

**Parameters**: None

#### Scenario: abort exits handler
- **WHEN** `abort()` is called inside a handler
- **THEN** execution stops and returns to caller's caller

### Requirement: abs() SHALL return absolute value

The `abs()` function SHALL calculate the absolute value of a numeric expression.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 11767-11796

**Lingo syntax**: `abs(numericExpression)`
**JavaScript syntax**: `Math.abs(numericExpression)`

**Parameters**:
- `numericExpression` Required. An integer or floating-point number.

**Returns**: The absolute value. Integer input returns integer, float input returns float.

#### Scenario: abs returns absolute value for negative numbers
- **WHEN** `abs(-42)` is called
- **THEN** returns `42`

#### Scenario: abs returns same value for positive numbers
- **WHEN** `abs(42)` is called
- **THEN** returns `42`

#### Scenario: abs handles float values
- **WHEN** `abs(-3.14)` is called
- **THEN** returns `3.14`

### Requirement: atan() SHALL return arctangent

The `atan()` function SHALL return the arctangent of a number.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "atan" in Chapter 12

**Lingo syntax**: `atan(angle)`
**JavaScript syntax**: `Math.atan(angle)`

**Parameters**:
- `angle` Required. A number representing an angle.

**Returns**: The arctangent in radians.

#### Scenario: atan returns arctangent
- **WHEN** `atan(1)` is called
- **THEN** returns approximately `0.7854` (π/4)

### Requirement: beep() SHALL play system beep

The `beep()` function SHALL play the system beep sound.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "beep" in Chapter 12

**Lingo syntax**: `beep()`
**JavaScript syntax**: `_sound.beep();`

**Parameters**: None

#### Scenario: beep triggers sound
- **WHEN** `beep()` is called
- **THEN** system beep sound is triggered

### Requirement: bitAnd() SHALL perform bitwise AND

The `bitAnd()` function SHALL perform a bitwise AND operation on two integers.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "bitAnd" in Chapter 12

**Parameters**:
- `a` Required. First integer
- `b` Required. Second integer

**Returns**: The bitwise AND of a and b.

#### Scenario: bitAnd performs bitwise AND
- **WHEN** `bitAnd(12, 10)` is called
- **THEN** returns `8` (1100 & 1010 = 1000)

### Requirement: bitNot() SHALL perform bitwise NOT

The `bitNot()` function SHALL perform a bitwise NOT operation on an integer.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "bitNot" in Chapter 12

**Parameters**:
- `a` Required. Integer to invert

**Returns**: The bitwise NOT of a.

#### Scenario: bitNot performs bitwise NOT
- **WHEN** `bitNot(0)` is called
- **THEN** returns `-1`

### Requirement: bitOr() SHALL perform bitwise OR

The `bitOr()` function SHALL perform a bitwise OR operation on two integers.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "bitOr" in Chapter 12

**Parameters**:
- `a` Required. First integer
- `b` Required. Second integer

**Returns**: The bitwise OR of a and b.

#### Scenario: bitOr performs bitwise OR
- **WHEN** `bitOr(12, 10)` is called
- **THEN** returns `14` (1100 | 1010 = 1110)

### Requirement: bitXor() SHALL perform bitwise XOR

The `bitXor()` function SHALL perform a bitwise XOR operation on two integers.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "bitXor" in Chapter 12

**Parameters**:
- `a` Required. First integer
- `b` Required. Second integer

**Returns**: The bitwise XOR of a and b.

#### Scenario: bitXor performs bitwise XOR
- **WHEN** `bitXor(12, 10)` is called
- **THEN** returns `6` (1100 ^ 1010 = 0110)

### Requirement: call() SHALL call handler by name

The `call()` function SHALL call a handler by name on a script object or list of script objects.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "call" in Chapter 12

**Parameters**:
- `handlerName` Required. Symbol name of handler to call
- `script` Required. Script object or list of script objects
- `...args` Optional. Arguments to pass to handler

#### Scenario: call invokes handler on single script
- **WHEN** `call(Symbol.for("myHandler"), scriptObj)` is called
- **THEN** `scriptObj.myHandler()` is invoked

#### Scenario: call invokes handler on list of scripts
- **WHEN** `call(Symbol.for("myHandler"), [obj1, obj2])` is called
- **THEN** both `obj1.myHandler()` and `obj2.myHandler()` are invoked

### Requirement: castLib() SHALL return cast library reference

The `castLib()` function SHALL return a reference to a cast library by number or name.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "castLib" in Chapter 12

**Parameters**:
- `nameOrNum` Required. Cast library number or name

**Returns**: CastLibraryRef instance

#### Scenario: castLib returns library by number
- **WHEN** `castLib(1)` is called
- **THEN** returns CastLibraryRef for cast library 1

### Requirement: chars() SHALL return substring

The `chars()` function SHALL return a substring from a string expression.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "chars" in Chapter 12

**Parameters**:
- `stringExpression` Required. Source string
- `firstCharacter` Required. Start position (1-indexed)
- `lastCharacter` Required. End position (1-indexed, inclusive)

**Returns**: Substring from firstCharacter to lastCharacter.

#### Scenario: chars returns substring
- **WHEN** `chars("Hello World", 1, 5)` is called
- **THEN** returns `"Hello"`

#### Scenario: chars uses 1-indexed positions
- **WHEN** `chars("ABCDEF", 2, 4)` is called
- **THEN** returns `"BCD"`

### Requirement: charToNum() SHALL return character code

The `charToNum()` function SHALL return the character code of the first character.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "charToNum" in Chapter 12

**Parameters**:
- `stringExpression` Required. String with at least one character

**Returns**: Character code (ASCII/Unicode) of first character.

#### Scenario: charToNum returns character code
- **WHEN** `charToNum("A")` is called
- **THEN** returns `65`

### Requirement: color() SHALL create Color object

The `color()` function SHALL create a new Color object.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "color" in Chapter 12

**Parameters**:
- Various overloads: `color(r, g, b)` or `color(rgbList)` or `color(member)`

**Returns**: Color instance

#### Scenario: color creates RGB color
- **WHEN** `color(255, 128, 0)` is called
- **THEN** returns Color with red=255, green=128, blue=0

### Requirement: copyPixels() SHALL copy pixels between images

The `copyPixels()` function SHALL copy pixels from source to destination image.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "copyPixels" in Chapter 12

**Parameters**:
- `destImage` Required. Destination image object
- `sourceImage` Required. Source image or member
- `destRect` Required. Destination rectangle
- `sourceRect` Required. Source rectangle
- `options` Optional. PropList with ink, maskImage, etc.

#### Scenario: copyPixels copies region
- **WHEN** `copyPixels(dest, src, destRect, sourceRect)` is called
- **THEN** pixels from sourceRect are copied to destRect in destination

### Requirement: cos() SHALL return cosine

The `cos()` function SHALL return the cosine of an angle.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "cos" in Chapter 12

**Parameters**:
- `angle` Required. Angle in radians

**Returns**: Cosine of the angle.

#### Scenario: cos returns cosine
- **WHEN** `cos(0)` is called
- **THEN** returns `1`

### Requirement: cursor() SHALL set cursor

The `cursor()` function SHALL set the cursor shape.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "cursor" in Chapter 12

**Parameters**:
- `cursorType` Required. Cursor type number or member

#### Scenario: cursor sets cursor type
- **WHEN** `cursor(280)` is called
- **THEN** cursor changes to specified type

### Requirement: date() SHALL return date

The `date()` function SHALL return the current date or create a date object.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "date" in Chapter 12

**Parameters**:
- No parameters: returns current date string
- `year, month, day`: creates date object

**Returns**: Date string or Date object

#### Scenario: date returns current date with no args
- **WHEN** `date()` is called
- **THEN** returns current date as string

#### Scenario: date creates date with year, month, day
- **WHEN** `date(2024, 1, 15)` is called
- **THEN** returns Date for January 15, 2024

### Requirement: float() SHALL convert to float

The `float()` function SHALL convert a value to floating-point number.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "float" in Chapter 12

**Parameters**:
- `expression` Required. Value to convert

**Returns**: Floating-point number

#### Scenario: float converts integer
- **WHEN** `float(3)` is called
- **THEN** returns `3.0`

#### Scenario: float converts string
- **WHEN** `float("3.14")` is called
- **THEN** returns `3.14`

### Requirement: floatP() SHALL check for float type

The `floatP()` function SHALL check if a value is a floating-point number.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "floatP" in Chapter 12

**Parameters**:
- `expression` Required. Value to check

**Returns**: TRUE if float, FALSE otherwise

#### Scenario: floatP returns true for float
- **WHEN** `floatP(3.14)` is called
- **THEN** returns `true`

#### Scenario: floatP returns false for integer
- **WHEN** `floatP(3)` is called
- **THEN** returns `false`

### Requirement: getAt() SHALL get list item

The `getAt()` function SHALL get an item from a list at specified position.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "getAt" in Chapter 12

**Parameters**:
- `list` Required. List to access
- `position` Required. Position (1-indexed)

**Returns**: Item at position

#### Scenario: getAt returns item at position
- **WHEN** `getAt(list(10, 20, 30), 2)` is called
- **THEN** returns `20`

### Requirement: getNetText() SHALL fetch URL text

The `getNetText()` function SHALL start downloading text from a URL.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "getNetText" in Chapter 12

**Parameters**:
- `url` Required. URL to fetch
- `propertyList` Optional. HTTP headers/properties

**Returns**: Network transaction ID

#### Scenario: getNetText starts download
- **WHEN** `getNetText("http://example.com/data.txt")` is called
- **THEN** returns network transaction ID

### Requirement: getPixel() SHALL get pixel color

The `getPixel()` function SHALL get the color of a pixel.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "getPixel" in Chapter 12

**Parameters**:
- `x` Required. X coordinate
- `y` Required. Y coordinate
- `imageOrMember` Optional. Source image or member

**Returns**: Color at pixel

#### Scenario: getPixel returns color
- **WHEN** `getPixel(10, 20)` is called
- **THEN** returns Color at that position

### Requirement: getPref() SHALL get preference

The `getPref()` function SHALL get a preference value.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "getPref" in Chapter 12

**Parameters**:
- `name` Required. Preference name

**Returns**: Preference value

#### Scenario: getPref returns stored preference
- **WHEN** `getPref("myPref")` is called after setPref
- **THEN** returns stored value

### Requirement: getProp() SHALL get proplist property

The `getProp()` function SHALL get a property value from a property list.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "getProp" in Chapter 12

**Parameters**:
- `propList` Required. Property list
- `symbol` Required. Property symbol

**Returns**: Property value

#### Scenario: getProp returns property value
- **WHEN** `getProp(propList(Symbol.for("name"), "test"), Symbol.for("name"))` is called
- **THEN** returns `"test"`

### Requirement: getPropAt() SHALL get property at index

The `getPropAt()` function SHALL get a property value at specified index.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "getPropAt" in Chapter 12

**Parameters**:
- `propList` Required. Property list
- `index` Required. Index (1-indexed)

**Returns**: Value at index

#### Scenario: getPropAt returns value at index
- **WHEN** `getPropAt(proplist, 1)` is called
- **THEN** returns first property value

### Requirement: getStreamStatus() SHALL get stream status

The `getStreamStatus()` function SHALL get the status of a network stream.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "getStreamStatus" in Chapter 12

**Parameters**:
- `netID` Required. Network transaction ID

**Returns**: Stream status object

#### Scenario: getStreamStatus returns status
- **WHEN** `getStreamStatus(netID)` is called
- **THEN** returns status object with state property

### Requirement: go() SHALL navigate to frame

The `go()` function SHALL send the playhead to a specific frame.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "go" in Chapter 12

**Parameters**:
- `frameNameOrNum` Required. Frame number or marker name
- `movieName` Optional. Movie name (for linked movies)

#### Scenario: go navigates to frame number
- **WHEN** `go(5)` is called
- **THEN** playhead moves to frame 5

#### Scenario: go navigates to marker
- **WHEN** `go("Author")` is called
- **THEN** playhead moves to "Author" marker

### Requirement: gotoNetPage() SHALL navigate to URL

The `gotoNetPage()` function SHALL navigate the browser to a URL.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "gotoNetPage" in Chapter 12

**Parameters**:
- `url` Required. URL to navigate to
- `window` Optional. Target window

#### Scenario: gotoNetPage navigates browser
- **WHEN** `gotoNetPage("http://example.com")` is called
- **THEN** browser navigates to URL

### Requirement: halt() SHALL stop movie

The `halt()` function SHALL stop the movie playback.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "halt" in Chapter 12

**Parameters**: None

#### Scenario: halt stops playback
- **WHEN** `halt()` is called
- **THEN** movie stops playing

### Requirement: image() SHALL create image object

The `image()` function SHALL create a new image object.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "image" in Chapter 12

**Parameters**:
- `width` Required. Image width
- `height` Required. Image height
- `bitDepth` Optional. Bit depth (default 32)

**Returns**: New ImageObject

#### Scenario: image creates blank image
- **WHEN** `image(100, 100)` is called
- **THEN** returns 100x100 image

### Requirement: importFileInto() SHALL import file

The `importFileInto()` function SHALL import a file into a cast member.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "importFileInto" in Chapter 12

**Parameters**:
- `memberNum` Required. Target cast member number
- `fileName` Required. File to import

#### Scenario: importFileInto imports file
- **WHEN** `importFileInto(1, "image.png")` is called
- **THEN** file is imported into member 1

### Requirement: inside() SHALL check point in rect

The `inside()` function SHALL check if a point is inside a rectangle.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "inside" in Chapter 12

**Parameters**:
- `point` Required. Point to check
- `rect` Required. Rectangle to check against

**Returns**: TRUE if point is inside rect

#### Scenario: inside returns true for point in rect
- **WHEN** `inside(point(50, 50), rect(0, 0, 100, 100))` is called
- **THEN** returns `true`

### Requirement: integer() SHALL convert to integer

The `integer()` function SHALL convert a value to an integer.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "integer" in Chapter 12

**Parameters**:
- `expression` Required. Value to convert

**Returns**: Integer value

#### Scenario: integer converts float
- **WHEN** `integer(3.9)` is called
- **THEN** returns `4` (rounds)

#### Scenario: integer converts string
- **WHEN** `integer("42")` is called
- **THEN** returns `42`

### Requirement: integerP() SHALL check for integer type

The `integerP()` function SHALL check if a value is an integer.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "integerP" in Chapter 12

**Parameters**:
- `expression` Required. Value to check

**Returns**: TRUE if integer, FALSE otherwise

#### Scenario: integerP returns true for integer
- **WHEN** `integerP(42)` is called
- **THEN** returns `true`

#### Scenario: integerP returns false for float
- **WHEN** `integerP(3.14)` is called
- **THEN** returns `false`

### Requirement: intersect() SHALL return rect intersection

The `intersect()` function SHALL return the intersection of two rectangles.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "intersect" in Chapter 12

**Parameters**:
- `rect1` Required. First rectangle
- `rect2` Required. Second rectangle

**Returns**: Intersection rectangle or empty rect if no overlap

#### Scenario: intersect returns overlapping region
- **WHEN** `intersect(rect(0, 0, 100, 100), rect(50, 50, 150, 150))` is called
- **THEN** returns `rect(50, 50, 100, 100)`

### Requirement: ilk() SHALL return type symbol

The `ilk()` function SHALL return a symbol representing the data type.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "ilk" in Chapter 12

**Parameters**:
- `object` Required. Value to check
- `type` Optional. Type symbol to compare against

**Returns**: Type symbol or boolean if type specified

#### Scenario: ilk returns type symbol
- **WHEN** `ilk(42)` is called
- **THEN** returns `Symbol.for("integer")`

#### Scenario: ilk with type returns boolean
- **WHEN** `ilk(42, Symbol.for("number"))` is called
- **THEN** returns `true`

### Requirement: length() SHALL return string length

The `length()` function SHALL return the length of a string.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "length" in Chapter 12

**Parameters**:
- `string` Required. String to measure

**Returns**: Number of characters

#### Scenario: length returns string length
- **WHEN** `length("Hello")` is called
- **THEN** returns `5`

### Requirement: list() SHALL create linear list

The `list()` function SHALL create a new linear list.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "list" in Chapter 12

**Parameters**:
- `...values` Optional. Initial values

**Returns**: New List instance

#### Scenario: list creates empty list
- **WHEN** `list()` is called
- **THEN** returns empty List

#### Scenario: list creates list with values
- **WHEN** `list(1, 2, 3)` is called
- **THEN** returns List containing [1, 2, 3]

### Requirement: listP() SHALL check for list type

The `listP()` function SHALL check if a value is a list.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "listP" in Chapter 12

**Parameters**:
- `item` Required. Value to check

**Returns**: TRUE if list, FALSE otherwise

#### Scenario: listP returns true for list
- **WHEN** `listP(list(1, 2, 3))` is called
- **THEN** returns `true`

#### Scenario: listP returns false for non-list
- **WHEN** `listP("not a list")` is called
- **THEN** returns `false`

### Requirement: log() SHALL return natural logarithm

The `log()` function SHALL return the natural logarithm of a number.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "log" in Chapter 12

**Parameters**:
- `number` Required. Positive number

**Returns**: Natural logarithm

#### Scenario: log returns natural log
- **WHEN** `log(Math.E)` is called
- **THEN** returns approximately `1`

### Requirement: max() SHALL return maximum value

The `max()` function SHALL return the maximum of two values or a list.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "max" in Chapter 12

**Parameters**:
- `value1, value2` OR `list` Required.

**Returns**: Maximum value

#### Scenario: max returns larger of two values
- **WHEN** `max(5, 10)` is called
- **THEN** returns `10`

#### Scenario: max returns max from list
- **WHEN** `max(list(3, 7, 2, 9))` is called
- **THEN** returns `9`

### Requirement: member() SHALL return member reference

The `member()` function SHALL return a reference to a cast member.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "member" in Chapter 12

**Parameters**:
- `nameOrNum` Required. Member name or number
- `castLibNum` Optional. Cast library number

**Returns**: MemberRef instance

#### Scenario: member returns member by number
- **WHEN** `member(1)` is called
- **THEN** returns MemberRef for member 1

#### Scenario: member returns member by name
- **WHEN** `member("myBitmap")` is called
- **THEN** returns MemberRef for named member

### Requirement: min() SHALL return minimum value

The `min()` function SHALL return the minimum of two values or a list.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "min" in Chapter 12

**Parameters**:
- `value1, value2` OR `list` Required.

**Returns**: Minimum value

#### Scenario: min returns smaller of two values
- **WHEN** `min(5, 10)` is called
- **THEN** returns `5`

#### Scenario: min returns min from list
- **WHEN** `min(list(3, 7, 2, 9))` is called
- **THEN** returns `2`

### Requirement: moveToBack() SHALL move window to back

The `moveToBack()` function SHALL move a window behind all others.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "moveToBack" in Chapter 12

**Parameters**:
- `window` Required. Window reference

#### Scenario: moveToBack moves window behind others
- **WHEN** `moveToBack(window(1))` is called
- **THEN** window moves to back

### Requirement: moveToFront() SHALL move window to front

The `moveToFront()` function SHALL move a window in front of all others.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "moveToFront" in Chapter 12

**Parameters**:
- `window` Required. Window reference

#### Scenario: moveToFront moves window to front
- **WHEN** `moveToFront(window(1))` is called
- **THEN** window moves to front

### Requirement: netAbort() SHALL abort network operation

The `netAbort()` function SHALL abort a network operation.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "netAbort" in Chapter 12

**Parameters**:
- `netID` Required. Network transaction ID

#### Scenario: netAbort cancels download
- **WHEN** `netAbort(netID)` is called
- **THEN** network operation is cancelled

### Requirement: netDone() SHALL check if network operation complete

The `netDone()` function SHALL check if a network operation is complete.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "netDone" in Chapter 12

**Parameters**:
- `netID` Required. Network transaction ID

**Returns**: TRUE if complete

#### Scenario: netDone returns true when complete
- **WHEN** network operation finishes and `netDone(netID)` is called
- **THEN** returns `true`

### Requirement: netError() SHALL return network error

The `netError()` function SHALL return error message for network operation.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "netError" in Chapter 12

**Parameters**:
- `netID` Required. Network transaction ID

**Returns**: Error string or "OK"

#### Scenario: netError returns error message
- **WHEN** network operation fails and `netError(netID)` is called
- **THEN** returns error message string

### Requirement: netLastModDate() SHALL return last modified date

The `netLastModDate()` function SHALL return the last modified date of a URL.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "netLastModDate" in Chapter 12

**Parameters**:
- `netID` Required. Network transaction ID

**Returns**: Date string

#### Scenario: netLastModDate returns date
- **WHEN** `netLastModDate(netID)` is called after successful download
- **THEN** returns last modified date string

### Requirement: netMIME() SHALL return MIME type

The `netMIME()` function SHALL return the MIME type of a downloaded resource.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "netMIME" in Chapter 12

**Parameters**:
- `netID` Required. Network transaction ID

**Returns**: MIME type string

#### Scenario: netMIME returns content type
- **WHEN** `netMIME(netID)` is called after downloading HTML
- **THEN** returns `"text/html"`

### Requirement: netTextResult() SHALL return downloaded text

The `netTextResult()` function SHALL return text downloaded from a URL.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "netTextResult" in Chapter 12

**Parameters**:
- `netID` Required. Network transaction ID

**Returns**: Downloaded text string

#### Scenario: netTextResult returns text
- **WHEN** `netTextResult(netID)` is called after successful download
- **THEN** returns downloaded text content

### Requirement: newFn() SHALL create script instance

The `newFn()` function SHALL create a new instance of a parent script.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "new" in Chapter 12

**Parameters**:
- `scriptRef` Required. Script reference

**Returns**: New script instance

#### Scenario: newFn creates instance
- **WHEN** `newFn(script("MyParent"))` is called
- **THEN** returns new instance of MyParent script

### Requirement: newMember() SHALL create new cast member

The `newMember()` function SHALL create a new cast member.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "newMember" in Chapter 12

**Parameters**:
- `type` Required. Member type symbol

**Returns**: New MemberRef

#### Scenario: newMember creates bitmap member
- **WHEN** `newMember(Symbol.for("bitmap"))` is called
- **THEN** returns new bitmap MemberRef

### Requirement: nothing() SHALL do nothing

The `nothing()` function SHALL perform no operation.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "nothing" in Chapter 12

**Parameters**: None

#### Scenario: nothing does nothing
- **WHEN** `nothing()` is called
- **THEN** no operation is performed

### Requirement: numToChar() SHALL convert code to character

The `numToChar()` function SHALL convert a character code to a character.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "numToChar" in Chapter 12

**Parameters**:
- `code` Required. Character code

**Returns**: Character string

#### Scenario: numToChar returns character
- **WHEN** `numToChar(65)` is called
- **THEN** returns `"A"`

### Requirement: objectP() SHALL check for object type

The `objectP()` function SHALL check if a value is a script instance.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "objectP" in Chapter 12

**Parameters**:
- `x` Required. Value to check

**Returns**: TRUE if script instance

#### Scenario: objectP returns true for script instance
- **WHEN** `objectP(newFn(script("MyParent")))` is called
- **THEN** returns `true`

### Requirement: offset() SHALL find substring position

The `offset()` function SHALL find the position of a substring.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "offset" in Chapter 12

**Parameters**:
- `substring` Required. String to find
- `string` Required. String to search

**Returns**: Position (1-indexed) or 0 if not found

#### Scenario: offset finds substring
- **WHEN** `offset("World", "Hello World")` is called
- **THEN** returns `7`

#### Scenario: offset returns 0 when not found
- **WHEN** `offset("xyz", "Hello")` is called
- **THEN** returns `0`

### Requirement: param() SHALL get parameter by index

The `param()` function SHALL get a handler parameter by index.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "param" in Chapter 12

**Parameters**:
- `index` Required. Parameter index (1-indexed)

**Returns**: Parameter value

#### Scenario: param returns parameter
- **WHEN** `param(1)` is called inside handler with args
- **THEN** returns first argument

### Requirement: paramCount() SHALL return parameter count

The `paramCount()` function SHALL return the number of parameters.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "paramCount" in Chapter 12

**Parameters**: None

**Returns**: Number of parameters

#### Scenario: paramCount returns count
- **WHEN** `paramCount()` is called inside handler with 3 args
- **THEN** returns `3`

### Requirement: point() SHALL create Point object

The `point()` function SHALL create a new Point object.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "point" in Chapter 12

**Parameters**:
- `h` Required. Horizontal coordinate
- `v` Required. Vertical coordinate

**Returns**: Point instance

#### Scenario: point creates point
- **WHEN** `point(100, 200)` is called
- **THEN** returns Point with locH=100, locV=200

### Requirement: postNetText() SHALL POST text to URL

The `postNetText()` function SHALL POST text data to a URL.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "postNetText" in Chapter 12

**Parameters**:
- `url` Required. URL to POST to
- `text` Required. Text data to send

**Returns**: Network transaction ID

#### Scenario: postNetText sends data
- **WHEN** `postNetText("http://example.com/api", "data=value")` is called
- **THEN** returns network transaction ID

### Requirement: power() SHALL return exponentiation

The `power()` function SHALL return base raised to exponent.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "power" in Chapter 12

**Parameters**:
- `base` Required. Base number
- `exponent` Required. Exponent

**Returns**: base ^ exponent

#### Scenario: power returns exponentiation
- **WHEN** `power(2, 8)` is called
- **THEN** returns `256`

### Requirement: preLoadMember() SHALL preload member

The `preLoadMember()` function SHALL preload a cast member into memory.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "preLoadMember" in Chapter 12

**Parameters**:
- `member` Required. Member reference

#### Scenario: preLoadMember loads member
- **WHEN** `preLoadMember(member(1))` is called
- **THEN** member is loaded into memory

### Requirement: preloadNetThing() SHALL preload URL

The `preloadNetThing()` function SHALL preload a URL into cache.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "preloadNetThing" in Chapter 12

**Parameters**:
- `url` Required. URL to preload

**Returns**: Network transaction ID

#### Scenario: preloadNetThing caches URL
- **WHEN** `preloadNetThing("http://example.com/image.jpg")` is called
- **THEN** returns network transaction ID

### Requirement: propList() SHALL create property list

The `propList()` function SHALL create a new property list.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "propList" in Chapter 12

**Parameters**:
- `...pairs` Required. Alternating symbol/value pairs

**Returns**: New PropList instance

#### Scenario: propList creates property list
- **WHEN** `propList(Symbol.for("name"), "test", Symbol.for("value"), 42)` is called
- **THEN** returns PropList with #name: "test", #value: 42

### Requirement: puppetSprite() SHALL puppet a sprite

The `puppetSprite()` function SHALL make a sprite a puppet.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "puppetSprite" in Chapter 12

**Parameters**:
- `spriteNum` Required. Sprite channel number
- `flag` Required. TRUE to puppet, FALSE to unpuppet

#### Scenario: puppetSprite makes sprite puppet
- **WHEN** `puppetSprite(1, true)` is called
- **THEN** sprite 1 becomes a puppet

### Requirement: puppetTempo() SHALL set tempo

The `puppetTempo()` function SHALL set the movie tempo.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "puppetTempo" in Chapter 12

**Parameters**:
- `tempo` Required. Frames per second

#### Scenario: puppetTempo sets tempo
- **WHEN** `puppetTempo(60)` is called
- **THEN** movie tempo becomes 60 fps

### Requirement: put() SHALL output to message window

The `put()` function SHALL output text to the message window.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "put" in Chapter 12

**Parameters**:
- `text` Required. Text to output

#### Scenario: put outputs text
- **WHEN** `put("Hello")` is called
- **THEN** "Hello" is output to console

### Requirement: quit() SHALL quit application

The `quit()` function SHALL quit Director or the projector.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "quit" in Chapter 12

**Parameters**: None

#### Scenario: quit exits application
- **WHEN** `quit()` is called
- **THEN** application exits

### Requirement: random() SHALL return random number

The `random()` function SHALL return a random integer.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "random" in Chapter 12

**Parameters**:
- `maxInt` Required. Maximum value

**Returns**: Random integer from 1 to maxInt

#### Scenario: random returns number in range
- **WHEN** `random(10)` is called
- **THEN** returns integer between 1 and 10

### Requirement: rawNew() SHALL create raw instance

The `rawNew()` function SHALL create a new instance without calling new handler.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "rawNew" in Chapter 12

**Parameters**:
- `scriptRef` Required. Script reference

**Returns**: New instance without initialization

#### Scenario: rawNew creates uninitialized instance
- **WHEN** `rawNew(script("MyParent"))` is called
- **THEN** returns new instance without calling new handler

### Requirement: rect() SHALL create Rect object

The `rect()` function SHALL create a new Rect object.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "rect" in Chapter 12

**Parameters**:
- `left` Required. Left edge
- `top` Required. Top edge
- `right` Required. Right edge
- `bottom` Required. Bottom edge

**Returns**: Rect instance

#### Scenario: rect creates rectangle
- **WHEN** `rect(10, 20, 100, 200)` is called
- **THEN** returns Rect with left=10, top=20, right=100, bottom=200

### Requirement: resetCastLibs() SHALL reset cast libraries

The `resetCastLibs()` function SHALL reset all cast libraries.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "resetCastLibs" in Chapter 12

**Parameters**: None

#### Scenario: resetCastLibs clears casts
- **WHEN** `resetCastLibs()` is called
- **THEN** all cast libraries are reset

### Requirement: rollOver() SHALL check sprite rollover

The `rollOver()` function SHALL check if mouse is over a sprite.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "rollOver" in Chapter 12

**Parameters**:
- `spriteNum` Optional. Sprite number (0 for any)

**Returns**: TRUE if mouse is over sprite

#### Scenario: rollOver detects mouse over sprite
- **WHEN** mouse is over sprite 1 and `rollOver(1)` is called
- **THEN** returns `true`

### Requirement: script() SHALL return script reference

The `script()` function SHALL return a reference to a script cast member.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "script" in Chapter 12

**Parameters**:
- `nameOrNum` Required. Script name or number
- `castLibNum` Optional. Cast library number

**Returns**: ScriptRef instance

#### Scenario: script returns script by name
- **WHEN** `script("MyBehavior")` is called
- **THEN** returns ScriptRef for named script

### Requirement: setPixel() SHALL set pixel color

The `setPixel()` function SHALL set the color of a pixel.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "setPixel" in Chapter 12

**Parameters**:
- `x` Required. X coordinate
- `y` Required. Y coordinate
- `color` Required. Color to set

#### Scenario: setPixel sets pixel color
- **WHEN** `setPixel(10, 20, color(255, 0, 0))` is called
- **THEN** pixel at (10, 20) becomes red

### Requirement: setPref() SHALL set preference

The `setPref()` function SHALL set a preference value.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "setPref" in Chapter 12

**Parameters**:
- `name` Required. Preference name
- `value` Required. Value to store

#### Scenario: setPref stores preference
- **WHEN** `setPref("myPref", "value")` is called
- **THEN** preference is stored

### Requirement: sin() SHALL return sine

The `sin()` function SHALL return the sine of an angle.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "sin" in Chapter 12

**Parameters**:
- `angle` Required. Angle in radians

**Returns**: Sine of the angle

#### Scenario: sin returns sine
- **WHEN** `sin(0)` is called
- **THEN** returns `0`

### Requirement: soundBusy() SHALL check if sound playing

The `soundBusy()` function SHALL check if a sound channel is busy.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "soundBusy" in Chapter 12

**Parameters**:
- `channel` Required. Sound channel number

**Returns**: TRUE if channel is playing

#### Scenario: soundBusy returns channel status
- **WHEN** sound is playing on channel 1 and `soundBusy(1)` is called
- **THEN** returns `true`

### Requirement: sprite() SHALL return sprite reference

The `sprite()` function SHALL return a reference to a sprite.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "sprite" in Chapter 12

**Parameters**:
- `nameOrNum` Required. Sprite number

**Returns**: SpriteRef instance

#### Scenario: sprite returns sprite by number
- **WHEN** `sprite(1)` is called
- **THEN** returns SpriteRef for sprite 1

### Requirement: sqrt() SHALL return square root

The `sqrt()` function SHALL return the square root of a number.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "sqrt" in Chapter 12

**Parameters**:
- `number` Required. Non-negative number

**Returns**: Square root

#### Scenario: sqrt returns square root
- **WHEN** `sqrt(16)` is called
- **THEN** returns `4`

### Requirement: stopEvent() SHALL stop current event

The `stopEvent()` function SHALL stop processing the current event.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "stopEvent" in Chapter 12

**Parameters**: None

#### Scenario: stopEvent halts event processing
- **WHEN** `stopEvent()` is called in event handler
- **THEN** event processing stops

### Requirement: string() SHALL convert to string

The `string()` function SHALL convert a value to a string.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "string" in Chapter 12

**Parameters**:
- `value` Required. Value to convert

**Returns**: String representation

#### Scenario: string converts number
- **WHEN** `string(42)` is called
- **THEN** returns `"42"`

#### Scenario: string converts symbol
- **WHEN** `string(Symbol.for("test"))` is called
- **THEN** returns `"test"`

### Requirement: stringP() SHALL check for string type

The `stringP()` function SHALL check if a value is a string.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "stringP" in Chapter 12

**Parameters**:
- `x` Required. Value to check

**Returns**: TRUE if string

#### Scenario: stringP returns true for string
- **WHEN** `stringP("hello")` is called
- **THEN** returns `true`

### Requirement: symbol() SHALL create symbol

The `symbol()` function SHALL create a symbol from a string.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "symbol" in Chapter 12

**Parameters**:
- `string` Required. String to convert

**Returns**: Symbol

#### Scenario: symbol creates symbol
- **WHEN** `symbol("test")` is called
- **THEN** returns Symbol.for("test")

### Requirement: symbolP() SHALL check for symbol type

The `symbolP()` function SHALL check if a value is a symbol.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "symbolP" in Chapter 12

**Parameters**:
- `x` Required. Value to check

**Returns**: TRUE if symbol

#### Scenario: symbolP returns true for symbol
- **WHEN** `symbolP(Symbol.for("test"))` is called
- **THEN** returns `true`

### Requirement: tan() SHALL return tangent

The `tan()` function SHALL return the tangent of an angle.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "tan" in Chapter 12

**Parameters**:
- `angle` Required. Angle in radians

**Returns**: Tangent of the angle

#### Scenario: tan returns tangent
- **WHEN** `tan(0)` is called
- **THEN** returns `0`

### Requirement: time() SHALL return current time

The `time()` function SHALL return the current time.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "time" in Chapter 12

**Parameters**: None

**Returns**: Time string

#### Scenario: time returns current time
- **WHEN** `time()` is called
- **THEN** returns current time as string

### Requirement: timeout() SHALL create timeout

The `timeout()` function SHALL create a timeout object.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "timeout" in Chapter 12

**Parameters**:
- `name` Required. Timeout name
- `new(milliseconds, handler, object)` - Create timeout
- `forget()` - Cancel timeout

**Returns**: Timeout object

#### Scenario: timeout creates recurring callback
- **WHEN** `timeout("myTimer").new(1000, Symbol.for("onTick"))` is called
- **THEN** onTick is called every 1000ms

### Requirement: unLoadMember() SHALL unload member

The `unLoadMember()` function SHALL unload a cast member from memory.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "unLoadMember" in Chapter 12

**Parameters**:
- `member` Required. Member reference

#### Scenario: unLoadMember frees memory
- **WHEN** `unLoadMember(member(1))` is called
- **THEN** member is unloaded from memory

### Requirement: updateStage() SHALL update display

The `updateStage()` function SHALL update the stage display immediately.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "updateStage" in Chapter 12

**Parameters**: None

#### Scenario: updateStage refreshes display
- **WHEN** `updateStage()` is called
- **THEN** stage is redrawn immediately

### Requirement: value() SHALL parse string to value

The `value()` function SHALL convert a string to its corresponding value.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "value" in Chapter 12

**Parameters**:
- `string` Required. String to parse

**Returns**: Parsed value

#### Scenario: value parses number string
- **WHEN** `value("42")` is called
- **THEN** returns `42`

#### Scenario: value parses boolean string
- **WHEN** `value("TRUE")` is called
- **THEN** returns `true`

### Requirement: voidP() SHALL check for void type

The `voidP()` function SHALL check if a value is void/undefined.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "voidP" in Chapter 12

**Parameters**:
- `x` Required. Value to check

**Returns**: TRUE if void/undefined

#### Scenario: voidP returns true for undefined
- **WHEN** `voidP(undefined)` is called
- **THEN** returns `true`

#### Scenario: voidP returns false for value
- **WHEN** `voidP(42)` is called
- **THEN** returns `false`

### Requirement: xtra() SHALL return Xtra reference

The `xtra()` function SHALL return a reference to an Xtra.

**Reference**: `docs/drmx2004_scripting_ref.txt` - Search for "xtra" in Chapter 12

**Parameters**:
- `name` Required. Xtra name

**Returns**: Xtra instance (stub)

#### Scenario: xtra returns Xtra reference
- **WHEN** `xtra("FileIO")` is called
- **THEN** returns Xtra instance (stub implementation)
