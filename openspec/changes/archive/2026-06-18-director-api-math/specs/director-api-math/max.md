## max()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 20350-20387

### Usage
```lingo

```

### Description
Function (Lingo only); returns the highest value in the specified list or the highest of a given series
of values.
The max function also works with ASCII characters, similar to the way < and > operators work
with strings.

### Parameters
value1, value2, value3, ... Optional. A list of values from which the highest value

is chosen.

### Example
```lingo
The following handler assigns the variable Winner the maximum value in the list Bids, which
consists of [#Castle:600, #Schmitz:750, #Wang:230]. The result is then inserted into the content
of the field cast member Congratulations.

392

Chapter 12: Methods

-- Lingo syntax
on findWinner Bids
Winner = Bids.max()
member("Congratulations").text = \
"You have won, with a bid of $" & Winner &"!"
end
// JavaScript syntax
function findWinner(Bids) {
Winner = Bids.max();
member("Congratulations").text = "You have won, with a bid of $" + \
Winner + "!");
}
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/max.js`
- **Test**: `apps/client/src/director/api/__tests__/max.test.js`
- **Dependencies**: None (pure function)

