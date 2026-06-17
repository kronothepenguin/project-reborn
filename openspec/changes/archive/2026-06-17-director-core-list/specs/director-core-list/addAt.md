## addAt

**Source**: `docs/drmx2004_scripting_ref.txt` lines 11922-11945

### Usage
```lingo

```

### Description
List command; for linear lists only, adds a value at a specified position in the list.
This command returns an error when used with a property list.

### Parameters
position Required. An integer that specifies the position in the list to which the value specified
by value is added.
value Required. A value to add to the list.

### Example
```lingo
This statement adds the value 8 to the fourth position in the list named bids, which is
[3, 2, 4, 5, 6, 7]:
bids = [3, 2, 4, 5, 6, 7]
bids.addAt(4,8)

The resulting value of bids is [3, 2, 4, 8, 5, 6, 7].

addAt

231
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/core/list.js`
- **Test**: `apps/client/src/director/core/__tests__/list.test.js`
- **Dependencies**: None (part of List class)

