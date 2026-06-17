## append

**Source**: `docs/drmx2004_scripting_ref.txt` lines 12300-12325

### Usage
```lingo

```

### Description
List command; for linear lists only, adds the specified value to the end of a linear list. This differs
from the add command, which adds a value to a sorted list according to the list’s order.
This command returns a script error when used with a property list.
Properties
value Required. The value to add to the end of the linear list.

### Parameters
None.

### Example
```lingo
This statement adds the value 2 at the end of the sorted list named bids, which contains [1, 3, 4],
even though this placement does not match the list’s sorted order:
set bids = [1, 3, 4]
bids.append(2)

The resulting value of bids is [1, 3, 4, 2].
```

### See also
add (3D texture), sort

append

239

### Implementation
- **File**: `apps/client/src/director/core/list.js`
- **Test**: `apps/client/src/director/core/__tests__/list.test.js`
- **Dependencies**: None (part of List class)

