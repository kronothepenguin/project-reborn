## getOne()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 17439-17467

### Usage
```lingo

```

### Description
List function; identifies the position (linear list) or property (property list) associated with a value
in a list.
For values contained in the list more than once, only the first occurrence is displayed. The
getOne command returns the result 0 when the specified value is not in the list.
When used with linear lists, the getOne command performs the same functions as the
getPos command.

### Parameters
value Required. Specifies the value associated with the position or property.

### Example
```lingo
This statement identifies the position of the value 12 in the linear list Answers, which consists of
[10, 12, 15, 22]:
put Answers.getOne(12)

The result is 2, because 12 is the second value in the list.
This statement identifies the property associated with the value 12 in the property list Answers,
which consists of [#a:10, #b:12, #c:15, #d:22]:
put Answers.getOne(12)

The result is #b, which is the property associated with the value 12.
```

### See also
getPos()

### Implementation
- **File**: `apps/client/src/director/core/list.js`
- **Test**: `apps/client/src/director/core/__tests__/list.test.js`
- **Dependencies**: None (part of List class)

