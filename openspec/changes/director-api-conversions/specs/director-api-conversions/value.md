## value()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 29543-29607

### Usage
```lingo

```

### Description
Function; returns the value of a string. When value() is called, Lingo parses through the
stringExpression provided and returns its logical value.
Any Lingo expression that can be put in the Message window or set as the value of a variable can
also be used with value().
These two Lingo statements are equivalent:
put sprite(2).member.duration * 5
put value("sprite(2).member.duration * 5")

576

Chapter 12: Methods

These two Lingo statements are also equivalent:
x = (the mouseH - 10) / (the mouseV + 10)
x = value("(the mouseH - 10) / (the mouseV + 10)")

Expressions that Lingo cannot parse will produce unexpected results, but will not produce Lingo
errors. The result is the value of the initial portion of the expression up to the first syntax error
found in the string.
The value() function can be useful for parsing expressions input into text fields by end-users,
string expressions passed to Lingo by Xtra extensions, or any other expression you need to convert
from a string to a Lingo value.
Keep in mind that there may be some situations where using value() with user input can be
dangerous, such as when the user enters the name of a custom handler into the field. This will
cause the handler to be executed when it is passed to value().
Do not confuse the actions of the value function with the integer() and float() functions.

### Parameters
stringExpression Required. Specifies the string from which a value is returned. The string can

be any expression that Lingo can understand.

### Example
```lingo
This statement displays the numerical value of the string "the sqrt of" && "2.0":
put value("the sqrt of" && "2.0")

The result is 1.4142.
This statement displays the numerical value of the string “penny”:
put value("penny")

The resulting display in the Message window is VOID, because the word penny has no
numerical value.
You can convert a string that is formatted as a list into a true list by using this syntax:
myString = "[" & QUOTE & "cat" & QUOTE & ", " & QUOTE & "dog" & QUOTE & "]"
myList = value(myString)
put myList
-- ["cat", "dog"]

This allows a list to be placed in a field or text cast member and then extracted and easily
reformatted as a list.
This statement parses the string "3 5" and returns the value of the portion of the string that Lingo
understands:
put value("3 5")
-- 3
```

### See also
string(), integer(), float()

value()

577

### Implementation
- **File**: `apps/client/src/director/api/value.js`
- **Test**: `apps/client/src/director/api/__tests__/value.test.js`
- **Dependencies**: None (pure function)

