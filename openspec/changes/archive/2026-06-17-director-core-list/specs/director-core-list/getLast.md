## getLast()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 17236-17254

### Usage
```lingo

```

### Description
List function; identifies the last value in a linear or property list specified by list.

### Parameters
None.

### Example
```lingo
This statement identifies the last item, 22, in the list Answers, which consists of [10, 12, 15, 22]:
put Answers.getLast()

This statement identifies the last item, 850, in the list Bids, which consists of [#Gee:750,
#Kayne:600, #Ohashi:850]:
put Bids.getLast()
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/core/list.js`
- **Test**: `apps/client/src/director/core/__tests__/list.test.js`
- **Dependencies**: None (part of List class)

