## getPropAt()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 17755-17773

### Usage
```lingo

```

### Description
Property list function; for property lists only, identifies the property name associated with a
specified position in a property list. If the specified item isn’t in the list, or if you use
getPropAt() with a linear list, a script error occurs.

### Parameters
index Required. Specifies the index position of the property in the property list.

### Example
```lingo
This statement displays the second property in the given list:
put Answers.getPropAt(2)
-- #b

The result is 20, which is the value associated with #b.
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/core/prop-list.js`
- **Test**: `apps/client/src/director/core/__tests__/prop-list.test.js`
- **Dependencies**: None (part of PropList class)

