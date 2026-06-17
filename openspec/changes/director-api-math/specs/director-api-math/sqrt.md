## sqrt()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 28096-28124

### Usage
```lingo

```

### Description
Math function (Lingo only); returns the square root of a specified number.
The value must be a decimal number greater than 0. Negative values return 0.
In JavaScript syntax, use the Math object’s sqrt() function.

### Parameters
number Required. Specifies the number. This number is either a floating-point number or an

integer rounded to the nearest integer.

### Example
```lingo
This statement displays the square root of 3.0 in the Message window:
put sqrt(3.0)
-- 1.7321

This statement displays the square root of 3 in the Message window:
put sqrt(3)
-- 2
```

### See also
floatPrecision

546

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/sqrt.js`
- **Test**: `apps/client/src/director/api/__tests__/sqrt.test.js`
- **Dependencies**: None (pure function)

