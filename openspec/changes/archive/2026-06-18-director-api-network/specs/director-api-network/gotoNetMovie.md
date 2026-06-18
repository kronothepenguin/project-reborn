## gotoNetMovie

**Source**: `docs/drmx2004_scripting_ref.txt` lines 18162-18195

### Usage
```lingo

```

### Description
Command; retrieves and plays a new movie with Shockwave content from an HTTP or FTP
server. The current movie continues to run until the new movie is available.
Only URLs are supported as valid parameters. The URL can specify either a filename or a marker
within a movie. Relative URLs work if the movie is on an Internet server, but you must include
the extension with the filename.
When performing testing on a local disk or network, media must be located in a directory
named dswmedia.
If a gotoNetMovie operation is in progress and you issue a second gotoNetMovie command
before the first is finished, the second command cancels the first.

### Parameters
URL Required. Specifies the URL of the Shockwave content to play.

### Example
```lingo
In this statement, the URL indicates a Director filename:
gotoNetMovie "http://www.yourserver.com/movies/movie1.dcr"

In this statement, the URL indicates a marker within a filename:
gotoNetMovie "http://www.yourserver.com/movies/buttons.dcr#Contents"

In the following statement, gotoNetMovie is used as a function. The function returns the
network ID for the operation.
myNetID = gotoNetMovie ("http://www.yourserver.com/movies/
buttons.dcr#Contents")

352

Chapter 12: Methods
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/gotoNetMovie.js`
- **Test**: `apps/client/src/director/api/__tests__/gotoNetMovie.test.js`
- **Dependencies**: None (pure function)

