## getFrameLabel()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 17141-17175

### Usage
```lingo

```

### Description
Function; returns the frame label within a Flash movie that is associated with the frame number
requested. If the label doesn’t exist, or that portion of the Flash movie has not yet been streamed
in, this function returns an empty string.

### Parameters
whichFlashFrameNumber Required. Specifies the frame number that is associated with the

frame label.

### Example
```lingo
The following handler looks to see if the marker on frame 15 of the Flash movie playing in sprite
1 is called "Lions". If it is, the Director movie navigates to frame "Lions". If it isn’t, the Director
movie stays in the current frame and the Flash movie continues to play.
-- Lingo syntax
on exitFrame
if sprite(1).getFrameLabel(15) = "Lions" then
go "Lions"
else
go the frame
end if
end
// JavaScript syntax
function exitFrame() {
if (sprite(1).getFrameLabel(15) == "Lions") {
_movie.go("Lions");
} else {
_movie.go(_movie.frame);
}
}
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/getFrameLabel.js`
- **Test**: `apps/client/src/director/api/__tests__/getFrameLabel.test.js`
- **Dependencies**: Various (depends on function)

