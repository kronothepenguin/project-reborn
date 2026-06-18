## last()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 19730-19760

### Usage
```lingo

```

### Description
Function; identifies the last chunk in a chunk expression.
Chunk expressions refer to any character, word, item, or line in a container of character.
Supported containers are field cast members, variables that hold strings, and specified characters,
words, items, lines, and ranges within containers.

### Parameters
chunkExpression Required. Specifies the chunk expression that contains the last chunk.

### Example
```lingo
This statement identifies the last word of the string “Macromedia, the multimedia company” and
displays the result in the Message window:
put the last word of "Macromedia, the multimedia company"

The result is the word company.
This statement identifies the last character of the string “Macromedia, the multimedia company”
and displays the result in the Message window:
put last char("Macromedia, the multimedia company")

The result is the letter y.
```

### See also
char...of, word...of

last()

379

### Implementation
- **File**: `apps/client/src/director/api/last.js`
- **Test**: `apps/client/src/director/api/__tests__/last.test.js`
- **Dependencies**: Various (depends on function)

