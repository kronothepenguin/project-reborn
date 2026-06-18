## freeBlock()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 16673-16701

### Usage
```lingo

```

### Description
Function; indicates the size of the largest free contiguous block of memory, in bytes. A kilobyte
(K) is 1024 bytes. A megabyte (MB) is 1024 kilobytes. Loading a cast member requires a free
block at least as large as the cast member.

### Parameters
None.

322

Chapter 12: Methods

### Example
```lingo
This statement determines whether the largest contiguous free block is smaller than 10K and
displays an alert if it is:
-- Lingo syntax
if (the freeBlock < (10 * 1024)) then alert "Not enough memory!"
// JavaScript syntax
if (freeBlock < (10 * 1024)) {
alert("Not enough memory!")
}
```

### See also
freeBytes(), memorySize, ramNeeded(), size

### Implementation
- **File**: `apps/client/src/director/api/freeBlock.js`
- **Test**: `apps/client/src/director/api/__tests__/freeBlock.test.js`
- **Dependencies**: Various (depends on function)

