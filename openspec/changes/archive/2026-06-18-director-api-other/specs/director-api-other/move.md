## move()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 20994-21034

### Usage
```lingo
memberObjRef.move({intPosn, castLibName})
memberObjRef.move({intPosn, castLibName});
```

### Description
Member method; moves a specified cast member to either the first empty location in its
containing cast, or to a specified location in a given cast.
For best results, use this method during authoring, not at runtime, because the move is typically
saved with the file. The actual location of a cast member does not affect most presentations
during playback for an end user. To switch the content of a sprite or change the display during
runtime, set the member of the sprite.

### Parameters
intPosn Optional. An integer that specifies the position in the cast library castLibName to
which the member is moved.
castLibName Optional. A string that specifies the name of the cast library to which the member

is moved.

move()

405

### Example
```lingo
This statement moves cast member Shrine to the first empty location in the Cast window:
-- Lingo syntax
member("shrine").move()
// JavaScript syntax
member("shrine").move();

This statement moves cast member Shrine to location 20 in the Bitmaps Cast window:
-- Lingo syntax
member("shrine").move(20, "Bitmaps")
// JavaScript syntax
member("shrine").move(20, "Bitmaps");
```

### See also
Member

### Implementation
- **File**: `apps/client/src/director/api/move.js`
- **Test**: `apps/client/src/director/api/__tests__/move.test.js`
- **Dependencies**: Various (depends on function)

