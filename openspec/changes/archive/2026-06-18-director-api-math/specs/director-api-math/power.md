## power()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 23944-23957

### Usage
```lingo

```

### Description
Math function; calculates the value of a specified number to a specified exponent.

### Parameters
base Required. Specifies the base number.
exponent Required. Specifies the exponent value.

### Example
```lingo
This statement sets the variable vResult to the value of 4 to the third power:
set vResult = power(4,3)
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/power.js`
- **Test**: `apps/client/src/director/api/__tests__/power.test.js`
- **Dependencies**: None (pure function)

