## percentStreamed (Member)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 46076-46138

### Usage
```lingo
memberOrSpriteObjRef.percentStreamed
memberOrSpriteObjRef.percentStreamed;
```

### Description
Shockwave Audio (SWA) and Flash cast member property, and QuickTime sprite property.
For SWA streaming sounds, gets the percent of a SWA file already streamed from an HTTP or
FTP server. For SWA, this property differs from the percentPlayed property in that it includes
the amount of the file that has been buffered but not yet played. This property can be tested only
after the SWA sound starts playing or has been preloaded by means of the preLoadBuffer
command.
For Flash movie cast members, this property gets the percent of a Flash movie that has streamed
into memory.
For QuickTime sprites, this property gets the percent of the QuickTime file that has played.
This property can have a value from 0 to 100%. For a file on a local disk, the value is 100. For
files being streamed from the Internet, the percentStreamed value increases as more bytes are
received. This property cannot be set.

### Parameters
None.

### Example
```lingo
This example displays the percentage of the SWA streaming cast member Ray Charles that has
streamed and puts the value in a field:
-- Lingo syntax
on exitFrame
whatState = member("Ray Charles").state
if whatState > 1 AND whatState < 9 then
member("Percent Streamed Displayer").text = \
string(member("Ray Charles").percentStreamed)
end if
end
// JavaScript syntax
function exitFrame() {
var whatState = member("Ray Charles").state;
var pcStm = new String(member("Ray Charles").percentStreamed);
if (whatState > 1 && whatState < 9) {
member("Percent Streamed Displayer").text = pcStm;
}
}

920

Chapter 14: Properties

This frame script keeps the playhead looping in the current frame so long as less than 60 percent
of a Flash movie called Splash Screen has streamed into memory:
-- Lingo syntax
on exitFrame
if member("Splash Screen").percentStreamed < 60 then
_movie.go(_movie.frame)
end if
end
// JavaScript syntax
function exitFrame() {
var ssStrm = member("Splash Screen").percentStreamed;
if (ssStrm < 60) {
_movie.go(_movie.frame);
}
}
```

### See also
percentPlayed

### Implementation
- **File**: `apps/client/src/director/core/member-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/member-ref.test.js`
- **Dependencies**: None (part of MemberRef class)

