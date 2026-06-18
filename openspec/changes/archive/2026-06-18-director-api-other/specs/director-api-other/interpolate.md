## interpolate()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 19381-19402

### Usage
```lingo

```

### Description
3D transform method; returns a copy of transform1 created by interpolating from the position
and rotation of transform1 to the position and rotation of transform2 by the specified
percentage. The original transform1 is not affected. To interpolate transform1, use
interpolateTo().
To interpolate by hand, multiply the difference of two numbers by the percentage. For example,
interpolation from 4 to 8 by 50 percent yields 6.

### Parameters
None.

### Example
```lingo
In this example, tBox is the transform of the model named Box, and tSphere is the transform of
the model named Sphere. The third line of the example interpolates a copy of the transform of
Box halfway to the transform of Sphere.
tBox = member("3d world").model("Box").transform
tSphere = member("3d world").model("Sphere").transform
tNew = tBox.interpolate(tSphere, 50)
```

### See also
interpolateTo()

### Implementation
- **File**: `apps/client/src/director/api/interpolate.js`
- **Test**: `apps/client/src/director/api/__tests__/interpolate.test.js`
- **Dependencies**: Various (depends on function)

