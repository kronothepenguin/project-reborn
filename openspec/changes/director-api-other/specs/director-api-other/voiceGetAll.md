## voiceGetAll()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 29716-29753

### Usage
```lingo

```

### Description
Function; returns a list of the available voices installed on the computer. The list is composed of
property lists, one for each available voice.
Each property list contains the following properties:

• #name indicates the name of the installed voice.
• #age indicates the age of the voice. The value is a string. Possible values include “Teen”,
“Adult”, “Toddler”, and “Senior”, as well as numeric values such as “35”. Actual values depend
on the operating system, speech software version, and voices installed.
• #gender indicates wether the voice is male or female.
• #index indicates the position of the voice in the list of installed voices. You can refer to a voice
by its index when using the voiceSet() command.
You can also use voiceCount() to determine the number of available voices.

### Parameters
None.

### Example
```lingo
This statement sets the variable currentVoices to the list of voices installed on the user’s
computer:
currentVoices = voiceGetAll()

This statement displays the property list describing each of the currently installed
text-to-speech voices:
put voiceGetAll()
-- [[#name: "Mary", #age: "teen", #gender: "female", #index: 1], [#name: "Joe",
#age: "adult", #gender: "male", #index: 2]]
```

### See also
voiceInitialize(), voiceCount(), voiceSet(), voiceGet()

580

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/voiceGetAll.js`
- **Test**: `apps/client/src/director/api/__tests__/voiceGetAll.test.js`
- **Dependencies**: Various (depends on function)

