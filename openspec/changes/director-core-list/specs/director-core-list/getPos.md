## getPos()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 17671-17696

### Usage
```lingo

```

### Description
List function; identifies the position of a value in a list. When the specified value is not in the list,
the getPos command returns the value 0.
For values contained in the list more than once, only the first occurrence is displayed. This
command performs the same function as the getOne command when used for linear lists.

### Parameters
value Required. Specifies the value associated with the position.

### Example
```lingo
This statement identifies the position of the value 12 in the list Answers, which consists of [#a:10,
#b:12, #c:15, #d:22]:
put Answers.getPos(12)

The result is 2, because 12 is the second value in the list.
```

### See also
getOne()

342

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/core/list.js`
- **Test**: `apps/client/src/director/core/__tests__/list.test.js`
- **Dependencies**: None (part of List class)

