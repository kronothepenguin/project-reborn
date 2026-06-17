## sin()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 27963-27984

### Usage
```lingo

```

### Description
Math function (Lingo only); calculates the sine of the specified angle. The angle must be
expressed in radians as a floating-point number.
In JavaScript syntax, use the Math object’s sin() function.

### Parameters
angle Required. Specifies the angle.

### Example
```lingo
This statement calculates the sine of pi/2:
put sin (PI/2.0)
-- 1
```

### See also
PI

sin()

543

### Implementation
- **File**: `apps/client/src/director/api/sin.js`
- **Test**: `apps/client/src/director/api/__tests__/sin.test.js`
- **Dependencies**: None (pure function)

