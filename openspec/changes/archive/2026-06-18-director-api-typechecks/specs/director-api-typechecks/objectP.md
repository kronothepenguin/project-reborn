## objectP()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 22400-22433

### Usage
```lingo

```

### Description
Function; indicates whether a specified expression is an object produced by a parent script, Xtra,
or window (TRUE) or not (FALSE).
The P in objectP stands for predicate.
It is good practice to use objectP to determine which items are already in use when you create
objects by parent scripts or Xtra instances.
To see an example of objectP() used in a completed movie, see the Read and Write Text movie
in the Learning/Lingo folder inside the Director application folder.

### Parameters
expression Required. Specifies the expression to test.

### Example
```lingo
This Lingo checks whether the global variable gDataBase has an object assigned to it and, if not,
assigns one. This check is commonly used when you perform initializations at the beginning of a
movie or section that you don’t want to repeat.
-- Lingo syntax
if objectP(gDataBase) then
nothing
else
gDataBase = script("Database Controller").new()
end if
// JavaScript syntax
if (objectP(gDataBase)) {
// do nothing
} else {
gDataBase = script("Database Controller").new();
}
```

### See also
floatP(), ilk(), integerP(), stringP(), symbolP()

### Implementation
- **File**: `apps/client/src/director/api/objectP.js`
- **Test**: `apps/client/src/director/api/__tests__/objectP.test.js`
- **Dependencies**: None (pure function)

