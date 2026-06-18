## getPref()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 17626-17670

### Usage
```lingo
_player.getPref(stringPrefName)
_player.getPref(stringPrefName);
```

### Description
Player method; retrieves the content of the specified file.
When you use this method, replace stringPrefName with the name of a file created by
the setPref() method. If no such file exists, getPref() returns VOID (Lingo) or null
(JavaScript syntax).
The filename used for stringPrefName must be a valid filename only, not a full path; Director
supplies the path. The path to the file is handled by Director. The only valid file extensions for
stringPrefName1 are .txt and .htm; any other extension is rejected.
Do not use this method to access read-only or locked media.
Note: In a browser, data written by setPref() is not private. Any movie with Shockwave content can
read this information and upload it to a server. Confidential information should not be stored using
setPref().

getPref()

341

To see an example of getPref() used in a completed movie, see the Read and Write Text movie
in the Learning/Lingo folder inside the Director application folder.

### Parameters
stringPrefName Required. A string that specifies the file for which content is retrieved.

### Example
```lingo
This handler retrieves the content of the file Test and then assigns the file’s text to the field
Total Score:
-- Lingo syntax
on mouseUp
theText = _player.getPref("Test")
member("Total Score").text = theText
end
// JavaScript syntax
function mouseUp() {
var theText = _player.getPref("Test");
member("Total Score").text = theText;
}
```

### See also
Player, setPref()

### Implementation
- **File**: `apps/client/src/director/api/getPref.js`
- **Test**: `apps/client/src/director/api/__tests__/getPref.test.js`
- **Dependencies**: Various (depends on function)

