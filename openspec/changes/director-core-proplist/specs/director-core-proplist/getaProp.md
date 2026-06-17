## getaProp

**Source**: `docs/drmx2004_scripting_ref.txt` lines 16768-16814

### Usage
```lingo

```

### Description
List command; for linear and property lists, identifies the value associated with the item specified
by item, listPosition, or propertyName in the list specified by list.

• When the list is a linear list, replace item with the number for an item’s position in a list as
shown by listPosition. The result is the value at that position.
• When the list is a property list, replace item with a property in the list as in propertyName.
The result is the value associated with the property.
The getaProp command returns VOID when the specified value is not in the list.
When used with linear lists, the getaProp command has the same function as the
getAt command.

### Parameters
itemNameOrNum Required. For linear lists, an integer that specifies the index position of the value
in the list to return; for property lists, a symbol (Lingo) or a string (JavaScript syntax) that
specifies the property whose value is returned.

### Example
```lingo
This statement identifies the value associated with the property #joe in the property list ages,
which consists of [#john:10, #joe:12, #cheryl:15, #barbara:22]:
put getaProp(ages, #joe)

The result is 12, because this is the value associated with the property #joe.
The same result can be achieved using bracket access on the same list:
put ages[#joe]

The result is again 12.
If you want the value at a certain position in the list, you can also use bracket access. To get the
third value in the list, associated with the third property, use this syntax:
put ages[3]
-- 15
Note: Unlike the getAProp command where VOID is returned when a property doesn’t exist, a script
error will occur if the property doesn’t exist when using bracket access.
```

### See also
getAt, getOne(), getProp(), setaProp, setAt

getaProp

325

### Implementation
- **File**: `apps/client/src/director/core/prop-list.js`
- **Test**: `apps/client/src/director/core/__tests__/prop-list.test.js`
- **Dependencies**: None (part of PropList class)

