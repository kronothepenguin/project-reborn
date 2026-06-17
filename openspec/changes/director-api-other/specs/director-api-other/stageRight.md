## stageRight

**Source**: `docs/drmx2004_scripting_ref.txt` lines 28180-28203

### Usage
```lingo

```

### Description
Function; along with stageLeft, stageTop, and stageBottom, indicates where the Stage is
positioned on the desktop. It returns the right horizontal coordinate of the Stage relative to the
upper left corner of the main screen’s desktop. The width of the Stage in pixels is determined by
the stageRight - the stageLeft.
When the movie plays back as an applet, the stageRight property is the width of the applet
in pixels.
This function can be tested but not set.
Sprite coordinates are expressed relative to the upper left corner of the Stage.

### Parameters
None.

### Example
```lingo
These two statements position sprite 3 a distance of 50 pixels from the right edge of the Stage:
stageWidth = the stageRight - the stageLeft
sprite(3).locH = stageWidth - 50
```

### See also
stageLeft, stageBottom, stageTop, locH, locV

### Implementation
- **File**: `apps/client/src/director/api/stageRight.js`
- **Test**: `apps/client/src/director/api/__tests__/stageRight.test.js`
- **Dependencies**: Various (depends on function)

