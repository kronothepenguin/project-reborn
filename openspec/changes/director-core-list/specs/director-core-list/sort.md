## sort

**Source**: `docs/drmx2004_scripting_ref.txt` lines 27985-28009

### Usage
```lingo

```

### Description
Command; puts list items into alphanumeric order.

• When the list is a linear list, the list is sorted by values.
• When the list is a property list, the list is sorted alphabetically by properties.
After a list is sorted, it maintains its sort order even when you add new variables using the
add command.

### Parameters
None.

### Example
```lingo
The following statement puts the list Values, which consists of [#a: 1, #d: 2, #c: 3], into
alphanumeric order. The result appears below the statement.
put values
-- [#a: 1, #d: 2, #c: 3]
values.sort()
put values
--[#a: 1, #c: 3, #d: 2]
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/core/list.js`
- **Test**: `apps/client/src/director/core/__tests__/list.test.js`
- **Dependencies**: None (part of List class)

