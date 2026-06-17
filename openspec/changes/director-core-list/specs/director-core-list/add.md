## add

**Source**: `docs/drmx2004_scripting_ref.txt` lines 11854-11889

### Usage
```lingo
linearList.add(value)
array.push(value)
```

### Description
List command; for linear lists only, adds a value to a linear list. For a sorted list, the value is placed
in its proper order. For an unsorted list, the value is added to the end of the list.
This command returns an error when used on a property list.
Note: Don’t confuse the add command with the + operator used for addition or the & operator used to
concatenate strings.

### Parameters
value Required. A value to add to the linear list.

### Example
```lingo
These statements add the value 2 to the list named bids. The resulting list is [3, 4, 1, 2].
-- Lingo syntax
bids = [3, 4, 1]
bids.add(2)
// JavaScript syntax
bids = new Array(3,4,1);
bids.push(2);

This statement adds 2 to the sorted linear list [1, 4, 5]. The new item remains in alphanumeric
order because the list is sorted.
-- Lingo syntax
bids.add(2)
// JavaScript syntax
bids.push(2);
// to sort the list using JavaScript syntax
bids.sort();
```

### See also
sort

### Implementation
- **File**: `apps/client/src/director/core/list.js`
- **Test**: `apps/client/src/director/core/__tests__/list.test.js`
- **Dependencies**: None (part of List class)

