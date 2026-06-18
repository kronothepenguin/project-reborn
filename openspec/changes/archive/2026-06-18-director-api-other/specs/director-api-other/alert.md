## alert()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 12264-12299

### Usage
```lingo
_player.alert(displayString)
_player.alert(displayString);
```

### Description
Player method; causes a system beep and displays an alert dialog box containing a specified string.
The alert message must be a string. If you want to include a number variable in an alert, convert
the variable to a string before passing it to alert().

### Parameters
displayString Required. A string that represents the text displayed in the alert dialog box. The

string can contain up to 255 characters.

238

Chapter 12: Methods

### Example
```lingo
The following statement produces an alert stating that there is no CD-ROM drive connected:
-- Lingo syntax
_player.alert("There is no CD-ROM drive connected.")
// JavaScript syntax
_player.alert("There is no CD-ROM drive connected.");

This statement produces an alert stating that a file was not found:
-- Lingo syntax
_player.alert("The file" && QUOTE & filename & QUOTE && "was not found.")
// JavaScript syntax
_player.alert("The file \"" + filename + "\" was not found.");
```

### See also
Player

### Implementation
- **File**: `apps/client/src/director/api/alert.js`
- **Test**: `apps/client/src/director/api/__tests__/alert.test.js`
- **Dependencies**: Various (depends on function)

