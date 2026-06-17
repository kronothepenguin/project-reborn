## clearAsObjects()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 13358-13397

### Usage
```lingo
clearAsObjects()
clearAsObjects();
```

### Description
Command; resets the global Flash Player used for ActionScript objects and removes any
ActionScript objects from memory. The command does not clear or reset references to those
objects stored in Lingo. Lingo references will persist but will refer to nonexistent objects. You
must set each reference to VOID individually.
The clearAsObjects() command affects only global objects, such as the array created in
this statement:
-- Lingo syntax
myGlobalArray = newObject(#array)
// JavaScript syntax
myGlobalArray = new Array();

The clearAsObjects() command has no effect on objects created within sprite references, such
as the following:
myArray = sprite(2).newObject(#array)

260

Chapter 12: Methods

### Parameters
None.

### Example
```lingo
This statement clears all globally created ActionScript objects from memory:
-- Lingo syntax
clearAsObjects()
// JavaScript syntax
clearAsObjects();
```

### See also
newObject(), setCallback()

### Implementation
- **File**: `apps/client/src/director/api/clearAsObjects.js`
- **Test**: `apps/client/src/director/api/__tests__/clearAsObjects.test.js`
- **Dependencies**: Various (depends on function)

