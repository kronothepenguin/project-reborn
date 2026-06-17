## runMode

**Source**: `docs/drmx2004_scripting_ref.txt` lines 26600-26642

### Usage
```lingo

```

### Description
Function; returns a string indicating the mode in which the movie is playing. Possible values are
as follows:

• Author—The movie is running in Director.
• Projector—The movie is running as a projector.
• BrowserPlugin—The movie is running as a Shockwave Player plug-in or other scripting
environment, such as LiveConnect or ActiveX.
The safest way to test for particular values in this property is to use the contains operator. This
helps avoid errors and allows partial matches.

runMode

515

### Parameters
None.

### Example
```lingo
This statement determines whether or not external parameters are available and obtains them if
they are:
--Lingo syntax
if the runMode contains "Plugin" then
-- decode the embed parameter
if externalParamName(swURL) = swURL then
put externalParamValue(swURL) into myVariable
end if
end if
// JavaScript syntax
if (_movie.runMode.indexOf("Plugin") >=0) {
// decode the embed parameter
if (externalParamName(swURL) == swURL) {
myVariable = externalParamValue(swURL);
}
}
```

### See also
environmentPropList, platform

### Implementation
- **File**: `apps/client/src/director/api/runMode.js`
- **Test**: `apps/client/src/director/api/__tests__/runMode.test.js`
- **Dependencies**: Various (depends on function)

