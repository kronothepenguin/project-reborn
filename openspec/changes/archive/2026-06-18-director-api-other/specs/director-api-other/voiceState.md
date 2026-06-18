## voiceState()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 30045-30074

### Usage
```lingo
voiceState()
voiceState(); // documentation n/a
```

### Description
Function; returns the current status of the voice as a symbol. The possible return values are
#playing, #paused, and #stopped.

### Parameters
None.

### Example
```lingo
These statements check whether the text-to-speech engine is actively speaking and set the voice
to 1 if it is not:
--Lingo syntax
if voiceState() <> #playing then
voiceSet(1)
end if
// JavaScript syntax
if (voiceState() != symbol("playing")) {
voiceSet(1);
}
```

### See also
voiceSpeak(), voicePause(), voiceResume(), voiceStop(), voiceGetRate(),
voiceSetRate(), voiceGetPitch(), voiceSetPitch(), voiceGetVolume(),
voiceSetVolume(), voiceWordPos(), voiceSpeak()

### Implementation
- **File**: `apps/client/src/director/api/voiceState.js`
- **Test**: `apps/client/src/director/api/__tests__/voiceState.test.js`
- **Dependencies**: Various (depends on function)

