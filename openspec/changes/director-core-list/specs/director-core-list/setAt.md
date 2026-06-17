## setAt

**Source**: `docs/drmx2004_scripting_ref.txt` lines 27186-27226

### Usage
```lingo

```

### Description
Command; replaces the item specified by orderNumber with the value specified by value in the
list specified by list. When orderNumber is greater than the number of items in a property list,
the setAt command returns a script error. When orderNumber is greater than the number of
items in a linear list, Director expands the list’s blank entries to provide the number of places
specified by orderNumber.

### Parameters
None.

### Example
```lingo
This handler assigns a name to the list [12, 34, 6, 7, 45], replaces the fourth item in the list with
the value 10, and then displays the result in the Message window:
on enterFrame
set vNumbers = [12, 34, 6, 7, 45]
setAt vnumbers, 4, 10
put vNumbers
end enterFrame

setAt

527

When the handler runs, the Message window displays the following:
[12, 34, 6, 10, 45]

You can perform this same operation may be done using bracket access to the list in the
following manner:
on enterFrame
set vNumbers = [12, 34, 6, 7, 45]
vnumbers[4] = 10
put vNumbers
end enterFrame

When the handler runs, the Message window displays the following:
[12, 34, 6, 10, 45]
```

### See also
[ ] (bracket access)

### Implementation
- **File**: `apps/client/src/director/core/list.js`
- **Test**: `apps/client/src/director/core/__tests__/list.test.js`
- **Dependencies**: None (part of List class)

