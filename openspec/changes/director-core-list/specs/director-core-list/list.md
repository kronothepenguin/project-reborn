## list()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 19924-19965

### Usage
```lingo
list()
[]
list(stringValue1, stringValue2, ...)
[stringValue1, stringValue2, ...]
list();
list(stringValue1, stringValue2, ...);
```

### Description
Top level function; creates a linear list.
When creating a list using the syntax list(), with or without parameters, the index of list values
begins with 1.

list()

383

When creating a list using the syntax [], with or without parameters, the index of list values
begins with 0.
The maximum length of a single line of executable script is 256 characters. Large lists cannot be
created using list(). To create a list with a large amount of data, enclose the data in square
brackets ([]), put the data into a field, and then assign the field to a variable. The variable’s
content is a list of the data.

### Parameters
strigValue1, stringValue2 ... Optional. A list of strings that specify the initial values in

the list.

### Example
```lingo
This statement sets the variable named designers equal to a linear list that contains the names
Gee, Kayne, and Ohashi:
-- Lingo syntax
designers = list("Gee", "Kayne", "Ohashi") -- using list()
designers = ["Gee", "Kayne", "Ohashi"] -- using brackets
// JavaScript syntax
var designers = list("Gee", "Kayne", "Ohashi");
```

### See also
propList()

### Implementation
- **File**: `apps/client/src/director/core/list.js`
- **Test**: `apps/client/src/director/core/__tests__/list.test.js`
- **Dependencies**: None (part of List class)

