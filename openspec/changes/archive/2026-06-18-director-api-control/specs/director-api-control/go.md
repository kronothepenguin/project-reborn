## go()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 17971-18040

### Usage
```lingo
_movie.go(frameNameOrNum {, movieName})
_movie.go(frameNameOrNum {, movieName});
```

### Description
Movie method; causes the playhead to branch to a specified frame in a specified movie.
This method can be used to tell the playhead to loop to the previous marker, and is a convenient
means of keeping the playhead in the same section of the movie while script remains active.
It is best to use marker labels for frameNameOrNum instead of frame numbers; editing a movie can
cause frame numbers to change. Using marker labels also makes it easier to read scripts.
Calling go() with the movieName parameter loads frame 1 of the movie. If go() is called from
within a handler, the handler in which it is placed continues executing. To suspend the handler
while playing the movie, use the play() method, which may be followed by a subsequent call to
playDone() to return.
When you specify a movie to play, specify its path if the movie is in a different folder, but to
prevent a potential load failure, don’t include the movie’s .dir, .dxr, or .dcr file extension.
To more efficiently go to a movie at a URL, use the downloadNetThing() method to download
the movie file to a local disk first, and then use the go() method with the movieName parameter
to go to that movie on the local disk.
The goLoop() method sends the playhead to the previous marker in a movie, which is a
convenient means of keeping the playhead in the same section of the movie while Lingo or
JavaScript syntax remains active.
The following are reset when a movie is loaded: beepOn and constraint properties;
keyDownScript, mouseDownScript, and mouseUpScript; cursor and immediate sprite
properties; cursor() and puppetSprite() methods; and custom menus. However, the
timeoutScript is not reset when loading a movie.

348

Chapter 12: Methods

### Parameters
frameNameOrNum Required. A string that specifies the marker label of the frame to which the

playhead branches, or an integer that specifies the number of the frame to which the playhead
branches.
movieName Optional. A string that specifies the movie that contains the frame specified by
frameNameOrNum. This value must specify a movie file; if the movie is in another folder,
movieName must also specify the path.

### Example
```lingo
This statement sends the playhead to the marker named start:
-- Lingo syntax
_movie.go("start")
// JavaScript syntax
_movie.go("start");

This statement sends the playhead to the marker named Memory in the movie named
Noh Tale to Tell:
-- Lingo syntax
_movie.go("Memory", "Noh Tale to Tell")
// JavaScript syntax
_movie.go("Memory", "Noh Tale to Tell");

The following handler tells the movie to loop in the current frame. This handler is useful for
making the movie wait in a frame while it plays so the movie can respond to events.
-- Lingo syntax
on exitFrame
_movie.go(_movie.frame)
end
// JavaScript syntax
function exitFrame() {
_movie.go(_movie.frame);
}
```

### See also
downloadNetThing, goLoop(), Movie

### Implementation
- **File**: `apps/client/src/director/api/go.js`
- **Test**: `apps/client/src/director/api/__tests__/go.test.js`
- **Dependencies**: director-core-movie-ref

