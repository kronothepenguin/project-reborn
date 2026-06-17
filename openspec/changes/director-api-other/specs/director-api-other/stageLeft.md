## stageLeft

**Source**: `docs/drmx2004_scripting_ref.txt` lines 28151-28179

### Usage
```lingo

```

### Description
Function; along with stageRight, stageTop, and stageBottom, indicates where the Stage is
positioned on the desktop. It returns the left horizontal coordinate of the Stage relative to the
upper left corner of the main screen. When the Stage is flush with the left side of the main screen,
this coordinate is 0.
When the movie plays back as an applet, the stageLeft property is 0, which is the location of the
left side of the applet.
This property can be tested but not set.
Sprite coordinates are expressed relative to the upper left corner of the Stage.

### Parameters
None.

stageLeft

547

### Example
```lingo
This statement checks whether the left edge of the Stage is beyond the left edge of the screen and
calls the handler leftMonitorProcedure if it is:
if the stageLeft < 0 then leftMonitorProcedure
```

### See also
stageBottom, stageRight, stageTop, locH, locV

### Implementation
- **File**: `apps/client/src/director/api/stageLeft.js`
- **Test**: `apps/client/src/director/api/__tests__/stageLeft.test.js`
- **Dependencies**: Various (depends on function)

