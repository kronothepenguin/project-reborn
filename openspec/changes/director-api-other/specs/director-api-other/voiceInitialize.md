## voiceInitialize()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 29839-29875

### Usage
```lingo

```

### Description
Command; loads the computer’s text-to-speech engine. If the voiceInitialize() command
returns 0, text-to-speech software is not present or failed to load.
The command returns 1 if successful, 0 otherwise.

### Parameters
None.

582

Chapter 12: Methods

### Example
```lingo
These statements load the computer’s text-to-speech engine and then test for whether the text-tospeech engine has completed loading before using the voiceSpeak() command to speak the
phrase “Welcome to Shockwave.”:
-- Lingo syntax
err = voiceInitialize()
if err = 1 then
voiceSpeak("Welcome to Shockwave")
else
alert "Text-to-speech software failed to load."
end if
// JavaScript syntax
err = voiceInitialize();
if (err == 1) {
voiceSpeak("Welcome to Shockwave");
} else {
alert("Text-to-speech software failed to load.");
}
```

### See also
voiceCount(), voiceSet(), voiceGet()

### Implementation
- **File**: `apps/client/src/director/api/voiceInitialize.js`
- **Test**: `apps/client/src/director/api/__tests__/voiceInitialize.test.js`
- **Dependencies**: Various (depends on function)

