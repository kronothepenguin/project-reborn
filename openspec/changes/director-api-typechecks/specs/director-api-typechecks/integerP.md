## integerP()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 19330-19359

### Usage
```lingo

```

### Description
Function (Lingo only); indicates whether a specified expression can be evaluated to an integer
(1 or TRUE) or not (0 or FALSE). P in integerP stands for predicate.

### Parameters
expression Required. The expression to test.

### Example
```lingo
This statement checks whether the number 3 can be evaluated to an integer and then displays 1
(TRUE) in the Message window:
put(3).integerP
-- 1

The following statement checks whether the number 3 can be evaluated to an integer. Because 3
is surrounded by quotation marks, it cannot be evaluated to an integer, so 0 (FALSE) is displayed
in the Message window:
put("3").integerP
-- 0

This statement checks whether the numerical value of the string in field cast member Entry is an
integer and if it isn’t, displays an alert:
if field("Entry").value.integerP = FALSE then alert "Please enter an integer."
```

### See also
floatP(), integer(), ilk(), objectP(), stringP(), symbolP()

### Implementation
- **File**: `apps/client/src/director/api/integerP.js`
- **Test**: `apps/client/src/director/api/__tests__/integerP.test.js`
- **Dependencies**: None (pure function)

