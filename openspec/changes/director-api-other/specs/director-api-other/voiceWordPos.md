## voiceWordPos()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 30109-30145

### Usage
```lingo
voiceWordPos()
voiceWordPos(); // documentation n/a
```

### Description
Function; returns an integer indicating the position of the word that is currently being spoken
within the entire string that contains it. For example, if a cast member containing 15 words is
being spoken and the fifth word of the cast member is being spoken when the function is used,
the return value is 5.

### Parameters
None.

### Example
```lingo
The following statements cause the sentence “Hello, how are you?” to be spoken and display the
current word position in the Message window. Since the voiceWordPos() function is called
immediately after the voiceSpeak() command is used, the return value will be 1.
-- Lingo syntax
voiceSpeak(“Hello, how are you?”)
put voiceWordPos()
-- 1
// JavaScript syntax
voiceSpeak("Hello, how are you?");
put(voiceWordPos());
// 1
```

### See also
voiceSpeak(), voicePause(), voiceResume(), voiceStop(), voiceGetRate(),
voiceSetRate(), voiceGetPitch(), voiceSetPitch(), voiceGetVolume(),
voiceSetVolume(), voiceState(), voiceSpeak()

588

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/voiceWordPos.js`
- **Test**: `apps/client/src/director/api/__tests__/voiceWordPos.test.js`
- **Dependencies**: Various (depends on function)

