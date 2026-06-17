## settingsPanel()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 27646-27685

### Usage
```lingo
spriteObjRef.settingsPanel({integerPanelIndex})
spriteObjRef.settingsPanel({integerPanelIndex});
536
Chapter 12: Methods
```

### Description
Flash sprite command; invokes the Flash Settings dialog box to the specified panel index. This is
the same dialog box that can be opened by right-clicking (Windows) or Control-clicking
(Macintosh) on a Flash movie playing in a browser.
The Settings dialog box will not be displayed if the Flash sprite’s rectangle is not large enough to
accommodate it.
If you want to emulate the Flash Player by invoking the Settings dialog box when a user rightclicks (Windows) or Control-clicks (Macintosh), you can use this command in a mouseDown
handler that tests for the rightMouseDown property or the controlDown property.
In order to emulate the Flash Player by enabling the Settings dialog box in a Director movie
running in a browser, you must first disable the Shockwave Player context menu that is available
by right-clicking (Windows) or Control-clicking (Macintosh) on a movie with Shockwave
content playing in a browser. For information on how to disable this menu, see the Using
Director topics in the Director Help Panel.

### Parameters
integerPanelIndex Optional. Specifies which panel to activate when the dialog box is opened.
Valid values are 0, 1, 2, or 3. A value of 0 opens the dialog box showing the Privacy tab, a value of
1 opens it showing the Local Storage tab, a value of 2 opens it showing the Microphone tab, and
a value of 3 opens it showing the Camera tab. The default panel index is 0.

### Example
```lingo
This statement opens the Flash Settings panel with the Local Storage tab active:
-- Lingo syntax
sprite(3).settingsPanel(1)
// JavaScript syntax
sprite(3).settingsPanel(1);
```

### See also
on mouseDown (event handler), rightMouseDown, controlDown

### Implementation
- **File**: `apps/client/src/director/api/settingsPanel.js`
- **Test**: `apps/client/src/director/api/__tests__/settingsPanel.test.js`
- **Dependencies**: Various (depends on function)

