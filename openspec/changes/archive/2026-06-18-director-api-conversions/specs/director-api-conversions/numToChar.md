## numToChar()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 22342-22399

### Usage
```lingo

```

### Description
Function; displays a string containing the single character whose ASCII number is the value of a
specified expression. This function is useful for interpreting data from outside sources that are
presented as numbers rather than as characters.
ASCII values up to 127 are standard on all computers. Values of 128 or greater refer to different
characters on different computers.

### Parameters
integerExpression Required. Specifies the ASCII number whose corresponding character

is returned.

### Example
```lingo
This statement displays in the Message window the character whose ASCII number is 65:
put numToChar(65)

The result is the letter A.
This handler removes any nonalphabetic characters from any arbitrary string and returns only
capital letters:
-- Lingo syntax
on ForceUppercase input
output = EMPTY
num = length(input)
repeat with i = 1 to num
theASCII = charToNum(input.char[i])
if theASCII = min(max(96, theASCII), 123) then
theASCII = theASCII - 32
if theASCII = min(max(63, theASCII), 91) then
put numToChar(theASCII) after output
end if
end if
end repeat
return output
end
// JavaScript syntax
function ForceUpperCase(input) {
output = "";
num = input.length;
for (i=1;i<=num;i++) {
theASCII = input.char[i].charToNum();
if (theASCII == min(max(96, theASCII), 123) {
theASCII = theASCII - 32;
if (theASCII == min(max(63, theASCII), 91) {
output = output + theASCII.numToChar();
}
}
}
return output;
}
```

### See also
charToNum()
432

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/numToChar.js`
- **Test**: `apps/client/src/director/api/__tests__/numToChar.test.js`
- **Dependencies**: None (pure function)

