## voiceCount()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 29663-29680

### Usage
```lingo

```

### Description
Function: returns the number of installed voices available to the text-to-speech engine. The return
value is an integer. This number of voices can be used with voiceSet() and voiceGet() to
specify a particular voice to be active.

### Parameters
None.

### Example
```lingo
This statement sets the variable numVoices to the number of available text-to-speech voices:
numVoices = voiceCount()
```

### See also
voiceInitialize(), voiceSet(), voiceGet()

### Implementation
- **File**: `apps/client/src/director/api/voiceCount.js`
- **Test**: `apps/client/src/director/api/__tests__/voiceCount.test.js`
- **Dependencies**: Various (depends on function)

