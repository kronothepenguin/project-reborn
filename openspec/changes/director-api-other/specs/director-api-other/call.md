## call

**Source**: `docs/drmx2004_scripting_ref.txt` lines 12863-12957

### Usage
```lingo

```

### Description
Command; sends a message that invokes a handler in a specified script or list of scripts.
The call command can use a variable as the name of the handler. Messages passed using call are
not passed to other scripts attached to the sprite, cast member scripts, frame scripts, or movie
scripts.

### Parameters
symHandlerName Required. A symbol that specifies the handler to activate.
scriptInstance Required. A reference to the script or list of scripts that contains the handler.
If scriptInstance is a single script instance, an error alert occurs if the handler is not defined
in the script’s ancestor script. If scriptInstance is a list of script instances, the message is sent
to each item in the list in turn; if the handler is not defined in the ancestor script, no alert
is generated.
args Optional. Any optional parameters to be passed to the handler.

### Example
```lingo
This handler sends the message bumpCounter to the first behavior script attached to sprite 1:
-- Lingo syntax
on mouseDown me
-- get the reference to the first behavior of sprite 1
set xref = getAt (the scriptInstanceList of sprite 1,1)
-- run the bumpCounter handler in the referenced script,
-- with a parameter
call (#bumpCounter, xref, 2)
end
// JavaScript syntax
function mouseDown() {
// get the reference to the first behavior of sprite 1
xref = getAt(sprite(1).script(1));
// run the bumpCounter handler in the referenced script
call(symbol("bumpcounter"), xref, 2);
}

250

Chapter 12: Methods

The following example shows how a call statement can call handlers in a behavior or parent
script and its ancestor.

• This is the parent script:
-- Lingo syntax
-- script Man
property ancestor
on new me
set ancestor = new(script "Animal", 2)
return me
end
on run me, newTool
put "Man running with "&the legCount of me&" legs"
end

• This is the ancestor script:
-- script Animal
property legCount
on new me, newLegCount
set legCount = newLegCount
return me
end
on run me
put "Animal running with "& legCount &" legs"
end
on walk me
put "Animal walking with "& legCount &" legs"
end

• The following statements use the parent script and ancestor script.
This statement creates an instance of the parent script:
set m = new(script "man")

This statement makes the man walk:
call #walk, m
-- "Animal walking with 2 legs"

This statement makes the man run:
set msg = #run
call msg, m
-- "Man running with 2 legs and rock"

This statement creates a second instance of the parent script:
set m2 = new(script "man")

This statement sends a message to both instances of the parent script:
call msg, [m, m2]
-- "Man running with 2 legs "
-- "Man running with 2 legs "

call

251
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/call.js`
- **Test**: `apps/client/src/director/api/__tests__/call.test.js`
- **Dependencies**: Various (depends on function)

