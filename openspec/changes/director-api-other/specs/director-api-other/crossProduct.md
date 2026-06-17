## crossProduct()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 14235-14252

### Usage
```lingo

```

### Description
3D vector method; returns a vector which is perpendicular to both vector1 and vector2.

### Parameters
None.

### Example
```lingo
In this example, pos1 is a vector on the x axis and pos2 is a vector on the y axis. The value
returned by pos1.crossProduct(pos2) is vector( 0.0000, 0.0000, 1.00000e4 ), which is
perpendicular to both pos1 and pos2.
pos1 = vector(100, 0, 0)
pos2 = vector(0, 100, 0)
put pos1.crossProduct(pos2)
-- vector( 0.0000, 0.0000, 1.00000e4 )
```

### See also
perpendicularTo, cross

### Implementation
- **File**: `apps/client/src/director/api/crossProduct.js`
- **Test**: `apps/client/src/director/api/__tests__/crossProduct.test.js`
- **Dependencies**: Various (depends on function)

