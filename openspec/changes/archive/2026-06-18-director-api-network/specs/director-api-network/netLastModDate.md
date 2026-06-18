## netLastModDate()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 21423-21465

### Usage
```lingo

```

### Description
Function; returns the date last modified from the HTTP header for the specified item. The string
is in Universal Time (GMT) format: Ddd, nn Mmm yyyy hh:mm:ss GMT (for example, Thu, 30
Jan 1997 12:00:00 AM GMT). There are variations where days or months are spelled completely.
The string is always in English.
The netLastModDate function can be called only after netDone and netError report that the
operation is complete and successful. After the next operation starts, the Director movie or
projector discards the results of the previous operation to conserve memory.
The actual date string is pulled directly from the HTTP header in the form provided by
the server. However, this string is not always provided, and in that case netLastModDate
returns EMPTY.

### Parameters
None.

### Example
```lingo
These statements check the date of a file downloaded from the Internet:
-- Lingo syntax
if netDone() then
theDate = netLastModDate()
if theDate.char[6..11] <> "Jan 30" then
alert "The file is outdated."
end if
end if

netLastModDate()

413

// JavaScript syntax
if (netDone()) {
theDate = netLastModDate();
if (theDate.char[6..11] != "Jan 30") {
alert("The file is outdated");
}
}
```

### See also
netDone(), netError()

### Implementation
- **File**: `apps/client/src/director/api/netLastModDate.js`
- **Test**: `apps/client/src/director/api/__tests__/netLastModDate.test.js`
- **Dependencies**: None (pure function)

