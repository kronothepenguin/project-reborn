## float()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 16384-16416

### Usage
```lingo

```

### Description
Function (Lingo only); converts an expression to a floating-point number. The number of digits
that follow the decimal point (for display purposes only, calculations are not affected) is set using
the floatPrecision property.
In JavaScript syntax, use the parseFloat() function.

### Parameters
expression Required. The expression to convert to a floating-point number.

### Example
```lingo
This statement converts the integer 1 to the floating-point number 1:
put (1).float
-- 1.0

Math operations can be performed using float; if any of the terms is a float value, the entire
operation is performed with float:
"the floatPrecision = 1
put 2 + 2
-- 4
put (2).float + 2
-- 4.0
the floatPrecision = 4
put 22/7
-- 3
put (22).float / 7
-- 3.1429"
```

### See also
floatPrecision, ilk()

### Implementation
- **File**: `apps/client/src/director/api/float.js`
- **Test**: `apps/client/src/director/api/__tests__/float.test.js`
- **Dependencies**: None (pure function)

