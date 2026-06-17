## scale (command)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 26696-26745

### Usage
```lingo

```

### Description
3D transform command; applies a scaling after the current positional, rotational, and scale offsets
held by a referenced node’s transform or the directly referenced transform. The scaling must be
specified as either a set of three scalings along the corresponding axes or as a single scaling to be
applied uniformly along all axes. You can specify the individual scalings using the xScale, yScale
and zScale parameters, otherwise you can specify the uniform scaling amount using the
uniformScale parameter.
A node can be a camera, group, light or model object. Using the scale command adjusts the
referenced node’s transform.scale property, but it does not have any visual effect on lights or
cameras as they do not contain geometry.
The scaling values provided must be greater than zero.

scale (command)

517

### Parameters
xScale Required if specifying three scalings. Specifies the scale along the x-axis.
yScale Required if specifying three scalings. Specifies the scale along the y-axis.
zScale Required if specifying three scalings. Specifies the scale along the z-axis.
uniformScale Required if specifying a single, uniform scaling. Specifies the uniform scaling.

### Example
```lingo
This example first displays the transform.scale property for the model named Moon, then it
scales the model using the scale command, and finally, it displays the resulting
transform.scale value.
put member("Scene").model("Moon").transform.scale
-- vector( 1.0000, 1.0000, 1.0000)
member("Scene").model("Moon").scale(2.0,1.0,0.5)
put member("Scene").model("Moon").transform.scale
-- vector( 2.0000, 1.0000, 0.5000)

This statement scales the model named Pluto uniformly along all three axes by 0.5, resulting in
the model displaying at half of its size.
member("Scene").model("Pluto").scale(0.5)

This statement scales the model named Oval in a nonuniform manner, scaling it along its z-axis
but not its x- or y-axes.
member("Scene").model("Pluto").scale(0.0, 0.0, 0.5)
```

### See also
transform (property), preScale(), scale (transform)

### Implementation
- **File**: `apps/client/src/director/api/scale-command.js`
- **Test**: `apps/client/src/director/api/__tests__/scale-command.test.js`
- **Dependencies**: Various (depends on function)

