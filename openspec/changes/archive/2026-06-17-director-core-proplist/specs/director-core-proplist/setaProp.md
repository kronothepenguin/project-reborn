## setaProp

**Source**: `docs/drmx2004_scripting_ref.txt` lines 27136-27185

### Usage
```lingo

```

### Description
Command; replaces the value assigned to listProperty with the value specified by newValue.
The setaProp command works with property lists and child objects. Using setaProp with a
linear list produces a script error.

• For property lists, setaProp replaces a property in the list specified by list. When the
property isn’t already in the list, Lingo adds the new property and value.

• For child objects, setaProp replaces a property of the child object. When the property isn’t
already in the object, Lingo adds the new property and value.

526

Chapter 12: Methods

• The setaProp command can also set ancestor properties.

### Parameters
listProperty Required. A symbol (Lingo only) or a string that specifies the name of the
property whose value is changing.
newValue Required. The new value for the listProperty property.

### Example
```lingo
These statements create a property list and then adds the item #c:10 to the list:
newList = [#a:1, #b:5]
put newList
-- [#a:1, #b:5]
setaProp newList, #c, 10
put newList

Using the dot operator, you can alter the property value of a property already in a list without
using setaProp:
newList = [#a:1, #b:5]
put newList
-- [#a:1, #b:5]
newList.b = 99
put newList
-- [#a:1, #b:99]
Note: To use the dot operator to manipulate a property, the property must already exist in the list,
child object, or behavior.
```

### See also
ancestor, property, . (dot operator)

### Implementation
- **File**: `apps/client/src/director/core/prop-list.js`
- **Test**: `apps/client/src/director/core/__tests__/prop-list.test.js`
- **Dependencies**: None (part of PropList class)

