## stream()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 28471-28532

### Usage
```lingo
memberObjRef.stream(numberOfBytes)
memberObjRef.stream(numberOfBytes);
```

### Description
Command; manually streams a portion of a specified Flash movie cast member into memory.
The stream command returns the number of bytes actually streamed. Depending on a variety of
conditions (such as network speed or the availability of the requested data), the number of bytes
actually streamed may be less than the number of bytes requested.
You can always use the stream command for a cast member regardless of the cast member’s
streamMode property.

### Parameters
numberOfBytes Optional. An integer that specifies the number of bytes to stream. If you omit
the numberOfBytes parameter, Director tries to stream the number of bytes set by the cast
member’s bufferSize property.

### Example
```lingo
The following frame script checks to see if a linked Flash movie cast member has streamed into
memory by checking its percentStreamed property. If the cast member is not completely loaded
into memory, the script tries to stream 32,000 bytes of the movie into memory.
The script also saves the actual number of bytes streamed in a variable called bytesReceived. If
the number of bytes actually streamed does not match the number of bytes requested, the script
updates a text cast member to report the number of bytes actually received. The script keeps the
playhead looping in the current frame until the cast member has finished loading into memory.

554

Chapter 12: Methods

-- Lingo syntax
on exitFrame
if member(10).percentStreamed < 100 then
bytesReceived = member(10).stream(32000)
if bytesReceived < 32000 then
member("Message Line").text = "Received only" && bytesReceived \
&& "of 32,000 bytes requested."
_movie.updateStage()
else
member("Message Line").text = "Received all 32,000 bytes."
end if
_movie.go(_movie.frame)
end if
end
// JavaScript syntax
function exitFrame() {
var pctStm = member(10).percentStreamed;
if (pctStm < 100) {
var bytesReceived = member(10).stream(32000);
if (bytesReceived < 32000) {
member("Message Line").text = "Received only " + bytesReceived + " of
32,000 bytes requested.";
_movie.updateStage();
} else {
member("Message Line").text = "Received all 32,000 bytes.";
}
_movie.go(_movie.frame);
}
}
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/stream.js`
- **Test**: `apps/client/src/director/api/__tests__/stream.test.js`
- **Dependencies**: Various (depends on function)

