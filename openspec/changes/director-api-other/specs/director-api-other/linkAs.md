## linkAs()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 19904-19923

### Usage
```lingo

```

### Description
Script cast member function; opens a save dialog box, allowing you to save the contents of the
script to an external file. The script cast member is then linked to that file.
Linked scripts are imported into the movie when you save it as a projector or a movie with
Shockwave content. This differs from other linked media, which remains external to the movie
unless you explicitly import it.

### Parameters
None.

### Example
```lingo
These statements, typed in the Message window, opens a Save dialog box to save the script
Random Motion as an external file:
member("Random Motion").linkAs()
importFileInto, linked
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/linkAs.js`
- **Test**: `apps/client/src/director/api/__tests__/linkAs.test.js`
- **Dependencies**: Various (depends on function)

