## vector()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 29608-29642

### Usage
```lingo
vector()
vector(intX, intY, intZ)
vector();
vector(intX, intY, intZ);
```

### Description
Top level function and data type. Describes a point in 3D space according to three parameters,
which are the specific distances from the reference point along the x-axis, y-axis, and z-axis,
respectively.
If the vector is in world space, the reference point is the world origin, vector(0, 0, 0). If the
vector is in object space, the reference point is the object’s position and orientation.
This method returns a vector object.
Vector values can be operated upon by the +, -, * and / operators. See their individual definitions
for more information.

### Parameters
intX Optional. An integer that specifies the x-axis point.
intY Optional. An integer that specifies the y-axis point.
intZ Optional. An integer that specifies the z-axis point.

### Example
```lingo
This statement creates a vector and assigns it to the variable myVector:
-- Lingo syntax
myVector = vector(10.0, -5.0, 0.0)
// JavaScript syntax
var myVector = vector(10.0, -5.0, 0.0);

In Lingo only, this statement adds two vectors and assigns the resulting value to the
variable thisVector:
-- Lingo syntax
thisVector = vector(1.0, 0.0, 0.0) + vector(0.0, -12.5, 2.0)
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/vector.js`
- **Test**: `apps/client/src/director/api/__tests__/vector.test.js`
- **Dependencies**: Various (depends on function)

