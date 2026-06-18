## realPlayerPromptToInstall()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 25590-25637

### Usage
```lingo
realPlayerPromptToInstall()
realPlayerPromptToInstall();
```

### Description
RealMedia function; allows you to get or set a global flag that determines whether automatic
detection and alert for RealPlayer 8 is enabled (TRUE) or not (FALSE).
By default, this function is set to TRUE, which means that if users do not have RealPlayer 8 and
attempt to load a movie containing RealMedia, they are automatically asked if they want to go to
the RealNetworks website and install RealPlayer. You can set this flag to FALSE if you want to
create your own detection and alert system using the realPlayerVersion() on page 496
function and custom code. If this flag is set to FALSE and an alternate RealPlayer 8 detection and
alert system is not in place, users without RealPlayer will be able to load movies containing
RealMedia cast members, but the RealMedia sprites will not appear.
This function detects the build number of the RealPlayer installed on the user’s system to
determine whether RealPlayer 8 is installed. On Windows systems, build numbers 6.0.8.132 or
later indicate that RealPlayer 8 is installed. On Macintosh systems, RealPlayer Core component
build numbers 6.0.7.1001 or later indicate that RealPlayer 8 is installed.
This flag should be executed in a prepareMovie event handler in a movie script.
This function returns the previous value of the flag.

### Parameters
None.
realPlayerPromptToInstall()

495

### Example
```lingo
The following code shows that the realPlayerPromptToInstall() function is set to TRUE,
which means users who do not have RealPlayer will be prompted to install it:
-- Lingo syntax
put(realPlayerPromptToInstall()) -- 1
// JavaScript syntax
-- Lingo syntax
trace(realPlayerPromptToInstall()); // 1

The following code sets the realPlayerPromptToInstall() function to FALSE, which means
that users will not be prompted to install RealPlayer unless you have created a detection and
alert system:
-- Lingo syntax
realPlayerPromptToInstall(FALSE)
// JavaScript syntax
realPlayerPromptToInstall(0);
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/realPlayerPromptToInstall.js`
- **Test**: `apps/client/src/director/api/__tests__/realPlayerPromptToInstall.test.js`
- **Dependencies**: Various (depends on function)

