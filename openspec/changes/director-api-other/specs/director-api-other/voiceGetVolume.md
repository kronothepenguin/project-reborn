## voiceGetVolume()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 29812-29838

### Usage
```lingo

```

### Description
Function: returns the current volume of the text-to-speech synthesis. The value returned is an
integer. The valid range of values depends on the operating system platform.

### Parameters
None.

### Example
```lingo
These statements check whether the text-to-speech volume is at least 55 and set it to 55 if
is lower:
-- Lingo syntax
if voiceGetVolume() < 55 then
voiceSetVolume(55)
end if
// JavaScript syntax
if (voiceGetVolume() < 55) {
voiceSetVolume(55);
}
```

### See also
voiceSpeak(), voicePause(), voiceResume(), voiceStop(), voiceGetRate(),
voiceSetRate(), voiceGetPitch(), voiceSetPitch(), voiceSetVolume(),
voiceState(), voiceWordPos()

### Implementation
- **File**: `apps/client/src/director/api/voiceGetVolume.js`
- **Test**: `apps/client/src/director/api/__tests__/voiceGetVolume.test.js`
- **Dependencies**: Various (depends on function)

