## light()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 19832-19857

### Usage
```lingo

```

### Description
3D element; an object at a vector position from which light emanates.
For a complete list of light properties and commands, see the Using Director topics in the
Director Help Panel.

light()

381

### Parameters
None.

### Example
```lingo
This example shows the two ways of referring to a light. The first line uses a string in parentheses
and the second line uses the a number in brackets. The string is the light’s name and the number
is the position of the light in the cast member’s list of lights.
thisLight = member("3D World").light("spot01")
thisLight = member("3D World").light[2]
```

### See also
newLight, deleteLight

### Implementation
- **File**: `apps/client/src/director/api/light.js`
- **Test**: `apps/client/src/director/api/__tests__/light.test.js`
- **Dependencies**: Various (depends on function)

