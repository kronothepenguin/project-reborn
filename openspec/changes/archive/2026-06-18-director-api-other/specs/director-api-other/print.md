## print()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 24377-24401

### Usage
```lingo
spriteObjRef.print({targetName, #printingBounds})
spriteObjRef.print({targetName, #printingBounds});
```

### Description
Command; calls the corresponding print ActionScript command, which was introduced in
Flash 5. All frames in the Flash movie that have been labeled #p are printed. If no individual
frames have been labeled, the whole movie prints.
Because printing of Flash movies is rather complicated, you may benefit from reviewing the
section about printing in the Flash 5 documentation before using this sprite function.

### Parameters
targetName Optional. Specifies the name of the target movie or movie clip to be printed. If
omitted (if the target is 0), then the main Flash movie is printed.
printingBounds Optional. Specifies the options for the printing bounds. If omitted, the bounds
of the target movie are used. If specified, printingBounds must be one of the following values:

• #bframe. If specified, then the printing bounds for each page are changed to match each frame
that is being printed.

• #bmax. If specified, then the printing bounds become a large enough virtual rectangle to fit all
frames to be printed.

### Example
```lingo

```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/print.js`
- **Test**: `apps/client/src/director/api/__tests__/print.test.js`
- **Dependencies**: Various (depends on function)

