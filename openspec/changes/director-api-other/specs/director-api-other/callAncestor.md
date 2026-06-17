## callAncestor

**Source**: `docs/drmx2004_scripting_ref.txt` lines 12958-13031

### Usage
```lingo

```

### Description
Command; sends a message to a child object’s ancestor script.
Ancestors can, in turn, have their own ancestors.
When you use callAncestor, the name of the handler can be a variable, and you can explicitly
bypass the handlers in the primary script and go directly to the ancestor script.

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
This example shows how a callAncestor statement can call handlers in the ancestor of a
behavior or parent script.

• This is the parent script:
-- script "man"
property ancestor
on new me, newTool
set ancestor = new(script "Animal", 2)
return me
end
on run me
put "Man running with "&the legCount of me&"legs"
end

• This is the ancestor script:
-- script "animal"
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

252

Chapter 12: Methods

This statement makes the man walk:
call #walk, m
-- "Animal walking with 2 legs"

This statement makes the man run:
set msg = #run
callAncestor msg, m
-- "Animal running with 2 legs"

This statement creates a second instance of the parent script:
set m2 = new(script "man")

This statement sends a message to the ancestor script for both men:
callAncestor #run,[m,m2]
-- "Animal running with 2 legs"
-- "Animal running with 2 legs"
```

### See also
ancestor, new()

### Implementation
- **File**: `apps/client/src/director/api/callAncestor.js`
- **Test**: `apps/client/src/director/api/__tests__/callAncestor.test.js`
- **Dependencies**: Various (depends on function)

