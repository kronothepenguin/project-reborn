## integer()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 19303-19329

### Usage
```lingo

```

### Description
Function (Lingo only); rounds the value of an expression to the nearest whole integer.
You can force an integer to be a string by using the string() function.
In JavaScript syntax, use the parseInt() function.

### Parameters
numericExpression Required. The number to round to an integer.

### Example
```lingo
This statement rounds off the number 3.75 to the nearest whole integer:
put integer(3.75)
-- 4

The following statement rounds off the value in parentheses. This provides a usable value for the
locH sprite property, which requires an integer:
sprite(1).locH = integer(0.333 * stageWidth)
```

### See also
float(), string()

370

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/integer.js`
- **Test**: `apps/client/src/director/api/__tests__/integer.test.js`
- **Dependencies**: None (pure function)

