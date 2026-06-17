## addVertex()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 12221-12263

### Usage
```lingo
memberObjRef.addVertex(indexToAddAt, pointToAddVertex {,[ horizControlLocV, \
vertControlLocV ], [ horizControlLocH, vertControlLocV ]})
memberObjRef.addVertex(indexToAddAt, pointToAddVertex {,[ horizControlLocV,
vertControlLocV ], [ horizControlLocH, vertControlLocV ]});
```

### Description
Vector shape command; adds a new vertex to a vector shape cast member in the position
specified.
The horizontal and vertical positions are relative to the origin of the vertex shape cast member.

addVertex()

237

When using the final two optional parameters, you can specify the location of the control handles
for the vertex. The control handle location is offset relative to the vertex, so if no location is
specified, it will be located at 0 horizontal offset and 0 vertical offset.

### Parameters
indexToAddAt Required. An integer that specifies the index at which the member is added.
pointToAddVertex Required. A point that specifies the position at which the member is added.
horizControlLocH Optional. An integer that specifies the location of the horizontal portion of
the horizontal control handle.
horizControlLocV Optional. An integer that specifies the location of the vertical portion of the
horizontal control handle.
vertControlLocH Optional. An integer that specifies the location of the horizontal portion of
the vertical control handle.
vertControlLocV Optional. An integer that specifies the location of the vertical portion of the
vertical control handle.

### Example
```lingo
This line adds a vertex point in the vector shape Archie between the two existing vertex points, at
the position 25 horizontal and 15 vertical:
-- Lingo syntax
member("Archie").addVertex(2, point(25, 15))
// JavaScript syntax
member("Archie").addVertex(2, point(25, 15));
```

### See also
vertexList, moveVertex(), deleteVertex(), originMode

### Implementation
- **File**: `apps/client/src/director/api/addVertex.js`
- **Test**: `apps/client/src/director/api/__tests__/addVertex.test.js`
- **Dependencies**: Various (depends on function)

