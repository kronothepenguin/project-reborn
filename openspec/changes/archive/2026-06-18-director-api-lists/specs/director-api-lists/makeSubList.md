## makeSubList()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 20182-20207

### Usage
```lingo

```

### Description
Function; returns a property list from a child node the same way that makeList() returns the
root of an XML document in list format.

### Parameters
None.

### Example
```lingo
Beginning with the following XML:
<?xml version="1.0"?>
<e1>
<tagName attr1="val1" attr2="val2"/>
<e2>element 2</e2>
<e3>element 3</e3>
</e1>

This statement returns a property list made from the contents of the first child of the tag <e1>:
put gparser.child[ 1 ].child[ 1 ].makeSubList()
-- ["tagName": ["!ATTRIBUTES": ["attr1": "val1", "attr2": "val2"]]]
```

### See also
makeList()

### Implementation
- **File**: `apps/client/src/director/api/makeSubList.js`
- **Test**: `apps/client/src/director/api/__tests__/makeSubList.test.js`
- **Dependencies**: director-core-list, director-core-proplist

