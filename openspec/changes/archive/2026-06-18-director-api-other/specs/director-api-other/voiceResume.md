## voiceResume()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 29906-29931

### Usage
```lingo

```

### Description
Command; resumes the speech output to the text-to-speech engine. The command returns a
value of 1 if it is successful, or 0 if it is not.

### Parameters
None.

### Example
```lingo
These statements resume the speech when the playhead moves to the next frame in the Score:
-- Lingo syntax
on exitFrame
voiceResume()
end exitFrame
// JavaScript syntax
function exitFrame() {
voiceResume();
}
```

### See also
voiceSpeak(), voicePause(), voiceStop(), voiceGetRate(), voiceSetRate(),
voiceGetPitch(), voiceSetPitch(), voiceGetVolume(), voiceSetVolume(),
voiceState(), voiceWordPos()

### Implementation
- **File**: `apps/client/src/director/api/voiceResume.js`
- **Test**: `apps/client/src/director/api/__tests__/voiceResume.test.js`
- **Dependencies**: Various (depends on function)

