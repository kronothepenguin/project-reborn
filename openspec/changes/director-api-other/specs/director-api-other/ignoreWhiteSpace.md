## ignoreWhiteSpace()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 18581-18643

### Usage
```lingo

```

### Description
XML Command; specifies whether the parser should ignore or retain white space when
generating a Lingo list. When ignoreWhiteSpace() is set to TRUE (the default), the parser
ignores white space.When set to FALSE, the parser will retain white space and treat it as
actual data.
If an element has separate beginning and ending tags, such as <sample> </sample>, character
data within the element will be ignored if, and only if, it is composed of white space only. If there
is any non-white space, or if ignoreWhiteSpace() is set to FALSE, there will be a CDATA node
with the exact text, including any white space.

### Parameters
trueOrFalse Required. A value that specifies whether the parser should ignore white space
(TRUE) or not (FALSE).

360

Chapter 12: Methods

### Example
```lingo
These Lingo statements leave ignoreWhiteSpace() set to the default of TRUE and parse the given
XML into a list. The element <sample> has no children in the list.
XMLtext = "<sample> </sample>"
parserObj.parseString(XMLtext)
theList = parserObj.makelist()
put theList
-- ["ROOT OF XML DOCUMENT": ["!ATTRIBUTES": [:], "sample": ["!ATTRIBUTES":
[:]]]]

These Lingo statements set ignoreWhiteSpace() to FALSE and then parse the given XML into a
list. The element <sample> now has a child containing one space character.
XMLtext = "<sample> </sample>"
parserObj.ignorewhitespace(FALSE)
parserObj.parseString(XMLtext)
theList = parserObj.makelist()
put theList
-- ["ROOT OF XML DOCUMENT": ["!ATTRIBUTES": [:], "sample": ["!ATTRIBUTES":
[:], "!CHARDATA": " "]]]

These Lingo statements leave ignoreWhiteSpace() set to the default of TRUE and parse the
given XML. There is only one child node of the <sample> tag and only one child node of the
<sub> tag.
XMLtext = "<sample> <sub> phrase 1 </sub></sample>"
parserObj.parseString(XMLtext)
theList = parserObj.makeList()
put theList
-- ["ROOT OF XML DOCUMENT": ["!ATTRIBUTES": [:], "sample": ["!ATTRIBUTES":
[:], "sub": ["!ATTRIBUTES": [:], "!CHARDATA": " phrase 1 "]]]]

These Lingo statements set ignoreWhiteSpace() to FALSE and parse the given XML. There are
now two child nodes of the <sample> tag, the first one being a single space character.
XMLtext = "<sample> <sub> phrase 1 </sub></sample>"
gparser.ignoreWhiteSpace(FALSE)
gparser.parseString(XMLtext)
theList = gparser.makeList()
put theList
-- ["ROOT OF XML DOCUMENT": ["!ATTRIBUTES": [:], "sample": ["!ATTRIBUTES":
[:], "!CHARDATA": " ", "sub": ["!ATTRIBUTES": [:], "!CHARDATA": " phrase 1
"]]]]
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/ignoreWhiteSpace.js`
- **Test**: `apps/client/src/director/api/__tests__/ignoreWhiteSpace.test.js`
- **Dependencies**: Various (depends on function)

