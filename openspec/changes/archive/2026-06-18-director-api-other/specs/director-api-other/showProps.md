## showProps()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 27863-27912

### Usage
```lingo
memberOrSpriteObjRef.showProps()
memberOrSpriteObjRef.showProps();
```

### Description
Command; displays a list of the current property settings of a Flash movie, Vector member, or
currently playing sound in the Message window. This command is useful for authoring only; it
does not work in projectors or in movies with Shockwave content.

### Parameters
None.

### Example
```lingo
This handler accepts the name of a cast as a parameter, searches that cast for Flash movie cast
members, and displays the cast member name, number, and properties in the Message window:
-- Lingo syntax
on ShowCastProperties(whichCast)
repeat with i = 1 to castLib(whichCast).member.count
castType = member(i, whichCast).type
if (castType = #flash) OR (castType = #vectorShape) then
put castType&&"cast member" && i & ":" && member(i, whichCast).name
put RETURN
member(i ,whichCast).showProps()
end if
end repeat

showProps()

541

end
// JavaScript syntax
function ShowCastProperties(whichCast) {
i = 1;
while( i < (castLib(whichCast).member.count) +1 ) {
castType = member(i, whichCast).type;
if ((castType = "flash") || (castType = "vectorShape")) {
trace (castType + " cast member " + i + ": " + member(i,
whichCast).name) + \n;
member(i ,whichCast).showProps();
i++;
}
}
}
```

### See also
queue(), setPlayList()

### Implementation
- **File**: `apps/client/src/director/api/showProps.js`
- **Test**: `apps/client/src/director/api/__tests__/showProps.test.js`
- **Dependencies**: Various (depends on function)

