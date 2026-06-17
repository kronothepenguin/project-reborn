## freeBytes()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 16702-16729

### Usage
```lingo

```

### Description
Function; indicates the total number of bytes of free memory, which may not be contiguous. A
kilobyte (K) is 1024 bytes. A megabyte (MB) is 1024 kilobytes.
This function differs from freeBlock in that it reports all free memory, not just
contiguous memory.
On the Macintosh, selecting Use System Temporary Memory in the Director General Preferences
or in a projector’s Options dialog box tells the freeBytes function to return all the free memory
that is available to the application. This amount equals the application’s allocation shown in its
Get Info dialog box and the Largest Unused Block value in the About This Macintosh dialog box.

### Parameters
None.

### Example
```lingo
This statement checks whether more than 200K of memory is available and plays a color movie
if it is:
if (the freeBytes > (200 * 1024)) then play movie "colorMovie"
```

### See also
freeBlock(), memorySize, objectP(), ramNeeded(), size

freeBytes()

323

### Implementation
- **File**: `apps/client/src/director/api/freeBytes.js`
- **Test**: `apps/client/src/director/api/__tests__/freeBytes.test.js`
- **Dependencies**: Various (depends on function)

