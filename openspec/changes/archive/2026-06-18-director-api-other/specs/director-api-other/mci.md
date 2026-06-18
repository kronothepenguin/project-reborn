## mci

**Source**: `docs/drmx2004_scripting_ref.txt` lines 20419-20435

### Usage
```lingo

```

### Description
Command; for Windows only, passes the strings specified by string to the Windows Media
Control Interface (MCI) for control of multimedia extensions.
Note: Microsoft no longer recommends using the 16-bit MCI interface. Consider using third-party
Xtra extensions for this functionality instead.

### Parameters
string Required. A string that is passed to the MCI.

### Example
```lingo
The following statement makes the command play cdaudio from 200 to 600 track 7 play
only when the movie plays back in Windows:
mci "play cdaudio from 200 to 600 track 7"
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/mci.js`
- **Test**: `apps/client/src/director/api/__tests__/mci.test.js`
- **Dependencies**: Various (depends on function)

