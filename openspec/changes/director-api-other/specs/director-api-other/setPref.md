## setPref()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 27546-27592

### Usage
```lingo
_player.setPref(stringPrefName, prefString)
_player.setPref(stringPrefName, prefString);
```

### Description
Player method; writes a specified string to a specified file on the computer’s local disk. The file is
a standard text file.

534

Chapter 12: Methods

After setPref() runs, if the movie is playing in a browser, a folder named Prefs is created in the
Plug-In Support folder. The setPref() method can write only to that folder.
If the movie is playing in a projector or Director, a folder is created in the same folder as the
application. The folder receives the name Prefs.
Do not use this method to write to read-only media. Depending on the platform and version of
the operating system, you may encounter errors or other problems.
In a browser, data written by setPref() is not private; any movie with Shockwave content can
read this information and upload it to a server. Do not store confidential information using
setPref().
On Windows, setPref() fails if the user is a restricted user.
To see an example of setPref() used in a completed movie, see the Read and Write Text movie
in the Learning/Lingo folder inside the Director application folder.

### Parameters
prefName Required. A string that specifies the file to write to. The prefName parameter must be
a valid filename. To make sure the filename is valid on all platforms, use no more than eight
alphanumeric characters for the file name.
prefValue Required. A string that specifies the text to write to the file prefName.

### Example
```lingo
This handler saves the contents of the field cast member Text Entry in a file named DayWare
settings:
-- Lingo syntax
on mouseUp me
_player.setPref("CurPrefs", member("Text Entry").text)
end
// JavaScript syntax
function mouseUp() {
_player.setPref("CurPrefs", member("Text Entry").text);
}
```

### See also
getPref(), Player

### Implementation
- **File**: `apps/client/src/director/api/setPref.js`
- **Test**: `apps/client/src/director/api/__tests__/setPref.test.js`
- **Dependencies**: Various (depends on function)

