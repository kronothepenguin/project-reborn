## preScale()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 24282-24324

### Usage
```lingo

```

### Description
3D transform command; applies a scale prior to the existing positional, rotational, and scaling
effects of the given transform.
Node may be a reference to a model, group, light, or camera.

### Parameters
xScale Required if applying a scale using x-, y-, and z-axes. Specifies the scale around the x-axis.
yScale Required if applying a scale using x-, y-, and z-axes. Specifies the scale around the y-axis.
zScale Required if applying a scale using x-, y-, and z-axes. Specifies the scale around the z-axis.
vector Required if applying a scale using a vector. Specifies the vector that contains the scale
to apply.

### Example
```lingo
Line 1 of the following Lingo creates a duplicate of Moon1’s transform. Remember that access to
a model’s transform property is by reference.
Line 2 applies a scale to that transform prior to any existing positional or rotational effects of that
transform. Assume that the transform represents the positional offset and rotational orbit of
Moon1 relative to its parent planet. Lets also assume Moon2’s parent is the same as Moon1’s. If
we used scale() here instead of preScale(), then Moon2 would be pushed out twice as far and
rotated about the planet twice as much as is Moon1. This is because the scaling would be applied
to the transform’s existing positional and rotational offsets. Using preScale() will apply the size
change without affecting these existing positional and rotational offsets.
Line 3 applies an additional 180° rotation about the x-axis of the planet. This will put Moon2 on
the opposite side of Moon1’s orbit. Using preRotate() would have left Moon2 in the same place

as Moon1, spun around its own x-axis by 180°.

472

Chapter 12: Methods

Line 4 assigns this new transform to Moon2.
t = member("scene").model("Moon1").transform.duplicate()
t.preScale(2,2,2)
t.rotate(180,0,0)
member("scene").model("Moon2").transform = t
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/preScale.js`
- **Test**: `apps/client/src/director/api/__tests__/preScale.test.js`
- **Dependencies**: Various (depends on function)

