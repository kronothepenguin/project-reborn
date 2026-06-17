## member (Movie)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 42949-42973

### Usage
```lingo
_movie.member[memberNameOrNum]
_movie.member[memberNameOrNum];
```

### Description
Movie property; provides indexed or named access to the members of a movie’s cast library.
Read-only.
The memberNameOrNum argument can be a string that specifies the cast member by name or an
integer that specifies the cast member by number.

### Parameters
None.

### Example
```lingo
The following statement accesses a cast member using both named and numbered access, and sets
the result to the variable myMember.
-- Lingo syntax
myMember = _movie.member[2] -- using numbered access
myMember = _movie.member["Athlete"] -- using named access
// JavaScript syntax
var myMember = _movie.member[2]; // using numbered access;
var myMember = _movie.member["Athlete"]; // using named access;
```

### See also
Movie

### Implementation
- **File**: `apps/client/src/director/core/movie-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/movie-ref.test.js`
- **Dependencies**: None (part of MovieRef class)

