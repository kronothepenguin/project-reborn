## min

**Source**: `docs/drmx2004_scripting_ref.txt` lines 20636-20662

### Usage
```lingo

```

### Description
Function (Lingo only); specifies the minimum value in a list.

### Parameters
a1, a2, a3, ... Optional. A list of values from which the lowest value is chosen.

### Example
```lingo
The following handler assigns the variable vLowest the minimum value in the list bids, which
consists of [#Castle:600, #Shields:750, #Wang:230]. The result is then inserted in the content of
the field cast member Sorry:
on findLowest bids
vLowest = bids.min()
member("Sorry").text = \
"We're sorry, your bid of $" & vLowest && "is not a winner!"
end
```

### See also
max()

398

Chapter 12: Methods

### Implementation
- **File**: `apps/client/src/director/api/min.js`
- **Test**: `apps/client/src/director/api/__tests__/min.test.js`
- **Dependencies**: None (pure function)

