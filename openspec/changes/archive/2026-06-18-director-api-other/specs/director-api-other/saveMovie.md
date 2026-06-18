## saveMovie()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 26669-26695

### Usage
```lingo
_movie.saveMovie({stringFilePath})
_movie.saveMovie({stringFilePath});
```

### Description
Movie method; saves the current movie.
Including the optional stringFilePath parameter saves the movie to the file specified. This
method does not work with compressed files. The specified filename must include the .dir
file extension.
The saveMovie() method doesn’t support URLs as file references.

### Parameters
stringFilePath Optional. A string that specifies the path to and name of the file to which the

movie is saved.

### Example
```lingo
This statement saves the current movie in the Update file:
-- Lingo syntax
_movie.saveMovie(_movie.path & "Update.dir")
// JavaScript syntax
_movie.saveMovie(_movie.path + "Update.dir");
```

### See also
Movie

### Implementation
- **File**: `apps/client/src/director/api/saveMovie.js`
- **Test**: `apps/client/src/director/api/__tests__/saveMovie.test.js`
- **Dependencies**: Various (depends on function)

