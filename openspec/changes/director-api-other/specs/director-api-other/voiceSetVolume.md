## voiceSetVolume()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 30001-30019

### Usage
```lingo

```

### Description
Command; sets the volume of the text-to-speech synthesis.

### Parameters
integer Required. An integer that specifies the volume of text-to-speech synthesis. The range of
valid values depends on the operating system platform. If successful, the command returns the
new value that was set. If an invalid value is specified, the volume is set to the nearest valid value.

### Example
```lingo
This statement sets the volume of text-to-speech synthesis to 55:
voiceSetVolume(55)
```

### See also
voiceSpeak(), voicePause(), voiceResume(), voiceStop(), voiceGetRate(),
voiceSetRate(), voiceGetPitch(), voiceSetPitch(), voiceGetVolume(),
voiceState(), voiceWordPos()

### Implementation
- **File**: `apps/client/src/director/api/voiceSetVolume.js`
- **Test**: `apps/client/src/director/api/__tests__/voiceSetVolume.test.js`
- **Dependencies**: Various (depends on function)

