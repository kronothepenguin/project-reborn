## loadFile()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 19989-20023

### Usage
```lingo

```

### Description
3D cast member command; imports the assets of a W3D file into a cast member.
The cast member’s state property must be either -1 (error) or 4 (loaded) before the loadFile
command is used.

### Parameters
fileName Required. Specifies the W3D file that contains the assets to import.
overwrite Optional. Indicates whether the assets of the W3D file replace the assets of the cast
member (TRUE) or are added to the assets of the cast member (FALSE). The default value of
overwrite is TRUE.
generateUniqueNames Optional. If set to TRUE, any element in the W3D file with the same
name as a corresponding element in the cast member is renamed. If FALSE, elements in the cast
member are overwritten by corresponding elements in the W3D file with the same name. The
default value of generateUniqueNames is TRUE.

### Example
```lingo
The following statement imports the contents of the file named Truck.W3d into the cast member
named Roadway. The contents of Truck.W3d will be added to the contents of Roadway. If any
imported objects have the same names as objects already in Roadway, Director will create new
names for them.
member("Roadway").loadFile("Truck.W3d", FALSE, TRUE)

The following statement imports the contents of the file named Chevy.W3d into the cast member
named Roadway. Chevy.W3d is in a folder named Models one level down from the movie. The
contents of Roadway will be replaced by the contents of Chevy.W3d. The third parameter is
irrelevant because the value of the second parameter is TRUE.
member("Roadway").loadFile(the moviePath & "Models\Chevy.W3d", \
TRUE, TRUE)
```

### See also
state (3D)

### Implementation
- **File**: `apps/client/src/director/api/loadFile.js`
- **Test**: `apps/client/src/director/api/__tests__/loadFile.test.js`
- **Dependencies**: Various (depends on function)

