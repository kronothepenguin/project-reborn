## script()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 26746-26783

### Usage
```lingo
script(memberNameOrNum {, castNameOrNum})
script(memberNameOrNum {, castNameOrNum});
```

### Description
Top level function; creates a reference to a given cast member that contains a script, and
optionally specifies the cast library that contains the member.
An error is returned if the given cast member does not contain a script, or if the given cast
member does not exist.

### Parameters
memberNameOrNum Required. A string that specifies the name of the cast member that contains a
script, or an integer that specifies the index position of the cast member that contains a script.
castNameOrNum Optional. A string that specifies the name of the cast library that contains the
member memberNameOrNum, or an integer that specifies the index position of the cast library that
contains the member memberNameOrNum. If omitted, script() searches the first cast library.

518

Chapter 12: Methods

### Example
```lingo
In Lingo only, these statements check whether a child object is an instance of the parent script
Warrior Ant:
-- Lingo syntax
if (bugObject.script = script("Warrior Ant")) then
bugObject.attack()
end if

This statement sets the variable actionMember to the script cast member Actions:
-- Lingo syntax
actionMember = script("Actions")
// JavaScript syntax
var actionMember = script("Actions");
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/script.js`
- **Test**: `apps/client/src/director/api/__tests__/script.test.js`
- **Dependencies**: director-core-member-ref, director-core-sprite-ref, director-core-cast-library-ref

