## mergeDisplayTemplate()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 20483-20512

### Usage
```lingo
_movie.mergeDisplayTemplate(propList)
_movie.mergeDisplayTemplate(propList);
```

### Description
Movie method; merges an arbitrary number of display template properties into the existing set of
display template properties all at once.

### Parameters
propList Required. A property list that contains the display template properties to merge into
the existing set of display template properties. In Lingo, propList can be either a comma-

separated list of name/value pairs or a comma-separated list of symbol/value pairs. In JavaScript
syntax, propList can only be a comma-separated list of name/value pairs.

### Example
```lingo
This statement merges a value for the title property into the displayTemplate:
-- Lingo syntax
_movie.mergeDisplayTemplate(propList(#title, "Welcome!"))
// JavaScript syntax
_movie.mergeDisplayTemplate(propList("title", "Welcome!"))
```

### See also
appearanceOptions, displayTemplate, Movie, propList(), titlebarOptions

mergeDisplayTemplate()

395

### Implementation
- **File**: `apps/client/src/director/api/mergeDisplayTemplate.js`
- **Test**: `apps/client/src/director/api/__tests__/mergeDisplayTemplate.test.js`
- **Dependencies**: Various (depends on function)

