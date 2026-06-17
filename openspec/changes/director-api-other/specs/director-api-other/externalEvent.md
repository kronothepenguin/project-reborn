## externalEvent()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 15679-15737

### Usage
```lingo

```

### Description
Command; sends a string to the browser that the browser can interpret as a scripting language
instruction, allowing a movie playing or a browser to communicate with the HTML page in
which it is embedded.
This command works only for movies in browsers.
Note: The externalEvent command does not produce a return value. There is no immediate way to
determine whether the browser handled the event or ignored it. Use on EvalScript within the
browser to return a message to the movie.

### Parameters
string Required. The string to send to the browser. This string must be in a scripting language
supported by the browser.

### Example
```lingo
The following statements use externalEvent in the LiveConnect scripting environment, which
is supported by Netscape 3.x and later.
LiveConnect evaluates the string passed by externalEvent as a function call. JavaScript authors
must define and name this function in the HTML header. In the movie, the function name and
parameters are defined as a string in externalEvent. Because the parameters must be interpreted
by the browser as separate strings, each parameter is surrounded by single quotation marks.
Statements within HTML:
function MyFunction(parm1, parm2) {
//script here
}

Statements within a script in the movie:
externalEvent ("MyFunction('parm1','parm2')")

The following statements use externalEvent in the ActiveX scripting environment used by
Internet Explorer in Windows. ActiveX treats externalEvent as an event and processes this
event and its string parameter the same as an onClick event in a button object.

• Statements within HTML:
In the HTML header, define a function to catch the event; this example is in VBScript:
Sub
NameOfShockwaveInstance_externalEvent(aParam)
'script here
End Sub

304

Chapter 12: Methods

Alternatively, define a script for the event:
<SCRIPT FOR="NameOfShockwaveInstance"
EVENT="externalEvent(aParam)"
LANGUAGE="VBScript">
'script here
</SCRIPT>

Within the movie, include the function and any parameters as part of the string for
externalEvent:
externalEvent ("MyFunction ('parm1','parm2')")
```

### See also
on EvalScript

### Implementation
- **File**: `apps/client/src/director/api/externalEvent.js`
- **Test**: `apps/client/src/director/api/__tests__/externalEvent.test.js`
- **Dependencies**: Various (depends on function)

