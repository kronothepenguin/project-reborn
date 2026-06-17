## voiceGetRate()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 29780-29811

### Usage
```lingo

```

### Description
Function; returns the current playback rate of the text-to-speech engine. The return value is an
integer. The valid range of values depends on the text-to-speech software and operating system
platform. In general, values between -10 and 10 can be expected.

### Parameters
None.

### Example
```lingo
These statements check whether the rate of speech synthesis is below 50 and set it to 50 if it is:
-- Lingo syntax
if voiceGetRate() < 50 then
voiceSetRate(50)
end if
// JavaScript syntax
if (voiceGetRate() < 50) {
voiceSetRate(50);
}

voiceGetRate()

581
```

### See also
voiceSpeak(), voicePause(), voiceResume(), voiceStop(), voiceSetRate(),
voiceGetPitch(), voiceSetPitch(), voiceGetVolume(), voiceSetVolume(),
voiceState(), voiceWordPos()

### Implementation
- **File**: `apps/client/src/director/api/voiceGetRate.js`
- **Test**: `apps/client/src/director/api/__tests__/voiceGetRate.test.js`
- **Dependencies**: Various (depends on function)

