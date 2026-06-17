## voiceSet()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 29932-29956

### Usage
```lingo

```

### Description
Command: Sets the current voice of the text-to-speech synthesis. If successful, the command
returns the new value that was set. Use voiceCount() to determine the number of available
voices.

### Parameters
integer Required. An integer that specifies the number of the text-to-speech voice to use.

The valid range of values depends on the number of voices installed on the user’s computer.
If an out-of-range value is specified, the voice is set to the nearest valid value.

### Example
```lingo
This statement sets the current text-to-speech voice to the third voice installed on the
user’s computer:
voiceSet(3)
```

### See also
voiceInitialize(), voiceCount(), voiceGet()

584

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/voiceSet.js`
- **Test**: `apps/client/src/director/api/__tests__/voiceSet.test.js`
- **Dependencies**: Various (depends on function)

