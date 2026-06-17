## inverse()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 19449-19476

### Usage
```lingo

```

### Description
3D transform method; returns a copy of the transform with its position and rotation
properties inverted.
This method does not change the original transform. To invert the original transform, use the
invert() function.

### Parameters
None.

### Example
```lingo
This statement inverts a copy of the transform of the model named Chair:
boxInv = member("3d world").model("Chair").transform.inverse()
```

### See also
invert()

inverse()

373

### Implementation
- **File**: `apps/client/src/director/api/inverse.js`
- **Test**: `apps/client/src/director/api/__tests__/inverse.test.js`
- **Dependencies**: Various (depends on function)

