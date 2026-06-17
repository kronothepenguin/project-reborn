## random()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 25301-25358

### Usage
```lingo
random(integerExpression)
random(integerExpression);
```

### Description
Top level function; returns a random integer in the range 1 to a specified value. This function can
be used to vary values in a movie, such as to vary the path through a game, assign random
numbers, or change the color or position of sprites.
To start a set of possible random numbers with a number other than 1, subtract the appropriate
amount from the random() function. For example, the expression random(n + 1) - 1 uses a
range from 0 to the number n.

### Parameters
integerExpression Required. Specifies the maximum value of the random number.

### Example
```lingo
This statement assigns random values to the variable diceRoll:
-- Lingo syntax
diceRoll = (random(6) + random(6))
// JavaScript syntax
var diceRoll = (random(6) + random(6));

This statement randomly changes the foreground color of sprite 10:
-- Lingo syntax
sprite(10).foreColor = (random(256) - 1)
// JavaScript syntax
sprite(10).foreColor = (random(256) - 1);

random()

489

This handler randomly chooses which of two movie segments to play:
-- Lingo syntax
on SelectScene
if (random(2) = 2) then
_movie.go("11a")
else
_movie.go("11b")
end if
end
// JavaScript syntax
function SelectScene() {
if (random(2) == 1) {
_movie.go("11a");
} else {
_movie.go("11b");
}
}

This statement produces a random multiple of 5 in the range 5 to 100:
-- Lingo syntax
theScore = (5 * random(20))
// JavaScript syntax
var theScore = (5 * random(20));
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/random.js`
- **Test**: `apps/client/src/director/api/__tests__/random.test.js`
- **Dependencies**: None (pure function)

