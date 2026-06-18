## bitNot()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 12540-12573

### Usage
```lingo

```

### Description
Function (Lingo only); converts the specified integer to a 32-bit binary number and reverses the
value of each binary digit, replacing 1’s with 0’s and 0’s with 1’s. The result is the new binary
number, which Lingo displays as a base 10 integer.
Integer

Binary number

1

00000000000000000000000000000001

Result
-2

11111111111111111111111111111110

In JavaScript syntax, use the bitwise operator "~".

### Parameters
None.

### Example
```lingo
This statement inverts the binary representation of the integer 1 and returns a new number.
put (1).bitNot
-- -2
```

### See also
bitAnd(), bitOr(), bitXor()

### Implementation
- **File**: `apps/client/src/director/api/bitNot.js`
- **Test**: `apps/client/src/director/api/__tests__/bitNot.test.js`
- **Dependencies**: None (pure function)

