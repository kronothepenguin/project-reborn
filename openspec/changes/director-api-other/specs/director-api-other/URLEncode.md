## URLEncode

**Source**: `docs/drmx2004_scripting_ref.txt` lines 29512-29542

### Usage
```lingo

```

### Description
Function; returns the URL-encoded string for its first argument. Allows CGI parameters to be
used in other commands. The same translation is done as for postNetText and getNetText()
when they are given a property list.

### Parameters
propListOrString Required. Specifies the property list or string to be URL-encoded.
serverOSString Optional. Encodes any return characters in propListOrString. The value
defaults to "Unix" but may be set to "Win" or "Mac" and translates any carriage returns in
propListOrString into those used on the server. For most applications, this setting is

unnecessary because line breaks are usually not used in form responses.
characterSet Optional. Applies only if the user is running on a Shift-JIS (Japanese) system. Its
possible settings are "JIS", "EUC", "ASCII", and "AUTO". Retrieved data is converted from ShiftJIS to the named character set. Returned data is handled exactly as by getNetText() (converted
from the named character set to Shift-JIS). If you use "AUTO", the posted data from the local

character set is not translated; the results sent back by the server are translated as they are for
getNetText(). "ASCII" is the default if characterSet is omitted. "ASCII" provides no
translation for posting or results.

### Example
```lingo
In the following example, URLEncode supplies the URL-encoded string to a CGI query at the
specified location.
URL = "http://aserver/cgi-bin/echoquery.cgi"
gotonetpage URL & "?" & URLEncode( [#name: "Ken", #hobby: "What?"] )
```

### See also
getNetText(), postNetText

### Implementation
- **File**: `apps/client/src/director/api/URLEncode.js`
- **Test**: `apps/client/src/director/api/__tests__/URLEncode.test.js`
- **Dependencies**: Various (depends on function)

