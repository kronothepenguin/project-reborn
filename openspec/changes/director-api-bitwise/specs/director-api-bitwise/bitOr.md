## bitOr()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 12574-12615

### Usage
```lingo

```

### Description
Function (Lingo only); converts the two specified integers to 32-bit binary numbers and returns a
binary number whose digits are 1’s in the positions where either number had a 1, and 0’s in every
other position. The result is the new binary number, which Lingo displays as a base 10 integer.
Integer

Binary number (abbreviated)

5

0101

6

0110

Result
7

0111

In JavaScript syntax, use the bitwise operator "|".

244

Chapter 12: Methods

### Parameters
integer1 Required. The first integer.
integer2 Required. The second integer.

### Example
```lingo
This statement compares the 32-bit binary versions of 5 and 6 and returns the result as an integer:
put bitOr(5, 6)
-- 7
```

### See also
bitNot(), bitAnd(), bitXor()

### Implementation
- **File**: `apps/client/src/director/api/bitOr.js`
- **Test**: `apps/client/src/director/api/__tests__/bitOr.test.js`
- **Dependencies**: None (pure function)

