## preloadNetThing()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 24153-24190

### Usage
```lingo

```

### Description
Function; preloads a file from the Internet to the local cache so it can be used later without a
download delay. The return value is a network ID that you can use to monitor the progress of
the operation.
The preloadNetThing() function downloads the file while the current movie continues playing.
Use netDone() to find out whether downloading is finished.
After an item is downloaded, it can be displayed immediately because it is taken from the local
cache rather than from the network.
Although many network operations can be active at a time, running more than four concurrent
operations usually slows down performance unacceptably.
Neither the cache size nor the Check Documents option in a browser’s preferences affects the
behavior of the preloadNetThing function.

preloadNetThing()

469

The preloadNetThing() function does not parse a Director file’s links. Thus, even if a Director
file is linked to casts and graphic files, preloadNetThing() downloads only the Director file. You
still must preload other linked objects separately.

### Parameters
url Required. Specifies the name of any valid Internet file, such as a Director movie, graphic, or
FTP server location.

### Example
```lingo
This statement uses preloadNetThing() and returns the network ID for the operation:
set mynetid = preloadNetThing("http://www.yourserver.com/menupage/
mymovie.dir")

After downloading is complete, you can navigate to the movie using the same URL. The movie
will be played from the cache instead of the URL, since it’s been loaded in the cache.
```

### See also
netDone()

### Implementation
- **File**: `apps/client/src/director/api/preloadNetThing.js`
- **Test**: `apps/client/src/director/api/__tests__/preloadNetThing.test.js`
- **Dependencies**: None (pure function)

