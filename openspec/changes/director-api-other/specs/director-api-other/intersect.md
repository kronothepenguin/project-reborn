## intersect()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 19432-19448

### Usage
```lingo

```

### Description
Function; determines the rectangle formed where two rectangles intersect.

### Parameters
rectangle2 Required. Specifies the second rectangle in the intersection test.

### Example
```lingo
This statement assigns the variable newRectangle to the rectangle formed where rectangle
toolKit intersects rectangle Ramp:
newRectangle = toolKit.intersect(Ramp)
```

### See also
map(), rect(), union()

### Implementation
- **File**: `apps/client/src/director/api/intersect.js`
- **Test**: `apps/client/src/director/api/__tests__/intersect.test.js`
- **Dependencies**: Various (depends on function)

