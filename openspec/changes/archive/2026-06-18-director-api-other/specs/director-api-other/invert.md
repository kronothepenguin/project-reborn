## invert()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 19477-19499

### Usage
```lingo

```

### Description
3D transform method; inverts the position and rotation properties of the transform.
This method changes the original transform. To invert a copy of the original transform, use the
inverse() function.

### Parameters
None.

### Example
```lingo
This statement inverts the transform of the model Box:
member("3d world").model("Box").transform.invert()
```

### See also
inverse()

### Implementation
- **File**: `apps/client/src/director/api/invert.js`
- **Test**: `apps/client/src/director/api/__tests__/invert.test.js`
- **Dependencies**: Various (depends on function)

