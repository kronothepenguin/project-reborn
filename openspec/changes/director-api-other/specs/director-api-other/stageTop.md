## stageTop

**Source**: `docs/drmx2004_scripting_ref.txt` lines 28252-28280

### Usage
```lingo

```

### Description
Function; along with stageBottom, stageLeft, and stageRight, indicates where the Stage is
positioned on the desktop. It returns the top vertical coordinate of the Stage relative to the upper
left corner of the main screen’s desktop. If the Stage is in the upper left corner of the main screen,
this coordinate is 0.
When the movie plays back as an applet, the stageTop property is always 0, which is the location
of the left side of the applet.
This function can be tested but not set.
Sprite coordinates are expressed relative to the upper left corner of the Stage.

stageTop

549

### Parameters
None.

### Example
```lingo
This statement checks whether the top of the Stage is beyond the top of the screen and calls the
handler upperMonitorProcedure if it is:
if the stageTop < 0 then upperMonitorProcedure
```

### See also
stageLeft, stageRight, stageBottom, locH, locV

### Implementation
- **File**: `apps/client/src/director/api/stageTop.js`
- **Test**: `apps/client/src/director/api/__tests__/stageTop.test.js`
- **Dependencies**: Various (depends on function)

