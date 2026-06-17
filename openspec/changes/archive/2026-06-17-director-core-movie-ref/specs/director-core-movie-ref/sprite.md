## sprite (Movie)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 50123-50143

### Usage
```lingo
_movie.sprite[spriteNameOrNum]
_movie.sprite[spriteNameOrNum];
```

### Description
Movie property; provides indexed or named access to a movie sprite. Read-only.
The spriteNameOrNum argument can be either a string that specifies the name of the sprite or an
integer that specifies the number of the sprite.

### Parameters
None.

### Example
```lingo
The following statement sets the variable sportSprite to the movie sprite 5:
-- Lingo syntax
sportSprite = _movie.sprite[5]
// JavaScript syntax
var sportSprite = _movie.sprite[5];
```

### See also
Movie

### Implementation
- **File**: `apps/client/src/director/core/movie-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/movie-ref.test.js`
- **Dependencies**: None (part of MovieRef class)

