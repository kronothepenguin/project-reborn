## charToNum()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 13309-13357

### Usage
```lingo

```

### Description
Function (Lingo only); returns the ASCII code that corresponds to the first character of an
expression.
The charToNum() function is especially useful for testing the ASCII value of characters created by
combining keys, such as the Control key and another alphanumeric key.
Director treats uppercase and lowercase letters the same if you compare them using the equal sign
(=) operator; for example, the statement put ("M" = "m") returns the result 1 or TRUE.
Avoid problems by using charToNum() to return the ASCII code for a character and then use the
ASCII code to refer to the character.
In JavaScript syntax, use the String object’s charCodeAt() function.

### Parameters
stringExpression Required. A string that specifies the expression to test.

charToNum()

259

### Example
```lingo
This statement displays the ASCII code for the letter A:
put ("A").charToNum
-- 65

The following comparison determines whether the letter entered is a capital A, and then navigates
to either a correct sequence or incorrect sequence in the Score:
-- Lingo syntax
on CheckKeyHit theKey
if (theKey).charToNum = 65 then
go "Correct Answer"
else
go "Wrong Answer"
end if
end
// JavaScript syntax
function CheckKeyHit(theKey) {
if (theKey.charToNum() == 65) {
go("Correct Answer");
} else {
go("Wrong Answer");
}
}
```

### See also
numToChar()

### Implementation
- **File**: `apps/client/src/director/api/charToNum.js`
- **Test**: `apps/client/src/director/api/__tests__/charToNum.test.js`
- **Dependencies**: None (pure function)

