## symbol()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 28701-28729

### Usage
```lingo
symbol(stringValue)
symbol(stringValue);
```

### Description
Top level function; takes a string and returns a symbol.

### Parameters
stringValue Required. The string to convert to a symbol.

### Example
```lingo
This statement displays the symbol #hello:
--Lingo syntax
put(symbol("hello"))
// JavaScript syntax
put(symbol("hello"));

This statement displays the symbol #goodbye:
--Lingo syntax
x = "goodbye"
put(symbol(x))
// JavaScript syntax
var x = "goodbye";
put(symbol(x));
```

### See also
value(), string()

### Implementation
- **File**: `apps/client/src/director/api/symbol.js`
- **Test**: `apps/client/src/director/api/__tests__/symbol.test.js`
- **Dependencies**: None (pure function)

