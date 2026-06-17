## stageBottom

**Source**: `docs/drmx2004_scripting_ref.txt` lines 28125-28150

### Usage
```lingo

```

### Description
Function; along with stageLeft, stageRight, and stageTop, indicates where the Stage is
positioned on the desktop. It returns the bottom vertical coordinate of the Stage relative to the
upper left corner of the main screen. The height of the Stage in pixels is determined by the
stageBottom - the stageTop.
When the movie plays back as an applet, the stageBottom property is the height of the applet
in pixels.
This function can be tested but not set.

### Parameters
None.

### Example
```lingo
These statements position sprite 3 a distance of 50 pixels from the bottom edge of the Stage:
stageHeight = the stageBottom - the stageTop
sprite(3).locV = stageHeight - 50

Sprite coordinates are expressed relative to the upper left corner of the Stage. For more
information, see the Using Director topics in the Director Help Panel.
```

### See also
stageLeft, stageRight, stageTop, locH, locV

### Implementation
- **File**: `apps/client/src/director/api/stageBottom.js`
- **Test**: `apps/client/src/director/api/__tests__/stageBottom.test.js`
- **Dependencies**: Various (depends on function)

