## param()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 22659-22703

### Usage
```lingo

```

### Description
Function; provides the value of a parameter passed to a handler.
To avoid errors in a handler, this function can be used to determine the type of a particular
parameter.

### Parameters
parameterPosition Required. Specifies the parameter’s position in the arguments passed to

a handler.

### Example
```lingo
This handler accepts any number of arguments, adds all the numbers passed in as parameters, and
then returns the sum:
--Lingo syntax
on AddNumbers
sum = 0
repeat with currentParamNum = 1 to the paramCount
sum = sum + param(currentParamNum)
end repeat
return sum
end
// JavaScript syntax
function AddNumbers() {
sum = 0;
for (currentParamNum=1;currentParamNum<=paramCount;currentParamNum++) {
sum = sum + param(currentParamNum);
}
return sum;
}

438

Chapter 12: Methods

You would use it by passing in the values you wanted to add:
put AddNumbers(3, 4, 5, 6)
-- 18
put AddNumbers(5, 5)
-- 10
```

### See also
getAt, param(), paramCount(), return (keyword)

### Implementation
- **File**: `apps/client/src/director/api/param.js`
- **Test**: `apps/client/src/director/api/__tests__/param.test.js`
- **Dependencies**: Various (depends on function)

