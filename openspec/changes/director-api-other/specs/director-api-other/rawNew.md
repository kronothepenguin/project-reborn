## rawNew()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 25417-25445

### Usage
```lingo

```

### Description
Function; creates a child object from a parent script without calling its on new handler. This
allows a movie to create child objects without initializing the properties of those child objects.
This is particularly useful when you want to create large numbers of child objects for later use. To
initialize the properties of one of these raw child objects, call its on new handler.

rawNew()

491

### Parameters
None.

### Example
```lingo
This statement creates a child object called RedCar from the parent script CarParentScript
without initializing its properties:
RedCar = script("CarParentScript").rawNew()

This statement initializes the properties of the child object RedCar:
RedCar.new()
```

### See also
new(), script()

### Implementation
- **File**: `apps/client/src/director/api/rawNew.js`
- **Test**: `apps/client/src/director/api/__tests__/rawNew.test.js`
- **Dependencies**: Various (depends on function)

