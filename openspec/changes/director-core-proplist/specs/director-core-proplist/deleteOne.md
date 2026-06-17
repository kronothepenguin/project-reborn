## deleteOne

**Source**: `docs/drmx2004_scripting_ref.txt` lines 15034-15056

### Usage
```lingo

```

### Description
List command; deletes a value from a linear or property list. For a property list, deleteOne also
deletes the property associated with the deleted value. If the value appears in the list more than
once, deleteOne deletes only the first occurrence.
Attempting to delete a property has no effect.

### Parameters
value Required. The value to delete from the list.

### Example
```lingo
The first statement creates a list consisting of the days Tuesday, Wednesday, and Friday. The
second statement deletes the name Wednesday from the list.
days = ["Tuesday", "Wednesday", "Friday"]
days.deleteOne("Wednesday")
put days

The put days statement causes the Message window to display the result:
-- ["Tuesday", "Friday"].
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/core/prop-list.js`
- **Test**: `apps/client/src/director/core/__tests__/prop-list.test.js`
- **Dependencies**: None (part of PropList class)

