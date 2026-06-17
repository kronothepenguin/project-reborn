## deleteProp

**Source**: `docs/drmx2004_scripting_ref.txt` lines 15057-15087

### Usage
```lingo

```

### Description
List command; deletes the specified item from the specified list.

• For linear lists, replace item with the number identifying the list position of the item to be
deleted. The deleteProp command for linear lists is the same as the deleteAt command. If
the number is greater than the number of items in the list, a script error occurs.
• For property lists, replace item with the name of the property to be deleted. Deleting a
property also deletes its associated value. If the list has more than one of the same property,
only the first property in the list is deleted.

### Parameters
item Required. The item to delete from the list.

### Example
```lingo
This statement deletes the color property from the list [#height:100, #width: 200, #color: 34,
#ink: 15], which is called spriteAttributes:
spriteAttributes.deleteProp(#color)

The result is the list [#height:100, #width: 200, #ink: 15].

deleteProp

291
```

### See also
deleteAt

### Implementation
- **File**: `apps/client/src/director/core/prop-list.js`
- **Test**: `apps/client/src/director/core/__tests__/prop-list.test.js`
- **Dependencies**: None (part of PropList class)

