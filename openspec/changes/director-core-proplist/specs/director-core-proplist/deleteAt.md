## deleteAt

**Source**: `docs/drmx2004_scripting_ref.txt` lines 14814-14847

### Usage
```lingo

```

### Description
List command; deletes an from a linear or property list.
The deleteAt command checks whether an item is in a list; if you try to delete an object that
isn’t in the list, Director displays an alert.

### Parameters
number Required. Specifies the position of the item in the list to delete.

### Example
```lingo
This statement deletes the second item from the list named designers, which contains [gee,
kayne, ohashi]:
designers = ["gee", "kayne", "ohashi"]
designers.deleteAt(2)

The result is the list [gee, ohashi].
This handler checks whether an object is in a list before attempting to delete it:
on myDeleteAt theList, theIndex
if theList.count < theIndex then
beep
else
theList.deleteAt(theIndex)
end if
end
```

### See also
addAt

286

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/core/prop-list.js`
- **Test**: `apps/client/src/director/core/__tests__/prop-list.test.js`
- **Dependencies**: None (part of PropList class)

