## build()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 12718-12773

### Usage
```lingo
member(whichCastmember).modelResource(whichModelResource).build()
member(whichCastmember).modelResource(whichModelResource).build();
```

### Description
3D mesh command; constructs a mesh. This command is only used with model resources whose
type is #mesh.
You must use the build() command in the initial construction of the mesh, after changing any
of the face properties of the mesh, and after using the generateNormals() command.

### Parameters
None.

### Example
```lingo
This example creates a simple model resource whose type is #mesh, specifies its properties, and
then creates a new model using the model resource. The process is outlined in the following lineby-line explanation of the example code:
Line 1 creates a mesh called Plane, which has one face, three vertices, and a maximum of three
colors. The number of normals and the number of texture coordinates are not set. The normals
are created by the generateNormals command.
Line 2 defines the vectors that will be used as the vertices for Plane.
Line 3 assigns the vectors to the vertices of the first face of Plane.
Line 4 defines the three colors allowed by the newMesh command.
Line 5 assigns the colors to the first face of Plane. The third color in the color list is applied to the
first vertex of Plane, the second color to the second vertex, and the first color to the third vertex.
The colors will spread across the first face of Plane in gradients.
Line 6 creates the normals of Plane with the generateNormals() command.

build()

247

Line 7 calls the build() command to construct the mesh.
-- Lingo syntax
nm = member("Shapes").newMesh("Plane",1,3,0,3,0)
nm.vertexList = [vector(0,0,0), vector(20,0,0), vector(20, 20, 0)]
nm.face[1].vertices = [1,2,3]
nm.colorList = [rgb(255,255,0), rgb(0, 255, 0), rgb(0,0,255)]
nm.face[1].colors = [3,2,1]
nm.generateNormals(#smooth)
nm.build()
nm = member("Shapes").newModel("TriModel", nm)
// JavaScript syntax
nm = member("Shapes").newMesh("Plane",1,3,0,3,0);
nm.vertexList = [vector(0,0,0), vector(20,0,0), vector(20, 20, 0)];
nm.face[1].vertices = [1,2,3];
nm.colorList = [rgb(255,255,0), rgb(0, 255, 0), rgb(0,0,255)];
nm.face[1].colors = [3,2,1];
nm.generateNormals(#smooth);
nm.build();
nm = member("Shapes").newModel("TriModel", nm);
```

### See also
generateNormals(), newMesh, face[ ]

### Implementation
- **File**: `apps/client/src/director/api/build.js`
- **Test**: `apps/client/src/director/api/__tests__/build.test.js`
- **Dependencies**: Various (depends on function)

