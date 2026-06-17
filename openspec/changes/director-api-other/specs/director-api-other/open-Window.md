## open() (Window)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 22566-22606

### Usage
```lingo
windowObjRef.open()
windowObjRef.open();
```

### Description
Window method; opens a window and positions it in front of all other windows.
If no movie is assigned to the window on which open() is called, the Open File dialog
box appears.
If the reference to the window object windowObjRef is replaced with a movie’s filename, the
window uses the filename as the window name. However, a movie must then be assigned to the
window by using the window’s fileName property.
If the reference to the window object windowObjRef is replaced with a window name, the
window takes that name. However, a movie must then be assigned to the window by using the
window’s fileName property.
To open a window that uses a movie from a URL, use downloadNetThing() to download the
movie’s file to a local disk first, and then use the file on the disk. This procedure minimizes
problems with waiting for the movie to download.
When using a local movie, use preloadMovie() to load at least the first frame of the movie prior
to calling open(). This procedure reduces the possibility of movie load delays.
Opening a movie in a window is currently not supported in playback using a browser.

### Parameters
None.

436

Chapter 12: Methods

### Example
```lingo
This statement opens the window Control Panel and brings it to the front:
-- Lingo syntax
window("Control Panel").open()
// JavaScript syntax
window("Control Panel").open();
```

### See also
close(), downloadNetThing, fileName (Window), preLoadMovie(), Window

### Implementation
- **File**: `apps/client/src/director/api/open-Window.js`
- **Test**: `apps/client/src/director/api/__tests__/open-Window.test.js`
- **Dependencies**: Various (depends on function)

