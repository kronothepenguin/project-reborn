## netTextResult()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 21552-21596

### Usage
```lingo

```

### Description
Function; returns the text obtained by the specified network operation. If no net ID is specified,
netTextResult returns the result of the last network operation.

netTextResult()

415

If the specified network operation was getNetText(), the text is the text of the file on
the network.
If the specified network operation was postNetText, the result is the server’s response.
After the next operation starts, Director discards the results of the previous operation to
conserve memory.
When a movie plays back as an applet, this function returns valid results for the last 10 requests.
When a movie plays back as a movie with Shockwave content, this function returns valid results
for only the most recent getNetText() operation.

### Parameters
netID Optional. Specifies the ID of the network operation that contains the text to return.

### Example
```lingo
This handler uses the "netDone and netError" functions to test whether the last network
operation finished successfully. If the operation is finished, text returned by netTextResult is
displayed in the field cast member Display Text.
-- Lingo syntax
global gNetID
on exitFrame
if (netDone(gNetID) = TRUE) and (netError(gNetID) = "OK") then
member("Display Text").text = netTextResult()
end if
end
// JavaScript syntax
global gNetID;
function exitFrame() {
if (netDone(gNetID) && (netError(gNetID) == "OK")) {
member("Display Text").text = netTextResult();
}
}
```

### See also
netDone(), netError(), postNetText

### Implementation
- **File**: `apps/client/src/director/api/netTextResult.js`
- **Test**: `apps/client/src/director/api/__tests__/netTextResult.test.js`
- **Dependencies**: None (pure function)

