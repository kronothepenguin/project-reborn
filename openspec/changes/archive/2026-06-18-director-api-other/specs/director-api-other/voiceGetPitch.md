## voiceGetPitch()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 29754-29779

### Usage
```lingo

```

### Description
Function; returns the current pitch for the current voice as an integer. The valid range of values
depends on the operating system platform and text-to-speech software.

### Parameters
None.

### Example
```lingo
These statements check whether the pitch of the current voice is above 10 and set it to 10 if it is:
-- Lingo syntax
if voiceGetPitch() > 10 then
voiceSetPitch(10)
end if
// JavaScript syntax
if (voiceGetPitch() > 10) {
voiceSetPitch(10);
}
```

### See also
voiceSpeak(), voicePause(), voiceResume(), voiceStop(), voiceGetRate(),
voiceSetRate(), voiceSetPitch(), voiceGetVolume(), voiceSetVolume(),
voiceState(), voiceWordPos()

### Implementation
- **File**: `apps/client/src/director/api/voiceGetPitch.js`
- **Test**: `apps/client/src/director/api/__tests__/voiceGetPitch.test.js`
- **Dependencies**: Various (depends on function)

