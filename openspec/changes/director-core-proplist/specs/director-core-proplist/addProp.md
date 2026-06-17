## addProp

**Source**: `docs/drmx2004_scripting_ref.txt` lines 12152-12187

### Usage
```lingo

```

### Description
Property list command; for property lists only, adds a specified property and its value to a
property list.
For an unsorted list, the value is added to the end of the list. For a sorted list, the value is placed in
its proper order.
If the property already exists in the list, both Lingo and JavaScript syntax create a duplicate
property. You can avoid duplicate properties by using the setaProp() command to change the
new entry’s property.
This command returns an error when used with a linear list.

### Parameters
property Required. The property to add to the list.
value Required. The value of the property to add to the list.

### Example
```lingo
This statement adds the property named kayne and its assigned value 3 to the property list
named bids, which contains [#gee: 4, #ohasi: 1]. Because the list is sorted, the new entry is
placed in alphabetical order:
bids.addProp(#kayne, 3)

The result is the list [#gee: 4, #kayne: 3, #ohasi: 1].
This statement adds the entry kayne: 7 to the list named bids, which now contains [#gee: 4,
#kayne: 3, #ohasi: 1]. Because the list already contains the property kayne, Lingo creates a
duplicate property:
bids.addProp(#kayne, 7)

The result is the list [#gee: 4, #kayne: 3, #kayne: 7, #ohasi: 1].

236

Chapter 12: Methods
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/core/prop-list.js`
- **Test**: `apps/client/src/director/core/__tests__/prop-list.test.js`
- **Dependencies**: None (part of PropList class)

