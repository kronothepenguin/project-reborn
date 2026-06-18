## printFrom()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 24418-24461

### Usage
```lingo
_movie.printFrom(startFrameNameOrNum {, endFrameNameOrNum, redux})
_movie.printFrom(startFrameNameOrNum {, endFrameNameOrNum, redux});
```

### Description
Movie method; prints whatever is displayed on the Stage in each frame, whether or not the frame
is selected, starting at the frame specified by startFrame. Optionally, you can supply endFrame
and a reduction (redux) value (100%, 50%, or 25%).
The frame being printed need not be currently displayed. This command always prints at 72 dots
per inch (dpi), bitmaps everything on the screen (text will not be as smooth in some cases), prints
in portrait (vertical) orientation, and ignores Page Setup settings. For more flexibility when
printing from within Director, see PrintOMatic Lite Xtra, which is on the installation disk.

### Parameters
startFrameNameOrNum Required. A string or integer that specifies the name or number of the

first frame to print.
endFrameNameOrNum Optional. A string or integer that specifies the name or number of the last

frame to print.
redux Optional. An integer that specifies the reduction value. Valid values are 100, 50, or 25.

### Example
```lingo
This statement prints what is on the Stage in frame 1:
-- Lingo syntax
_movie.printFrom(1)
// JavaScript syntax
_movie.printFrom(1);

The following statement prints what is on the Stage in every frame from frame 10 to frame 25.
The reduction is 50%.
-- Lingo syntax
_movie.printFrom(10, 25, 50)
// JavaScript syntax
_movie.printFrom(10, 25, 50);
```

### See also
Movie

printFrom()

475

### Implementation
- **File**: `apps/client/src/director/api/printFrom.js`
- **Test**: `apps/client/src/director/api/__tests__/printFrom.test.js`
- **Dependencies**: Various (depends on function)

