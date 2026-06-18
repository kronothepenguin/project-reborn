## symbolP()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 28730-28751

### Usage
```lingo

```

### Description
Function; determines whether a specified expression is a symbol (TRUE) or not (FALSE).
The P in symbolP stands for predicate.

### Parameters
expression Required. Specifies the expression to test.

symbolP()

559

### Example
```lingo
This statement checks whether the variable myVariable is a symbol:
put myVariable.symbolP
```

### See also
ilk()

### Implementation
- **File**: `apps/client/src/director/api/symbolP.js`
- **Test**: `apps/client/src/director/api/__tests__/symbolP.test.js`
- **Dependencies**: None (pure function)

