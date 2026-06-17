## name

**Source**: `docs/drmx2004_scripting_ref.txt` lines 44301-44326

### Usage
```lingo
castObjRef.name
memberObjRef.name
_movie.name
windowObjRef.name
castObjRef.name;
memberObjRef.name;
_movie.name;
windowObjRef.name;
```

### Description
Cast, Member, Movie, and Window property; returns or sets the name of an object. Read/write
for Cast, Member, and Window objects, read-only for Movie objects.

### Parameters
None.

### Example
```lingo
This statement changes the name of the window Yesterday to Today:
-- Lingo syntax
window("Yesterday").name = "Today"
// JavaScript syntax
window("Yesterday").name = "Today";
```

### See also
Cast Library, Member, Movie, Window

### Implementation
- **File**: `apps/client/src/director/core/cast-library-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/cast-library-ref.test.js`
- **Dependencies**: None (part of CastLibraryRef class)

