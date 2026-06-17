## setProp

**Source**: `docs/drmx2004_scripting_ref.txt` lines 27593-27625

### Usage
```lingo

```

### Description
Command; in a list, replaces the value assigned to a specified property with a new value. If the list
does not contain the specified property, setProp returns a script error.
The setProp command works with property lists only. Using setProp with a linear list produces
a script error.

setProp

535

This command is similar to the setaProp command, except that setProp returns an error when
the property is not already in the list.

### Parameters
property Required. A symbol (Lingo only) or a string that specifies the property whose value is
replaced by newValue.
newValue Required. The new value for the property specified by property.

### Example
```lingo
This statement changes the value assigned to the age property of property list x to 11:
setProp x, #age, 11

Using the dot operator, you can alter the property value of a property already in a list, exactly as
above:
x.age = 11
```

### See also
setaProp

### Implementation
- **File**: `apps/client/src/director/api/setProp.js`
- **Test**: `apps/client/src/director/api/__tests__/setProp.test.js`
- **Dependencies**: Various (depends on function)

