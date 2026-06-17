## getStreamStatus()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 17817-17872

### Usage
```lingo

```

### Description
Function; returns a property list matching the format used for the globally available
tellStreamStatus function that can be used with callbacks to sprites or objects. The list
contains the following strings:
#URL

String containing the URL location used to start the network operation.

#state

String consisting of Connecting, Started, InProgress, Complete, “Error”, or
“NoInformation” (this last string is for the condition when either the net ID is so old
that the status information has been dropped or the URL specified in URLString
was not found in the cache).

#bytesSoFar

Number of bytes retrieved from the network so far.

#bytesTotal

Total number of bytes in the stream, if known. The value may be 0 if the HTTP
server does not include the content length in the MIME header.

#error

String containing ““ (EMPTY) if the download is not complete, OK if it completed
successfully, or an error code if the download ended with an error.

For example, you can start a network operation with getNetText() and track its progress with
getStreamStatus().

### Parameters
netID Required. A network operation that represents the stream of text to operate on.

getStreamStatus()

345

### Example
```lingo
This statement displays in the message window the current status of a download begun with
getNetText() and the resulting net ID placed in the variable netID:
put getStreamStatus(netID)
-- [#URL: "www.macromedia.com", #state: "InProgress", #bytesSoFar: 250,
#bytesTotal: 50000, #error: EMPTY]

\
```

### See also
on streamStatus, tellStreamStatus()

### Implementation
- **File**: `apps/client/src/director/api/getStreamStatus.js`
- **Test**: `apps/client/src/director/api/__tests__/getStreamStatus.test.js`
- **Dependencies**: None (pure function)

