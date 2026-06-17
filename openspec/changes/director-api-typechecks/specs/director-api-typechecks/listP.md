## listP()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 19966-19988

### Usage
```lingo

```

### Description
Function; indicates whether a specified item is a list, rectangle, or point (1 or TRUE) or not
(0 or FALSE).

### Parameters
item Required. Specifies the item to test.

### Example
```lingo
This statement checks whether the list in the variable designers is a list, rectangle, or point, and
displays the result in the Message window:
put listP(designers)

The result is 1, which is the numerical equivalent of TRUE.
```

### See also
ilk(), objectP()

384

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/listP.js`
- **Test**: `apps/client/src/director/api/__tests__/listP.test.js`
- **Dependencies**: None (pure function)

