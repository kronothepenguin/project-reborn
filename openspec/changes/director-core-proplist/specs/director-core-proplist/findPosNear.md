## findPosNear

**Source**: `docs/drmx2004_scripting_ref.txt` lines 16282-16311

### Usage
```lingo

```

### Description
List command; for sorted lists only, identifies the position of an item in a specified sorted list.
The findPosNear command works only with sorted lists. Replace valueOrProperty with a
value for sorted linear lists, and with a property for sorted property lists.

314

Chapter 12: Methods

The findPosNear command is similar to the findPos command, except that when the specified
property is not in the list, the findPosNear command identifies the position of the value with the
most similar alphanumeric name. This command is useful in finding the name that is the closest
match in a sorted directory of names.

### Parameters
valueOrProperty Required. The value or property whose position is identified.

### Example
```lingo
This statement identifies the position of a property in the sorted list Answers, which consists of
[#Nile:2, #Pharaoh:4, #Raja:0]:
Answers.findPosNear(#Ni)

The result is 1, because Ni most closely matches Nile, the first property in the list.
```

### See also
findPos

### Implementation
- **File**: `apps/client/src/director/core/prop-list.js`
- **Test**: `apps/client/src/director/core/__tests__/prop-list.test.js`
- **Dependencies**: None (part of PropList class)

