## fileName (Member)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 38705-38749

### Usage
```lingo
memberObjRef.fileName
memberObjRef.fileName;
```

### Description
Member property; refers to the name of the file assigned to a linked cast member. Read/write.
This property is useful for switching the external linked file assigned to a cast member while a
movie plays, similar to the way you can switch cast members. When the linked file is in a different
folder than the movie, you must include the file’s pathname.
You can also make unlinked media linked by setting the filename of those types of members that
support linked media.
This property also accepts URLs as a reference. However, to use a file from a URL and minimize
download time, use the downloadNetThing() or preloadNetThing() methods to download the
file to a local disk first and then set the fileName property to the file on the local disk.
After the filename is set, Director uses that file the next time the cast member is used.

### Parameters
None.

### Example
```lingo
This statement links the QuickTime movie “ChairAnimation” to cast member 40:
-- Lingo syntax
member(40).fileName = "ChairAnimation"
// JavaScript syntax
member(40).fileName = "ChairAnimation";

These statements download an external file from a URL to the Director application folder and
make that file the media for the sound cast member Norma Desmond Speaks:
-- Lingo syntax
downloadNetThing("http://wwwcbDeMille.com/Talkies.AIF", \
_player.applicationPath & "Talkies.AIF")
member("Norma Desmond Speaks").fileName = _player.applicationPath & \
"Talkies.AIF"
// JavaScript syntax
downloadNetThing("http://wwwcbDeMille.com/Talkies.AIF",
_player.applicationPath + "Talkies.AIF");
member("Norma Desmond Speaks").fileName = _player.applicationPath +
"Talkies.AIF";
```

### See also
downloadNetThing, Member, preloadNetThing()

766

Chapter 14: Properties

### Implementation
- **File**: `apps/client/src/director/core/member-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/member-ref.test.js`
- **Dependencies**: None (part of MemberRef class)

