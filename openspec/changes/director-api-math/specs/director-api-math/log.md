## log()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 20080-20100

### Usage
```lingo

```

### Description
Math function (Lingo only); calculates the natural logarithm of a specified number.
In JavaScript syntax, use the Math object’s log() function.

### Parameters
number Required. A number from which the natural logarithm is calculated. This number must

be a decimal number greater than 0.

### Example
```lingo
This statement assigns the natural logarithm of 10.5 to the variable Answer.
Answer = log(10.5)

This statement calculates the natural logarithm of the square root of the value Number and then
assigns the result to the variable Answer:
Answer = log(Number.sqrt)
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/log.js`
- **Test**: `apps/client/src/director/api/__tests__/log.test.js`
- **Dependencies**: None (pure function)

