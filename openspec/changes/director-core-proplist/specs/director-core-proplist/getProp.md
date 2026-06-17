## getProp()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 17728-17754

### Usage
```lingo

```

### Description
Property list function; identifies the value associated with a property in a property list.
Almost identical to the getaProp command, the getProp command displays an error message if
the specified property is not in the list or if you specify a linear list.

### Parameters
list Required. Specifies the property list from which property is retrieved.
property Required. Specifies the property with which the identified value is associated.

getProp()

343

### Example
```lingo
This statement identifies the value associated with the property #c in the property list Answers,
which consists of [#a:10, #b:12, #c:15, #d:22]:
getProp(Answers, #c)

The result is 15, because 15 is the value associated with #c.
```

### See also
getOne()

### Implementation
- **File**: `apps/client/src/director/core/prop-list.js`
- **Test**: `apps/client/src/director/core/__tests__/prop-list.test.js`
- **Dependencies**: None (part of PropList class)

