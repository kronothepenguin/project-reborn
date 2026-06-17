## voiceSpeak()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 30020-30044

### Usage
```lingo
voiceSpeak("string")
voiceSpeak("string"); // documentation n/a
```

### Description
Command; causes the specified string to be spoken by the text-to-speech engine. When this
command is used, any speech currently in progress is interrupted by the new string.

### Parameters
string Required. The string to be spoken by the text-to-speech engine.

### Example
```lingo
This statement causes the text-to-speech engine to speak the string “Welcome to Shockwave”:
voiceSpeak("Welcome to Shockwave")
```

### See also
voiceSpeak(), voicePause(), voiceResume(), voiceStop(), voiceGetRate(),
voiceSetRate(), voiceGetPitch(), voiceSetPitch(), voiceGetVolume(),
voiceSetVolume(), voiceState(), voiceWordPos()

586

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/voiceSpeak.js`
- **Test**: `apps/client/src/director/api/__tests__/voiceSpeak.test.js`
- **Dependencies**: Various (depends on function)

