## voiceStop()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 30075-30108

### Usage
```lingo
voiceStop()
voiceStop(); // documentation n/a
```

### Description
Command; stops the speech output to the text-to-speech engine and empties the text-to-speech
buffer. The command returns a value of 1 if it is successful, or 0 if it is not.

### Parameters
None.

voiceStop()

587

### Example
```lingo
These statements stop the speech when the playhead moves to the next frame in the Score:
-- Lingo syntax
on exitFrame
voiceStop()
end exitFrame
// JavaScript syntax
function exitFrame() {
voiceStop();
}
```

### See also
voiceSpeak(), voicePause(), voiceResume(), voiceGetRate(), voiceSetRate(),
voiceGetPitch(), voiceSetPitch(), voiceGetVolume(), voiceSetVolume(),
voiceState(), voiceWordPos(), voiceSpeak()

### Implementation
- **File**: `apps/client/src/director/api/voiceStop.js`
- **Test**: `apps/client/src/director/api/__tests__/voiceStop.test.js`
- **Dependencies**: Various (depends on function)

