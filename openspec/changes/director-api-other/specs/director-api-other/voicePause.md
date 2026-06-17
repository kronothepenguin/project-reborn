## voicePause()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 29876-29905

### Usage
```lingo

```

### Description
Command; pauses the speech output to the text-to-speech engine. The command returns a value
of 1 if it is successful, or 0 if it is not.

### Parameters
None.

### Example
```lingo
These statements cause the text-to-speech engine to pause when the user clicks the mouse:
-- Lingo syntax
on mouseUp
voicePause()
end mouseUp
// JavaScript syntax
function mouseUp() {
voicePause();
}
```

### See also
voiceSpeak(), voiceResume(), voiceStop(), voiceGetRate(), voiceSetRate(),
voiceGetPitch(), voiceSetPitch(), voiceGetVolume(), voiceSetVolume(),
voiceState(), voiceWordPos()

voicePause()

583

### Implementation
- **File**: `apps/client/src/director/api/voicePause.js`
- **Test**: `apps/client/src/director/api/__tests__/voicePause.test.js`
- **Dependencies**: Various (depends on function)

