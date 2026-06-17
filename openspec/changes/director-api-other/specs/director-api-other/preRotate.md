## preRotate

**Source**: `docs/drmx2004_scripting_ref.txt` lines 24218-24281

### Usage
```lingo

```

### Description
3D transform command; applies a rotation before the current positional, rotational, and scale
offsets held by the referenced transform object. The rotation may be specified as a set of three
angles, each of which specify an angle of rotation about the three corresponding axes. These
angles may be specified explicitly in the form of xAngle, yAngle, and zAngle, or by a vector,
where the x component of the vector corresponds to the rotation about the x-axis, the y about the
y-axis, and the z about the z-axis.
Alternatively, the rotation may also be specified as a rotation about an arbitrary axis. This axis is
defined in space by positionVector and directionVector. The amount of rotation about this
axis is specified by angle.
Node may be a reference to a model, group, light, or camera

### Parameters
xAngle Required if applying a rotation using x-, y-, and z-axes. Specifies the angle of rotation
around the x-axis.
yAngle Required if applying a rotation using x-, y-, and z-axes. Specifies the angle of rotation
around the y-axis.
zAngle Required if applying a rotation using x-, y-, and z-axes. Specifies the angle of rotation
around the z-axis.
vector Required if applying a rotation using a vector. Specifies the vector whose angles are used
in the rotation.
positionVector Required if applying a rotation about an arbitrary axis. Specifies the

position offset.
directionVector Required if applying a rotation about an arbitrary axis. Specifies the

direction offset.
angle Required if applying a rotation about an arbitrary axis. Specifies the amount of rotation
about an arbitrary axis.

### Example
```lingo
The following statement performs a rotation of 20° about each axis. Since the model’s transform
property is its position, rotation, and scale offsets relative to that model’s parent, and preRotate
applies the change in orientation prior to any existing effects of that model's transform, this will
rotate the model in place rather than orbiting around its parent.
member("scene").model("bip01").transform.preRotate(20, 20, 20)

preRotate

471

The above is equivalent to:
member("scene").model("bip01").rotate(20,20,20).

Generally preRotate() is only useful when dealing with transform variables. This line will orbit
the camera about the point (100, 0, 0) in space, around the y axis, by 180°.
t = transform()
t.position = member("scene").camera[1].transform.position
t.preRotate(vector(100, 0, 0), vector(0, 1, 0), 180)
member("scene").camera[1].transform = t
```

### See also
rotate

### Implementation
- **File**: `apps/client/src/director/api/preRotate.js`
- **Test**: `apps/client/src/director/api/__tests__/preRotate.test.js`
- **Dependencies**: Various (depends on function)

