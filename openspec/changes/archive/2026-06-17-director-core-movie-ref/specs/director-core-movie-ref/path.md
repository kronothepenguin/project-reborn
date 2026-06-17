## path (Movie)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 45754-45789

### Usage
```lingo
_movie.path
_movie.path;
```

### Description
Movie property; indicates the pathname of the folder in which the current movie is located.
Read-only.
For pathnames that work on both Windows and Macintosh computers, use the @ pathname
operator.
To see an example of path used in a completed movie, see the Read and Write Text movie in the
Learning/Lingo Examples folder inside the Director application folder.

path (Movie)

913

### Parameters
None.

### Example
```lingo
This statement displays the pathname for the folder containing the current movie:
-- Lingo syntax
trace(_movie.path)
// JavaScript syntax
trace(_movie.path);

This statement plays the sound file Crash.aif stored in the Sounds subfolder of the current movie’s
folder:
-- Lingo syntax
sound(1).playFile(_movie.path & "Sounds\Crash.aif")
// JavaScript syntax
sound(1).playFile(_movie.path + "Sounds\\Crash.aif");
```

### See also
Movie

### Implementation
- **File**: `apps/client/src/director/core/movie-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/movie-ref.test.js`
- **Dependencies**: None (part of MovieRef class)

