## realPlayerVersion()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 25638-25701

### Usage
```lingo
realPlayerVersion()
realPlayerVersion();
```

### Description
RealMedia function; returns a string identifying the build number of the RealPlayer software
installed on the user’s system, or an empty string if RealPlayer is not installed. Users must have
RealPlayer 8 or later in order to view Director movies containing RealMedia content. On
Windows systems, build numbers 6.0.8.132 or later indicate that RealPlayer 8 is installed. On
Macintosh systems, RealPlayer Core component build numbers 6.0.7.1001 or later indicate that
RealPlayer 8 is installed.
The purpose of this function is to allow you to create your own RealPlayer detection and alert
system, if you do not want to use the one provided by the function
realPlayerPromptToInstall() on page 495.
If you choose to create your own detection and alert system using the realPlayerVersion()
function, you must do the following:

• Call realPlayerPromptToInstall(FALSE) (by default, this function is set to TRUE) before
any RealMedia cast members are referenced in Lingo or appear in the Score. This function
should be set in a prepareMovie event handler in a movie script.
• Use the xtraList system property to verify that the Xtra for RealMedia (RealMedia Asset.x32)
is listed in the Movie Xtras dialog box. The realPlayerVersion() function will not work if
the Xtra for RealMedia is not present.
The build number returned by this function is the same as the build number you can display
in RealPlayer.

496

Chapter 12: Methods

To view the RealPlayer build number in Windows:

1 Launch RealPlayer.
2 Choose About RealPlayer from the Help menu.

In the window that appears, the build number appears at the top of the screen in the
second line.
To view the RealPlayer build number on the Macintosh:

1 Launch RealPlayer.
2 Choose About RealPlayer from the Apple menu.

The About RealPlayer dialog box appears. Ignore the build number listed in the second line at
the top of the screen; it is incorrect.
3 Click the Version Info button.
The RealPlayer Version Information dialog box appears.
4 Select RealPlayer Core in the list of installed components.
The build number shown for RealPlayer Core component (for example, 6.0.8.1649) is the
same as the build number returned by realPlayerVersion().

### Parameters
None.

### Example
```lingo
The following code shows that build number of the RealPlayer installed on the system is
6.0.9.357:
-- Lingo syntax
put(realPlayerVersion())
// JavaScript syntax
put(realPlayerVersion());
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/realPlayerVersion.js`
- **Test**: `apps/client/src/director/api/__tests__/realPlayerVersion.test.js`
- **Dependencies**: Various (depends on function)

