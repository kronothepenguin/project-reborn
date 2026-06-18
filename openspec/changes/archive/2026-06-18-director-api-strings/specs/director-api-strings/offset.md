## offset() (string function)

**Source**: `docs/drmx2004_scripting_ref.txt` lines 22434-22501

### Usage
```lingo

```

### Description
Function; returns an integer indicating the position of the first character of a string in another
string. This function returns 0 if the first string is not found in the second string. Lingo counts
spaces as characters in both strings.
On the Macintosh, the string comparison is not sensitive to case or diacritical marks. For
example, Lingo considers a and Å to be the same character on the Macintosh.

offset() (string function)

433

### Parameters
stringExpression1 Required. Specifies the sub-string to search for in stringExpression2.
stringExpression2 Required. Specifies the string that contains the sub-string
stringExpression1.

### Example
```lingo
This statement displays in the Message window the beginning position of the string “media”
within the string “Macromedia”:
put offset("media","Macromedia")

The result is 6.
This statement displays in the Message window the beginning position of the string “Micro”
within the string “Macromedia”:
put offset("Micro", "Macromedia")

The result is 0, because “Macromedia” doesn’t contain the string “Micro”.
This handler finds all instances of the string represented by stringToFind within the string
represented by input and replaces them with the string represented by stringToInsert:
-- Lingo syntax
on SearchAndReplace input, stringToFind, stringToInsert
output = ""
findLen = stringToFind.length - 1
repeat while input contains stringToFind
currOffset = offset(stringToFind, input)
output = output & input.char [1..currOffset]
delete the last char of output
output = output & stringToInsert
delete input.char [1.. (currOffset + findLen)]
end repeat
set output = output & input
return output
end
// JavaScript syntax
function SearchAndReplace(input, stringToFind, stringToInsert) {
output = "";
findLen = stringToFind.length - 1;
do {
currOffset = offset(stringToFind, input);
output = output + input.char[0..currOffset];
output = output.substr(0,output.length-2);
output = output + stringToInsert;
input = input.substr(currOffset+findLen,input.length);
} while (input.indexOf(stringToFind) >= 0);
output = output + input;
return output;
}
```

### See also
chars(), length(), contains, starts

434

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/offset.js`
- **Test**: `apps/client/src/director/api/__tests__/offset.test.js`
- **Dependencies**: None (pure function)

