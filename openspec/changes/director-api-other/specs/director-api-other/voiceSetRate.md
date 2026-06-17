## voiceSetRate()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 29976-30000

### Usage
```lingo

```

### Description
Command; sets the playback rate of the text-to-speech engine to the specified integer value. The
command returns the new value that has been set.

### Parameters
integer Required. An integer that specifies the playback rate that the text-to-speech engine uses.
The valid range of values depends on the operating system platform. In general, values between
-10 and 10 are appropriate for most text-to-speech software. If an out-of-range value is specified,
the rate will be set to the nearest valid value.

### Example
```lingo
This statement sets the playback rate of the text-to-speech engine to 7:
voiceSetRate(7)
```

### See also
voiceSpeak(), voicePause(), voiceResume(), voiceStop(), voiceGetRate(),
voiceGetPitch(), voiceSetPitch(), voiceGetVolume(), voiceSetVolume(),
voiceState(), voiceWordPos()

voiceSetRate()

585

### Implementation
- **File**: `apps/client/src/director/api/voiceSetRate.js`
- **Test**: `apps/client/src/director/api/__tests__/voiceSetRate.test.js`
- **Dependencies**: Various (depends on function)

