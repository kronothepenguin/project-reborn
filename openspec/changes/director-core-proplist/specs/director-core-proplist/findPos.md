## findPos

**Source**: `docs/drmx2004_scripting_ref.txt` lines 16259-16281

### Usage
```lingo

```

### Description
List command; identifies the position of a property in a property list.
Using findPos with linear lists returns a bogus number if the value of property is a number and
a script error if the value of property is a string.
The findPos command performs the same function as the findPosNear command, except that
findPos is VOID when the specified property is not in the list.

### Parameters
property Required. The property whose position is identified.

### Example
```lingo
This statement identifies the position of the property c in the list Answers, which consists of
[#a:10, #b:12, #c:15, #d:22]:
Answers.findPos(#c)

The result is 3, because c is the third property in the list.
```

### See also
findPosNear, sort

### Implementation
- **File**: `apps/client/src/director/core/prop-list.js`
- **Test**: `apps/client/src/director/core/__tests__/prop-list.test.js`
- **Dependencies**: None (part of PropList class)

