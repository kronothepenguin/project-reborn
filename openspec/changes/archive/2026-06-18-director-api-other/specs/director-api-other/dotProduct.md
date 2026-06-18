## dotProduct()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 15267-15300

### Usage
```lingo

```

### Description
3D vector method; returns the sum of the products of the x, y, and z components of two vectors.
If both vectors are normalized, the dotproduct is the cosine of the angle between the two vectors.
To manually arrive at the dot of two vectors, multiply the x component of vector1 by the x
component of vector2, then multiply the y component of vector1 by the y component of
vector2, then multiply the z component of vector1 by the z component of vector2, and finally
add the three products together.
This method is identical to dot() function.

### Parameters
vector2 Required. The second vector from which a sum is returned.

### Example
```lingo
In this example, the angle between the vectors pos5 and pos6 is 45°. The getNormalized
function returns the normalized values of pos5 and pos6, and stores them in the variables norm1
and norm2. The dotProduct of norm1 and norm2 is 0.7071, which is the cosine of 45°.
pos5 = vector(100, 100, 0)
pos6 = vector(0, 100, 0)
put pos5.angleBetween(pos6)
-- 45.0000
norm1 = pos5.getNormalized()
put norm1
-- vector( 0.7071, 0.7071, 0.0000 )
norm2 = pos6.getNormalized()
put norm2
-- vector( 0.0000, 1.0000, 0.0000 )
put norm1.dotProduct(norm2)
-- 0.7071
```

### See also
dot(), getNormalized, normalize

### Implementation
- **File**: `apps/client/src/director/api/dotProduct.js`
- **Test**: `apps/client/src/director/api/__tests__/dotProduct.test.js`
- **Dependencies**: Various (depends on function)

