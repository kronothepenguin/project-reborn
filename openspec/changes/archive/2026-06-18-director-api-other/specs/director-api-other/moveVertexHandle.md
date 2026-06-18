## moveVertexHandle()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 21132-21167

### Usage
```lingo
memberObjRef.moveVertexHandle(vertexIndex, handleIndex, xChange, yChange)
memberObjRef.moveVertexHandle(vertexIndex, handleIndex, xChange, yChange);
```

### Description
Function; moves the vertex handle of a vector shape cast member to another location.
The horizontal and vertical coordinates for the move are relative to the current position of the
vertex handle. The location of the vertex handle is relative to the vertex point it controls.
Changing the location of a control handle affects the shape in the same way as dragging the vertex
in the editor.

### Parameters
vertexIndex Required. Specifies the index position of the vertex that contains the handle

to move.
handleIndex Required. Specifies the index position of the handle to move.
xChange Required. Specifies the amount to move the vertex handle horizontally.
yChange Required. Specifies the amount to move the vertex handle vertically.

### Example
```lingo
This statement shifts the first control handle of the second vertex point in the vector shape Archie
15 pixels to the right and 5 pixels up:
-- Lingo syntax
moveVertexHandle(member("Archie"), 2, 1, 15, -5)
// JavaScript syntax
moveVertexHandle(member("Archie"), 2, 1, 15, -5)

408

Chapter 12: Methods
```

### See also
addVertex(), deleteVertex(), originMode, vertexList

### Implementation
- **File**: `apps/client/src/director/api/moveVertexHandle.js`
- **Test**: `apps/client/src/director/api/__tests__/moveVertexHandle.test.js`
- **Dependencies**: Various (depends on function)

