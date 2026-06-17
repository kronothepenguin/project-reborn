## netDone()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 21241-21304

### Usage
```lingo

```

### Description
Function; indicates whether a background loading operation (such as getNetText,
preloadNetThing, gotoNetMovie, gotoNetPage, or netTextResult) is finished or was
terminated by a browser error (TRUE, default) or is still in progress (FALSE).

• Use netDone() to test the last network operation.
• Use netDone(netID) to test the network operation identified by netID.
The netDone function returns 0 when a background loading operation is in progress.

410

Chapter 12: Methods

### Parameters
netID Optional. Specifies the ID of the network operation to test.

### Example
```lingo
The following handler uses the netDone function to test whether the last network operation has
finished. If the operation is finished, text returned by netTextResult is displayed in the field cast
member Display Text.
-- Lingo syntax
on exitFrame
if netDone() = 1 then
member("Display Text").text = netTextResult()
end if
end
// JavaScript syntax
function exitFrame() {
if (netDone() == 1) {
member("Display Text").text = netTextResult();
}
}

This handler uses a specific network ID as an argument for netDone to check the status of a
specific network operation:
-- Lingo syntax
on exitFrame
-- stay on this frame until the net operation is
-- completed
global mynetID
if netDone(mynetID) = FALSE then
go to the frame
end if
end
// JavaScript syntax
function exitFrame() {
// stay on this frame until the net operation is completed
global mynetID;
if (!(netDone(mynetID))) {
_movie.go(_movie.frame);
}
}
```

### See also
getNetText(), netTextResult(), gotoNetMovie, preloadNetThing()

netDone()

411

### Implementation
- **File**: `apps/client/src/director/api/netDone.js`
- **Test**: `apps/client/src/director/api/__tests__/netDone.test.js`
- **Dependencies**: None (pure function)

