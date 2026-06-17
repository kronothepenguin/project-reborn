## alertHook

**Source**: `docs/drmx2004_scripting_ref.txt` lines 31817-31878

### Usage
```lingo
_player.alertHook
_player.alertHook;
```

### Description
Player property; specifies a parent script that contains the alertHook handler. Read/write.
Use alertHook to control the display of alerts about file errors or script errors. When an error
occurs and a parent script is assigned to alertHook, Director runs the alertHook handler in the
parent script.
Although it is possible to place alertHook handlers in movie scripts, it is strongly recommended
that you place an alertHook handler in a behavior or parent script to avoid unintentionally
calling the handler from a wide variety of locations and creating confusion about where the
error occurred.
Because the alertHook handler runs when an error occurs, avoid using the alertHook handler
for script that isn't involved in handling an error. For example, the alertHook handler is a bad
location for a go() statement.
The alertHook handler is passed an instance argument, two string arguments that describe the
error, and an optional argument specifying an additional event that invokes the handler.
The fourth argument can have 1 of these 4 values:

• #alert—causes the handler to be triggered by the alert() method.
• #movie—causes the handler to be triggered by a file not found error while performing a go()
command.

• #script—causes the handler to be triggered by a script error.
• #safeplayer—causes the handler to be triggered by a check of the safePlayer property.
Depending on the script within it, the alertHook handler can ignore the error or report it in
another way.

### Parameters
None.

### Example
```lingo
The following statement specifies that the parent script Alert is the script that determines whether
to display alerts when an error occurs. If an error occurs, the script assigns the error and message
strings to the field cast member Output and returns the value 1.
-- Lingo syntax
on prepareMovie
_player.alertHook = script("Alert")
end
-- "Alert" script
on alertHook me, err, msg
member("Output").text = err && msg
return 1
end

626

Chapter 14: Properties

// JavaScript syntax
function prepareMovie() {
_player.alertHook = alert("Error type", "Error message");
}
// alert handler
function alert(err, msg) {
member("Output").text = err + " " + msg;
return 1;
}
```

### See also
alertHook, Player, safePlayer

### Implementation
- **File**: `apps/client/src/director/core/player-ref.js`
- **Test**: `apps/client/src/director/core/__tests__/player-ref.test.js`
- **Dependencies**: None (part of PlayerRef class)

