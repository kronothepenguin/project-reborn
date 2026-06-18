## unLoadMember()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 29278-29329

### Usage
```lingo
_movie.unLoadMember({memberObjRef})
_movie.unLoadMember(fromMemberNameOrNum, toMemberNameOrNum)
_movie.unLoadMember({memberObjRef});
_movie.unLoadMember(fromMemberNameOrNum, toMemberNameOrNum);
```

### Description
Movie method; forces Director to clear the cast members used in a specified frame from memory.
Director automatically unloads the least recently used cast members to accommodate preLoad()
methods or normal cast library loading.

• When used without an argument, the unLoadMember() method clears from memory the cast
members in all the frames of a movie.

unLoadMember()

571

• When used with one argument, memberObjRef, the unLoadMember() method clears from
memory the cast members in that frame.

• When used with two arguments, fromMemberNameOrNum and toMemberNameOrNum, the
unLoadMember() method unloads all cast members in the range specified. You can specify a
range of cast members by frame numbers or frame labels.

### Parameters
memberObjRef Optional. A reference to the cast member to unload from memory.
fromMemberNameOrNum Required if clearing a range of cast members. A string or integer that

specifies the name or number of the first cast member in a range to unload from memory.
toMemberNameOrNum Required if clearing a range of cast members. A string or integer that

specifies the name or number of the last cast member in a range to unload from memory.

### Example
```lingo
This statement clears from memory the cast member Screen1:
-- Lingo syntax
_movie.unLoadMember(member("Screen1"))
// JavaScript syntax
_movie.unLoadMember(member("Screen1));

This statement clears from memory all cast members from cast member 1 to cast member Big
Movie:
-- Lingo syntax
_movie.unLoadMember(member(1), member("Big Movie"))
// JavaScript syntax
_movie.unLoadMember(member(1), member("Big Movie"));
```

### See also
Movie

### Implementation
- **File**: `apps/client/src/director/api/unLoadMember.js`
- **Test**: `apps/client/src/director/api/__tests__/unLoadMember.test.js`
- **Dependencies**: Various (depends on function)

