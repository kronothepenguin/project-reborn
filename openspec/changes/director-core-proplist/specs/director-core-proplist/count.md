## count()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 14057-14091

### Usage
```lingo
list.count
object.count
list.count;
object.count;
```

### Description
Function; returns the number of entries in a linear or property list, the number of properties in a
parent script without counting the properties in an ancestor script, or the chunks of a text
expression such as characters, lines, or words.
The count command works with linear and property lists, objects created with parent scripts, and
the globals property.
To see an example of count() used in a completed movie, see the Text movie in the Learning/
Lingo folder inside the Director application folder.

### Parameters
None.

274

Chapter 12: Methods

### Example
```lingo
This statement displays the number 3, the number of entries:
--Lingo syntax
put([10,20,30].count) -- 3
// JavaScript syntax
put(list(10,20,30).count); // 3
```

### See also
globals

### Implementation
- **File**: `apps/client/src/director/core/prop-list.js`
- **Test**: `apps/client/src/director/core/__tests__/prop-list.test.js`
- **Dependencies**: None (part of PropList class)

