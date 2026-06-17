## abs()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 11767-11797

### Usage
```lingo
abs (numericExpression)
Math.abs (numericExpression)
```

### Description
Math function (Lingo only); calculates the absolute value of a numerical expression.
The abs() function has several uses. It can simplify the tracking of mouse and sprite movement
by converting coordinate differences (which can be either positive or negative numbers) into
distances (which are always positive numbers). The abs() function is also useful for handling
mathematical functions, such as sqrt() and log().
In JavaScript syntax, use the Math object’s abs() function.

### Parameters
numericExpression Required. An integer or floating-point number from which an absolute
value is calculated. If numericExpression is an integer, the absolute value is also an integer. If
numericExpression is a floating-point number, the absolute value is also a floating-point
number.

### Example
```lingo
This statement determines whether the absolute value of the difference between the current
mouse position and the value of the variable startV is greater than 30 (since you wouldn’t want
to use a negative number for distance). If it is, the foreground color of sprite 6 is changed.
-- Lingo syntax
if (the mouseV - startV).abs > 30 then sprite(6).forecolor = 95
// JavaScript syntax
if ((_mouse.mouseV - Math.abs(_mouse.startV)) > 30) {
sprite(6).foreColor = 95;
}
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/abs.js`
- **Test**: `apps/client/src/director/api/__tests__/abs.test.js`
- **Dependencies**: None (pure function)

