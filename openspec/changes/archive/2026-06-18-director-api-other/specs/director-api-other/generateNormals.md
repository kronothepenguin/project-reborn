## generateNormals()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 16730-16767

### Usage
```lingo

```

### Description
3D #mesh model resource command; calculates the normal vectors for each vertex of the mesh.
If the style parameter is set to #flat, each vertex receives a normal for each face to which it
belongs. Furthermore, all three of the vertices of a face will have the same normal. For example, if
the vertices of face[1] all receive normal[1] and the vertices of face[2] all receive normal[2],
and the two faces share vertex[8], then the normal of vertex[8] is normal[1] in face[1] and
normal[2] in face[2]. Use of the #flat parameter results in very clear delineation of the
faces of the mesh.
If the style parameter is set to #smooth, each vertex receives only one normal, regardless of the
number of faces to which it belongs, and the three vertices of a face can have different normals.
Each vertex normal is the average of the face normals of all of the faces that share the vertex. Use
of the #smooth parameter results in a more rounded appearance of the faces of the mesh, except at
the outer edges of the faces at the silhouette of the mesh, which are still sharp.
A vertex normal is a direction vector which indicates the “forward” direction of a vertex. If the
vertex normal points toward the camera, the colors displayed in the area of the mesh controlled by
that normal are determined by the shader. If the vertex normal points away from the camera, the
area of the mesh controlled by that normal will be non-visible.
After using the generateNormals() command, you must use the build() command to rebuild
the mesh.

### Parameters
style Required. A symbol that specifies the style of the vertex.

### Example
```lingo
The following statement calculates vertex normals for the model resource named FloorMesh. The
style parameter is set to #smooth, so each vertex in the mesh will receive only one normal.
member("Room").modelResource("FloorMesh").generateNormals(#smooth)
```

### See also
build(), face[ ], normalList, normals, flat

324

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/generateNormals.js`
- **Test**: `apps/client/src/director/api/__tests__/generateNormals.test.js`
- **Dependencies**: Various (depends on function)

