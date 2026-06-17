## browserName()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 12687-12717

### Usage
```lingo

```

### Description
System property, command, and function; specifies the path or location of the browser. You can
use the FileIO Xtra to display a dialog box that allows the user to search for a browser. The
displayOpen() method of the FileIO Xtra is useful for displaying an Open dialog box.
The form browserName() returns the name of the currently specified browser. Placing a
pathname, like one found using the FileIO Xtra, as an argument in the form
browserName(fullPathToApplication) allows the property to be set. The form
browserName(#enabled, trueOrFalse) determines whether the specified browser launches
automatically when the goToNetPage command is issued.

246

Chapter 12: Methods

This command is only useful playing back in a projector or in Director, and has no effect when
playing back in a browser.
This property can be tested and set.

### Parameters
None.

### Example
```lingo
This statement refers to the location of the Netscape browser:
browserName "My Disk:My Folder:Netscape"

This statement displays the browser name in a Message window:
put browserName()
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/browserName.js`
- **Test**: `apps/client/src/director/api/__tests__/browserName.test.js`
- **Dependencies**: Various (depends on function)

