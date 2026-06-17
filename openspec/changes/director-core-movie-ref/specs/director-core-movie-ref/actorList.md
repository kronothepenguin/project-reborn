## actorList

**Source**: `docs/drmx2004_scripting_ref.txt` lines 31776-31816

### Usage
```lingo
_movie.actorList
_movie.actorList;
```

### Description
Movie property; a list of child objects that have been explicitly added to this list. Read/write.
Objects in actorList receive a stepFrame message each time the playhead enters a frame.
To add an object to the actorList, use _movie.actorList.append(newScriptObjRef). The
object’s stepFrame handler in its parent or ancestor script will then be called automatically at
each frame advance.
To clear objects from the actorList, set actorList to [ ], which is an empty list.
Director doesn’t clear the contents of actorList when branching to another movie, which can
cause unpredictable behavior in the new movie. To prevent child objects in the current movie
from being carried over to the new movie, insert the statement actorList = [ ] in the
prepareMovie handler of the new movie.

### Parameters
None.

### Example
```lingo
This statement adds a child object created from the parent script Moving Ball. All three values are
parameters that the script requires.
This statement displays the contents of actorList in the Message window:
-- Lingo syntax
put(_movie.actorList)
// JavaScript syntax
put(_movie.actorList);

This statement clears objects from actorList.
-- Lingo syntax
_movie.actorList = [] -- using brackets
_movie.actorList = list() -- using list()
// JavaScript syntax
_movie.actorList = list();
```

### See also
Movie, on prepareMovie, on stepFrame

actorList

625

### Implementation
- **File**: `apps/client/src/director/core/movie-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/movie-ref.test.js`
- **Dependencies**: None (part of MovieRef class)

