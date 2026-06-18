## netMIME()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 21466-21529

### Usage
```lingo

```

### Description
Function; provides the MIME type of the Internet file that the last network operation returned
(the most recently downloaded HTTP or FTP item).
The netMIME function can be called only after netDone and netError report that the operation
is complete and successful. After the next operation starts, the Director movie or projector
discards the results of the previous operation to conserve memory.

### Parameters
None.

### Example
```lingo
This handler checks the MIME type of an item downloaded from the Internet and
responds accordingly:
-- Lingo syntax
on checkNetOperation theURL
if netDone (theURL) then
set myMimeType = netMIME()
case myMimeType of
"image/jpeg": go frame "jpeg info"
"image/gif": go frame "gif info"
"application/x-director": goToNetMovie theURL
"text/html": goToNetPage theURL
otherwise: alert "Please choose a different item."
end case
else
go the frame
end if
end
// JavaScript syntax
function checkNetOperation(theURL) {
if (netDone(theURL)) {
myMimeType = netMIME();
switch (myMimeType) {
case "image/jpeg":
_movie.go("jpeg info");
break;
case "image/gif":
_movie.go("gif info");

414

Chapter 12: Methods

break;
case "application/x-director":
goToNetMovie(theURL);
break;
case "text/html":
goToNetPage(theURL);
break;
default:
alert("Please choose a different item.");
}
} else {
_movie.go(_movie.frame);
}
}
```

### See also
netDone(), netError(), getNetText(), postNetText, preloadNetThing()

### Implementation
- **File**: `apps/client/src/director/api/netMIME.js`
- **Test**: `apps/client/src/director/api/__tests__/netMIME.test.js`
- **Dependencies**: None (pure function)

