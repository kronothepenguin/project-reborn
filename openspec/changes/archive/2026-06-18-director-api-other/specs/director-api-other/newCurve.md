## newCurve()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 21767-21794

### Usage
```lingo
memberObjRef.newCurve(positionInVertexList)
memberObjRef.newCurve(positionInVertexList);
```

### Description
Function; adds a #newCurve symbol to the vertexList of vectorCastMember, which adds a
new shape to the vector shape. You can break apart an existing shape by calling newCurve() with
a position in the middle of a series of vertices.

### Parameters
positionInVertexList Required. Specifies the position in the vertexList at which the
#newCurve symbol is added.

### Example
```lingo
These statements add a new curve to cast member 2 at the third position in the cast member’s
vertexList. The second line of the example replaces the contents of curve 2 with the contents of
curve 3.
-- Lingo syntax
member(2).newCurve(3)
member(2).curve[2] = member(2).curve[3]
// JavaScript syntax
member(2).newCurve(3);
member(2).curve[2] = member(2).curve[3];
```

### See also
curve, vertexList

### Implementation
- **File**: `apps/client/src/director/api/newCurve.js`
- **Test**: `apps/client/src/director/api/__tests__/newCurve.test.js`
- **Dependencies**: Various (depends on function)

