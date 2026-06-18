## interpolateTo()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 19403-19431

### Usage
```lingo

```

### Description
3D transform method; modifiestransform1 by interpolating from the position and rotation
of transform1 to the position and rotation of a new transform by a specified percentage. The
original transform1 is changed. To interpolate a copy of transform1, use the interpolate()
function.
To interpolate by hand, multiply the difference of two numbers by the percentage. For example,
interpolation from 4 to 8 by 50 percent yields 6.

### Parameters
transform2 Required. Specifies the transform to which a given transform is interpolated.
percentage Required. Specifies the rotation percentage of transform2.

### Example
```lingo
In this example, tBox is the transform of the model named Box, and tSphere is the transform of
the model named Sphere. The third line of the example interpolates the transform of Box halfway
to the transform of Sphere.
tBox = member("3d world").model("Box").transform
tSphere = member("3d world").model("Sphere").transform
tBox.interpolateTo(tSphere, 50)
```

### See also
interpolate()

372

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/interpolateTo.js`
- **Test**: `apps/client/src/director/api/__tests__/interpolateTo.test.js`
- **Dependencies**: Various (depends on function)

