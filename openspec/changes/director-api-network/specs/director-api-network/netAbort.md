## netAbort

**Source**: `docs/drmx2004_scripting_ref.txt` lines 21212-21240

### Usage
```lingo

```

### Description
Command; cancels a network operation without waiting for a result.
Using a network ID is the most efficient way to stop a network operation. The ID is returned
when you use a network function such as getNetText() or postNetText().
In some cases, when a network ID is not available, you can use a URL to stop the transmission of
data for that URL. The URL must be identical to that used to begin the network operation. If the
data transmission is complete, this command has no effect.

### Parameters
URL Required. Specifies the URL to cancel.
netID Optional. Specifies the ID of the network operation to cancel.

### Example
```lingo
This statement passes a network ID to netAbort to cancel a particular network operation:
-- Lingo syntax
on mouseUp
netAbort(myNetID)
end
// JavaScript syntax
function mouseUp() {
netAbort(myNetID);
}
```

### See also
getNetText(), postNetText

### Implementation
- **File**: `apps/client/src/director/api/netAbort.js`
- **Test**: `apps/client/src/director/api/__tests__/netAbort.test.js`
- **Dependencies**: None (pure function)

