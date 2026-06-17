## perpendicularTo

**Source**: `docs/drmx2004_scripting_ref.txt` lines 23053-23073

### Usage
```lingo

```

### Description
3D vector command; returns a vector perpendicular to both the original vector and a second
vector. This command is equivalent to the vector crossProduct command.

### Parameters
vector2 Required. Specifies the second vector.

### Example
```lingo
In this example, pos1 is a vector on the x axis and pos2 is a vector on the y axis. The value
returned by pos1.perpendicularTo(pos2) is vector( 0.0000, 0.0000, 1.00000e4 ). The
last two lines of the example show the vector which is perpendicular to both pos1 and pos2.
pos1 = vector(100, 0, 0)
pos2 = vector(0, 100, 0)
put pos1.perpendicularTo(pos2)
-- vector( 0.0000, 0.0000, 1.00000e4 )
```

### See also
crossProduct(), cross

### Implementation
- **File**: `apps/client/src/director/api/perpendicularTo.js`
- **Test**: `apps/client/src/director/api/__tests__/perpendicularTo.test.js`
- **Dependencies**: Various (depends on function)

