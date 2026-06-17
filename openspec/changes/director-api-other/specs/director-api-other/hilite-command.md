## hilite (command)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 18338-18363

### Usage
```lingo

```

### Description
Command; highlights (selects) in the field sprite the specified chunk, which can be any chunk
that Lingo lets you define, such as a character, word, or line. On the Macintosh, the highlight
color is set in the Color control panel.

### Parameters
None.

### Example
```lingo
This statement highlights the fourth word in the field cast member Comments, which contains
the string Thought for the Day:
member("Comments").word[4].hilite()

This statement causes highlighted text within the sprite for field myRecipes to be displayed
without highlighting:
myLineCount = member("myRecipes").line.count
member("myRecipes").line[myLineCount + 1].hilite()
```

### See also
char...of, item...of, line...of, word...of, delete(), mouseChar, mouseLine,
mouseWord, field, selection() (function), selEnd, selStart

### Implementation
- **File**: `apps/client/src/director/api/hilite-command.js`
- **Test**: `apps/client/src/director/api/__tests__/hilite-command.test.js`
- **Dependencies**: Various (depends on function)

