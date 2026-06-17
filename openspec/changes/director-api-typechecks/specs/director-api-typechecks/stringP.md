## stringP()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 28556-28578

### Usage
```lingo

```

### Description
Function; determines whether an expression is a string (TRUE) or not (FALSE).
The P in stringP stands for predicate.

### Parameters
expression Required. The expression to test.

### Example
```lingo
This statement checks whether 3 is a string:
put stringP("3")

The result is 1, which is the numeric equivalent of TRUE.
This statement checks whether the floating-point number 3.0 is a string:
put stringP(3.0)

Because 3.0 is a floating-point number and not a string, the result is 0, which is the numeric
equivalent of FALSE.
```

### See also
floatP(), ilk(), integerP(), objectP(), symbolP()

### Implementation
- **File**: `apps/client/src/director/api/stringP.js`
- **Test**: `apps/client/src/director/api/__tests__/stringP.test.js`
- **Dependencies**: None (pure function)

