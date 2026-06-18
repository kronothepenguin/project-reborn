## importFileInto()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 19062-19140

### Usage
```lingo
memberObjRef.importFileInto(fileOrUrlString)
memberObjRef.importFileInto(fileOrUrlString);
```

### Description
Member method; replaces the content of a specified cast member with a specified file.
The importFileInto() method is useful in the following situations.

• When finishing or developing a movie, use it to embed external linked media so it can be
edited during the project.

• When generating a Score from Lingo or JavaScript syntax during movie creation, use it to
assign content to new cast members.

importFileInto()

365

• When downloading files from the Internet, use it to download the file at a specific URL and
set the filename of linked media.
Note: To import a file from a URL, it is usually more efficient to use the preloadNetThing() to
download the file to a local disk first, and then import the file from the local disk. Using
preloadNetThing() also minimizes any potential downloading issues.

• Use it to import both RTF and HTML documents into text cast members with formatting and
links intact.
Using importFileInto() in projectors can quickly consume available memory, so reuse the same
members for imported data when possible.
In Director and projectors, importFileInto() automatically downloads the file. In Shockwave
Player, call preloadNetThing() and wait for a successful completion of the download before
using importFileInto() with the file.

### Parameters
fileOrUrlString Required. A string that specifies the file that will replace the content of the

cast member.

### Example
```lingo
This handler assigns a URL that contains a GIF file to the variable tempURL and then uses the
importFileInto command to import the file at the URL into a new bitmap cast member:
-- Lingo syntax
on exitFrame
tempURL = "http://www.dukeOfUrl.com/crown.gif"
_movie.newMember(#bitmap).importFileInto(tempURL)
end
// JavaScript syntax
function exitFrame() {
var tempURL = "http://www.dukeOfUrl.com/crown.gif";
_movie.newMember("bitmap").importFileInto(tempURL);
}

This statement replaces the content of the sound cast member Memory with the sound file Wind:
-- Lingo syntax
member("Memory").importFileInto("Wind.wav")
// JavaScript syntax
member("Memory").importFileInto("Wind.wav");

These statements download an external file from a URL to the Director application folder and
then import that file into the sound cast member Norma Desmond Speaks:
-- Lingo syntax
downLoadNetThing("http://www.cbDeMille.com/Talkies.AIF", \
_player.applicationPath & "Talkies.AIF")
member("Norma Desmond Speaks").importFileInto(_player.applicationPath &
"Talkies.AIF")
// JavaScript syntax
downLoadNetThing("http://www.cbDeMille.com/Talkies.AIF",
_player.applicationPath + "Talkies.AIF");
member("Norma Desmond Speaks").importFileInto(_player.applicationPath +
"Talkies.AIF");

366

Chapter 12: Methods
```

### See also
downloadNetThing, fileName (Window), Member, preloadNetThing()

### Implementation
- **File**: `apps/client/src/director/api/importFileInto.js`
- **Test**: `apps/client/src/director/api/__tests__/importFileInto.test.js`
- **Dependencies**: Various (depends on function)

