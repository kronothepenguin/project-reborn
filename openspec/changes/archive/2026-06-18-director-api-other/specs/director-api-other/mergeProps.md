## mergeProps()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 20513-20544

### Usage
```lingo
windowObjRef.mergeProps(propList)
windowObjRef.mergeProps(propList);
```

### Description
Windows method. Merges an arbitrary number of window properties, all at once, into the
existing set of window properties.

### Parameters
propList Required. A set of window properties to merge into the existing set of window
properties. The properties are specified by the appearanceOptions and titlebarOptions

properties.

• In Lingo, propList can be either a comma-separated list of name/value pairs or a commaseparated list of symbol/value pairs.
• In JavaScript syntax, propList can only be a comma-separated list of name/value pairs.

### Example
```lingo
This statement sets various properties for the window named Cars.
-- Lingo syntax
window("Cars").mergeProps([#title:"Car pictures", #resizable:FALSE, \
#titlebarOptions:[#closebox:TRUE, #icon:member(2)], \
#appearanceOptions:[#border:#line, #shadow:TRUE]])
// JavaScript syntax
window("Cars").mergeProps(propList("title","Car pictures", "resizable",false,
"titlebarOptions",propList("closebox",true, "icon",member(2)),
"appearanceOptions",propList("border","line", "shadow",true)));
```

### See also
appearanceOptions, titlebarOptions, Window

### Implementation
- **File**: `apps/client/src/director/api/mergeProps.js`
- **Test**: `apps/client/src/director/api/__tests__/mergeProps.test.js`
- **Dependencies**: Various (depends on function)

