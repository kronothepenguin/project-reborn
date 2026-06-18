## voiceSetPitch()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 29957-29975

### Usage
```lingo

```

### Description
Command; sets the pitch for the current voice of the text-to-speech engine to the specified value.
The return value is the new pitch value that has been set.

### Parameters
integer Required. An integer that specifies the pitch for the text-to-speech voice. The valid range
of values depends on the operating system platform and text-to-speech software.

### Example
```lingo
This statement sets the pitch for the current voice to 75:
voiceSetPitch(75)
```

### See also
voiceSpeak(), voicePause(), voiceResume(), voiceStop(), voiceGetRate(),
voiceSetRate(), voiceGetPitch(), voiceGetVolume(), voiceSetVolume(),
voiceState(), voiceWordPos()

### Implementation
- **File**: `apps/client/src/director/api/voiceSetPitch.js`
- **Test**: `apps/client/src/director/api/__tests__/voiceSetPitch.test.js`
- **Dependencies**: Various (depends on function)

