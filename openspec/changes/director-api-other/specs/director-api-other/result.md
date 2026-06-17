## result

**Source**: `docs/drmx2004_scripting_ref.txt` lines 26240-26277

### Usage
```lingo

```

### Description
Function; displays the value of the return expression from the last handler executed.
The result function is useful for obtaining values from movies that are playing in windows
and tracking Lingo’s progress by displaying results of handlers in the Message window as
the movie plays.
To return a result from a handler, assign the result to a variable and then check the variable’s
value. Use a statement such as set myVariable = function(), where function() is the name
of a specific function.

### Parameters
None.

### Example
```lingo
This handler returns a random roll for two dice:
on diceRoll
return random(6) + random(6)
end

508

Chapter 12: Methods

In the following example, the two statements
diceRoll
roll = the result

are equivalent to this statement:
set roll = diceRoll()

The statement set roll = diceRoll would not call the handler because there are no
parentheses following diceRoll; diceRoll here is considered a variable reference.
```

### See also
return (keyword)

### Implementation
- **File**: `apps/client/src/director/api/result.js`
- **Test**: `apps/client/src/director/api/__tests__/result.test.js`
- **Dependencies**: Various (depends on function)

