## keyboardFocusSprite

**Source**: `docs/drmx2004_scripting_ref.txt` lines 41279-41300

### Usage
```lingo
_movie.keyboardFocusSprite
_movie.keyboardFocusSprite;
```

### Description
Movie property; lets the user set the focus for keyboard input (without controlling the cursor’s
insertion point) on a particular text sprite currently on the screen. Read/write.
This is the equivalent to using the Tab key when the autoTab property of the cast member
is selected.
Setting keyboardFocusSprite to -1 returns keyboard focus control to the Score, and setting it to
0 disables keyboard entry into any editable sprite.

keyboardFocusSprite

819

### Parameters
None.

### Example
```lingo

```

### See also
Movie

### Implementation
- **File**: `apps/client/src/director/core/movie-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/movie-ref.test.js`
- **Dependencies**: None (part of MovieRef class)

