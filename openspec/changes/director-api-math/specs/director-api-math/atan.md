## atan()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 12353-12395

### Usage
```lingo
(number).atan
atan (number)
Math.atan(number);
```

### Description
Math function (Lingo only); calculates the arctangent, which is the angle whose tangent is a
specified number. The result is a value in radians between pi/2 and +pi/2.
In JavaScript syntax, use the Math object’s atan() function.

### Parameters
None.

240

Chapter 12: Methods

### Example
```lingo
This statement displays the arctangent of 1:
(1).atan

The result, to four decimal places, is 0.7854, or approximately pi/4.
Most trigonometric functions use radians, so you may want to convert from degrees to radians.
This handler lets you convert between degrees and radians:
-- Lingo syntax
on DegreesToRads degreeValue
return degreeValue * PI/180
end
// JavaScript syntax
function DegreesToRads(degreeValue) {
return degreeValue * PI/180
}

The handler displays the conversion of 30 degrees to radians in the Message window:
put DegreesToRads(30)
-- 0.5236
```

### See also
cos(), PI, sin()

### Implementation
- **File**: `apps/client/src/director/api/atan.js`
- **Test**: `apps/client/src/director/api/__tests__/atan.test.js`
- **Dependencies**: None (pure function)

