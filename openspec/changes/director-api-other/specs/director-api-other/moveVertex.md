## moveVertex()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 21099-21131

### Usage
```lingo
memberObjRef.moveVertex(vertexIndex, xChange, yChange)
memberObjRef.moveVertex(vertexIndex, xChange, yChange);
```

### Description
Function; moves the vertex of a vector shape cast member to another location.
The horizontal and vertical coordinates for the move are relative to the current position of the
vertex point. The location of the vertex point is relative to the origin of the vector shape member.
Changing the location of a vertex affects the shape in the same way as dragging the vertex
in an editor.

moveVertex()

407

### Parameters
vertexIndex Required. Specifies the index position of the vertex to move.
xChange Required. Specifies the amount to move the vertex horizontally.
yChange Required. Specifies the amount to move the vertex vertically.

### Example
```lingo
This statement shifts the first vertex point in the vector shape Archie 25 pixels to the right and 10
pixels down from its current position:
-- Lingo syntax
member("Archie").moveVertex(1, 25, 10)
// JavaScript syntax
member("Archie").moveVertex(1, 25, 10);
```

### See also
addVertex(), deleteVertex(), moveVertexHandle(), originMode, vertexList

### Implementation
- **File**: `apps/client/src/director/api/moveVertex.js`
- **Test**: `apps/client/src/director/api/__tests__/moveVertex.test.js`
- **Dependencies**: Various (depends on function)

