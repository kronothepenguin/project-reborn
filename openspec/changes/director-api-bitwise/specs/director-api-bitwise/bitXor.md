## bitXor()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 12616-12657

### Usage
```lingo

```

### Description
Function; converts the two specified integers to 32-bit binary numbers and returns a binary
number whose digits are 1’s in the positions where the given numbers’ digits do not match, and
0’s in the positions where the digits are the same. The result is the new binary number, which
Lingo displays as a base 10 integer.
Integer

Binary number (abbreviated)

5

0101

6

0110

Result
3

0011

In JavaScript syntax, use the bitwise operator "^".

### Parameters
integer1 Required. The first integer.
integer2 Required. The second integer.

### Example
```lingo
This statement compares the 32-bit binary versions of 5 and 6 and returns the result as an integer:
put bitXor(5, 6)
-- 3
```

### See also
bitNot(), bitOr(), bitAnd()

bitXor()

245

### Implementation
- **File**: `apps/client/src/director/api/bitXor.js`
- **Test**: `apps/client/src/director/api/__tests__/bitXor.test.js`
- **Dependencies**: None (pure function)

