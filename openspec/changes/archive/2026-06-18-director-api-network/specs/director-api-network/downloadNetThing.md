## downloadNetThing

**Source**: `docs/drmx2004_scripting_ref.txt` lines 15301-15333

### Usage
```lingo

```

### Description
Command; copies a file from the Internet to a file on the local disk, while the current movie
continues playing. Use netDone to find out whether downloading is finished.
Director movies in authoring mode and projectors support the downLoadNetThing command,
but the Shockwave Player does not. This protects users from unintentionally copying files from
the Internet.

296

Chapter 12: Methods

Although many network operations can be active at one time, running more than four concurrent
operations usually slows down performance unacceptably.
Neither the Director movie’s cache size nor the setting for the Check Documents option affects
the behavior of the downloadNetThing command.

### Parameters
URL Required. The URL of any object that can be downloaded: for example, an FTP or HTTP
server, an HTML page, an external cast member, a Director movie, or a graphic.
localFile Required. The pathname and filename for the file on the local disk.

### Example
```lingo
These statements download an external cast member from a URL to the Director application
folder and then make that file the external cast member named Cast of Thousands:
downLoadNetThing("http://www.cbDeMille.com/Thousands.cst", the \
applicationPath&"Thousands.Cst")
castLib("Cast of Thousands").fileName = the applicationPath&"Thousands.Cst"
```

### See also
importFileInto(), netDone(), preloadNetThing()

### Implementation
- **File**: `apps/client/src/director/api/downloadNetThing.js`
- **Test**: `apps/client/src/director/api/__tests__/downloadNetThing.test.js`
- **Dependencies**: None (pure function)

