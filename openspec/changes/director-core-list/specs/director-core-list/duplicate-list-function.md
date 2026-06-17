## duplicate() (list function)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 15435-15456

### Usage
```lingo

```

### Description
List function; returns a copy of a list and copies nested lists (list items that also are lists) and their
contents. The function is useful for saving a list’s current content.
When you assign a list to a variable, the variable contains a reference to the list, not the list itself.
This means any changes to the copy also affect the original list.
To see an example of duplicate() (list function) used in a completed movie, see the Vector
Shapes movie in the Learning/Lingo folder inside the Director application folder.

### Parameters
oldList Required. Specifies the list to duplicate.

### Example
```lingo
This statement makes a copy of the list CustomersToday and assigns it to the variable
CustomerRecord:
CustomerRecord = CustomersToday.duplicate()
```

### See also
image()

### Implementation
- **File**: `apps/client/src/director/core/list.js`
- **Test**: `apps/client/src/director/core/__tests__/list.test.js`
- **Dependencies**: None (part of List class)

