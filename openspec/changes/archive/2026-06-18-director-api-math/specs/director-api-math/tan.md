## tan()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 28752-28770

### Usage
```lingo

```

### Description
Math function; yields the tangent of the specified angle expressed in radians as a floating-point
number.
In JavaScript syntax, use the Math object’s tan() function.

### Parameters
angle Required. Specifies the angle from which a tangent is yielded.

### Example
```lingo
The following function yields the tangent of pi/4:
tan (PI/4.0) = 1

The π symbol cannot be used in a Lingo expression.
```

### See also
PI

### Implementation
- **File**: `apps/client/src/director/api/tan.js`
- **Test**: `apps/client/src/director/api/__tests__/tan.test.js`
- **Dependencies**: None (pure function)

