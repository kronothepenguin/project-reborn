## union()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 29183-29207

### Usage
```lingo

```

### Description
Function; returns the smallest rectangle that encloses two rectangles.

### Parameters
rect2 Required. Specifies the second rectangle.

### Example
```lingo
This statement returns the rectangle that encloses the specified rectangles:
put union (rect (0, 0, 10, 10), rect (15, 15, 20, 20))
-- rect (0, 0, 20, 20)

or
put rect(0, 0, 10, 10).union(rect(15, 15, 20, 20))
--rect (0, 0, 20, 20)
```

### See also
map(), rect()

union()

569

### Implementation
- **File**: `apps/client/src/director/api/union.js`
- **Test**: `apps/client/src/director/api/__tests__/union.test.js`
- **Dependencies**: director-core-list, director-core-proplist

