## cos()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 14038-14056

### Usage
```lingo

```

### Description
Function (Lingo only); calculates the cosine of the specified angle, which must be expressed
in radians.
In JavaScript syntax, use the Math object’s cos() function.

### Parameters
angle Required. An integer that specifies the angle to test.

### Example
```lingo
The following statement calculates the cosine of PI divided by 2 and displays it in the
Message window:
put (PI/2).cos
```

### See also
atan(), PI, sin()

### Implementation
- **File**: `apps/client/src/director/api/cos.js`
- **Test**: `apps/client/src/director/api/__tests__/cos.test.js`
- **Dependencies**: None (pure function)

