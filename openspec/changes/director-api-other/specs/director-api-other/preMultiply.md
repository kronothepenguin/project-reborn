## preMultiply

**Source**: `docs/drmx2004_scripting_ref.txt` lines 24191-24217

### Usage
```lingo

```

### Description
3D transform command; alters a transform by pre-applying the positional, rotational, and scaling
effects of another transform.
If transform2 describes a rotation of 90° about the X axis and transform1 describes a
translation of 100 units in the Y axis, transform1.multiply(transform2) will alter this
transform so that it describes a translation followed by a rotation. The statement
transform1.preMultiply(transform2) will alter this transform so that it describes a rotation
followed by a translation. The effect is that the order of operations is reversed.

### Parameters
transform2 Required. Specifies the transform from which effects are pre-applied to another

transform.

### Example
```lingo
This statement performs a calculation that applies the transform of the model Mars to the
transform of the model Pluto:
member("scene").model("Pluto").transform.preMultiply\
(member("scene").model("Mars").transform)

470

Chapter 12: Methods
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/preMultiply.js`
- **Test**: `apps/client/src/director/api/__tests__/preMultiply.test.js`
- **Dependencies**: Various (depends on function)

