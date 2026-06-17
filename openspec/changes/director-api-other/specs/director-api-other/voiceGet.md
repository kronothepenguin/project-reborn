## voiceGet()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 29681-29715

### Usage
```lingo

```

### Description
Function; returns a property list describing the current voice being used for text-to-speech. The
list contains the following properties:

• #name indicates the name of the installed voice.
• #age indicates the age of the voice. The value is a string. Possible values include “Teen”,
“Adult”, “Toddler”, and “Senior”, as well as numeric values such as “35”. Actual values depend
on the operating system, speech software version, and voices installed.
• #gender indicates whether the voice is male or female. The value is a string.
• #index indicates the position of the voice in the list of installed voices. You can refer to a voice
by its index when using the voiceSet() command.
Use voiceCount() to determine the number of available voices.

### Parameters
None.

voiceGet()

579

### Example
```lingo
This statement sets the variable oldVoice to the property list describing the current text-tospeech voice:
oldVoice = voiceGet()

This statement displays the property list of the current text-to-speech voice:
put voiceGet()
-- [#name: "Mary", #age: "teen", #gender: "female", #index: 5]
```

### See also
voiceInitialize(), voiceCount(), voiceSet(), voiceGet()

### Implementation
- **File**: `apps/client/src/director/api/voiceGet.js`
- **Test**: `apps/client/src/director/api/__tests__/voiceGet.test.js`
- **Dependencies**: Various (depends on function)

