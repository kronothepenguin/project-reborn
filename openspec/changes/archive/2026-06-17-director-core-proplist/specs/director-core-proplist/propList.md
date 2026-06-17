## propList()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 24462-24514

### Usage
```lingo
propList()
[:]
propList(string1, value1, string2, value2, ...)
propList(#symbol1, value1, #symbol2, value2, ...)
[#symbol1:value1, #symbol2:value2, ...]
propList();
propList(string1, value1, string2, value2, ...);
```

### Description
Top level function; creates a property list, where each element in the list consists of a name/value
pair.
When creating a property list using the syntax propList() or [:] (Lingo only), with or without
parameters, the index of list values begins with 1.
The maximum length of a single line of executable script is 256 characters. Large property lists
cannot be created using propList(). To create a property list with a large amount of data,
enclose the data in square brackets ([]), put the data into a field, and then assign the field to a
variable. The variable’s content is a list of the data.

### Parameters
string1, string2, ... Optional. Strings that specify the name portions of the elements in

the list.
value1, value2, ... Optional. Values that specify the value portions of the elements in the list.
#symbol1, #symbol2, ... (Lingo only) Optional. Symbols that represent the name portions of

the elements in the list.

### Example
```lingo
This statement creates a property list with various properties and values, and then displays the
various property values in the Message window:
-- Lingo syntax
-- using propList()
colorList = propList(#top,"red", #sides,"blue", #bottom,"green")
-- using brackets
colorList = [#top:"red", #sides:"blue", #bottom:"green"]
put(colorList.top) -- "red"
put(colorList.sides) -- "blue"
put(colorList.bottom) -- "green"
// JavaScript syntax
var colorList = propList("top","red", "sides","blue", "bottom","green");
put(colorList.top) // red
put(colorList.sides) // blue
put(colorList.bottom) // green
```

### See also
list()

476

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/core/prop-list.js`
- **Test**: `apps/client/src/director/core/__tests__/prop-list.test.js`
- **Dependencies**: None (part of PropList class)

