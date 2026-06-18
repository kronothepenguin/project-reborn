## bitAnd()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 12498-12539

### Usage
```lingo

```

### Description
Function (Lingo only); converts the two specified integers to 32-bit binary numbers and returns a
binary number whose digits are 1’s in the positions where both numbers had a 1, and 0’s in every
other position. The result is the new binary number, which Lingo displays as a base 10 integer.
Integer

Binary number (abbreviated)

6

00110

7

00111

Result
6

00110

In JavaScript syntax, use the bitwise operator "&".

### Parameters
integer1 Required. The first integer.
integer2 Required. The second integer.

### Example
```lingo
This statement compares the binary versions of the integers 6 and 7 and returns the result as an
integer:
put bitAnd(6, 7)
-- 6
```

### See also
bitNot(), bitOr(), bitXor()

bitAnd()

243

### Implementation
- **File**: `apps/client/src/director/api/bitAnd.js`
- **Test**: `apps/client/src/director/api/__tests__/bitAnd.test.js`
- **Dependencies**: None (pure function)

