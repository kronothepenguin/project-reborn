## deleteVertex()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 15132-15153

### Usage
```lingo
memberObjRef.deleteVertex(indexToRemove)
memberObjRef.deleteVertex(indexToRemove);
```

### Description
Vector shape command; removes an existing vertex of a vector shape cast member in the index
position specified.

### Parameters
indexToRemove Required. An integer that specifies the index position of the vertex to delete.

### Example
```lingo
This line removes the second vertex point in the vector shape Archie:
-- Lingo syntax
member("Archie").deleteVertex(2)
// JavaScript syntax
member("Archie").deleteVertex(2);
```

### See also
addVertex(), moveVertex(), originMode, vertexList

### Implementation
- **File**: `apps/client/src/director/api/deleteVertex.js`
- **Test**: `apps/client/src/director/api/__tests__/deleteVertex.test.js`
- **Dependencies**: Various (depends on function)

