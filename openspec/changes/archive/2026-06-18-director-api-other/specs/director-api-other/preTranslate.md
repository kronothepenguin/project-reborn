## preTranslate()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 24325-24376

### Usage
```lingo

```

### Description
3D transform command; applies a translation before the current positional, rotational, and scale
offsets held by the referenced transform object. The translation may be specified as a set of three
increments along the three corresponding axes. These increments may be specified explicitly in
the form of xIncrement, yIncrement, and zIncrement, or by a vector, where the X component
of the vector corresponds to the translation about the X axis, the Y about the Y axis, and the Z
about the Z axis.
After a series of transformations are done, in the following order, the model’s local origin will be at
(0, 0, -100), assuming the model’s parent is the world:
model.transform.identity()
model.transform.rotate(0, 90, 0)
model.transform.preTranslate(100, 0, 0)

Had translate() been used instead of preTranslate(), the model's local origin would be at
(100, 0, 0) and the model rotated about its own Y axis by 90°. The statement
model.transform.pretranslate(x, y, z) is equivalent to model.translate(x, y, z).
Generally, preTranslate() is only useful when dealing with transform variables rather than
model.transform references.

### Parameters
xIncrement Required if applying a translation using x-, y-, and z-axes. Specifies the translation
around the x-axis.
yIncrement Required if applying a translation using x-, y-, and z-axes. Specifies the translation
around the y-axis.
zIncrement Required if applying a translation using x-, y-, and z-axes. Specifies the translation
around the z-axis.
vector Required if applying a translation using a vector. Specifies the vector to use in

the translation.

preTranslate()

473

### Example
```lingo
t = transform()
t.transform.identity()
t.transform.rotate(0, 90, 0)
t.transform.preTranslate(100, 0, 0)
gbModel = member("scene").model("mars")
gbModel.transform = t
put gbModel.transform.position
-- vector(0.0000, 0.0000, -100.0000)
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/preTranslate.js`
- **Test**: `apps/client/src/director/api/__tests__/preTranslate.test.js`
- **Dependencies**: Various (depends on function)

