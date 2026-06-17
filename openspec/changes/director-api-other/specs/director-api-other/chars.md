## chars()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 13266-13308

### Usage
```lingo

```

### Description
Function (Lingo only); identifies a substring of characters in an expression.
The expressions firstCharacter and lastCharacter must specify a position in the string.
If firstCharacter and lastCharacter are equal, then a single character is returned from the
string. If lastCharacter is greater than the string length, only a substring up to the length of the
string is identified. If lastCharacter is before firstCharacter, the function returns the value
EMPTY.
To see an example of chars() used in a completed movie, see the Text movie in the Learning/
Lingo folder inside the Director application folder.
In JavaScript syntax, use the String object’s substr() function.

258

Chapter 12: Methods

### Parameters
stringExpression Required. A string that specifies the expression from which a substring is

returned.
firstCharacter Required. An integer that specifies the point at which the substring starts.
lastCharacter Required. An integer that specifies the point at which the substring ends.

### Example
```lingo
This statement identifies the sixth character in the word Macromedia:
put chars("Macromedia", 6, 6)
-- "m"

This statement identifies the sixth through tenth characters of the word Macromedia:
put chars("Macromedia", 6, 10)
-- "media"

The following statement tries to identify the sixth through twentieth characters of the word
Macromedia. Because the word has only 10 characters, the result includes only the sixth through
tenth characters.
put chars ("Macromedia", 6, 20)
-- "media"
```

### See also
char...of, length(), offset() (string function), number (characters)

### Implementation
- **File**: `apps/client/src/director/api/chars.js`
- **Test**: `apps/client/src/director/api/__tests__/chars.test.js`
- **Dependencies**: Various (depends on function)

