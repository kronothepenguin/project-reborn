## setScriptList()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 27626-27645

### Usage
```lingo

```

### Description
This command sets the scriptList of the given sprite. The scriptList indicates which scripts
are attached to the sprite and what the settings of each script property are. By setting this list, you
can change which behaviors are attached to a sprite or change the behavior properties.
The list takes the form:
[ [ (whichBehaviorMember), " [ #property1: value, #property2: value, . . . ] ",
[(whichBehaviorMember), " [ #property1: value, #property2: value, . . . ] " ] ]

This command cannot be used during a score recording session. Use setScriptList() for
sprites added during score recording after the score recording session has ended.

### Parameters
scriptList Required. Specifies the script list for a given sprite.

### Example
```lingo

```

### See also
scriptList, value(), string()

### Implementation
- **File**: `apps/client/src/director/api/setScriptList.js`
- **Test**: `apps/client/src/director/api/__tests__/setScriptList.test.js`
- **Dependencies**: Various (depends on function)

