## postNetText

**Source**: `docs/drmx2004_scripting_ref.txt` lines 23877-23943

### Usage
```lingo

```

### Description
Command; sends a POST request to a URL, which is an HTTP URL, with specified data.
This command is similar to getNetText(). As with getNetText(), the server’s response is
returned by netTextResult(netID) once netDone(netID) becomes 1, and if
netError(netID) is 0, or okay.
The optional parameters may be omitted without regard to position.
This command also has an additional advantage over getNetText(): a postNetText() query
can be arbitrarily long, whereas the getNetText() query is limited to the length of a URL (1K or
4K, depending on the browser).
Note: If you use postNetText to post data to a domain different from the one the movie is playing
from, the movie will display a security alert when playing back in Shockwave Player.

To see an example of postNetText used in a completed movie, see the Forms and Post movie in
the Learning/Lingo folder inside the Director application folder.

### Parameters
url Required. Specifies the URL to send the POST request to.
propertyList or postText Required. Specifies the data to send with the request. When a
property list is used instead of a string, the information is sent in the same way a browser posts an
HTML form, with METHOD=POST. This facilitates the construction and posting of form data
within a Director title. Property names correspond to HTML form field names and property
values to field values.

The property list can use either strings or symbols as the property names. If a symbol is used, it is
automatically converted to a string without the # at the beginning. Similarly, a numeric value is
converted to a string when used as the value of a property.
Note: If a program uses the alternate form—a string instead of property list—the string postText is sent
to the server as an HTTP POST request using MIME type “text/plain.” This will be convenient for
some applications, but is not compatible with HTML forms posting. PHP scripts, for example, should
always use a property list.
serverOSString Optional. Defaults to UNIX but may be set to Windows or Mac and translates
any carriage returns in the postText argument into those used on the server to avoid confusion.

For most applications, this setting is unnecessary because line breaks are usually not used in
form responses.
serverCharSetString Optional. Applies only if the user is running on a Shift-JIS (Japanese)
system. Its possible settings are "JIS", "EUC", "ASCII", and "AUTO". Posted data is converted
from Shift-JIS to the named character set. Returned data is handled exactly as by getNetText()
(converted from the named character set to Shift-JIS). If you use "AUTO", the posted data from

the local character set is not translated; the results sent back by the server are translated as they are
for getNetText(). "ASCII" is the default if serverCharSetString is omitted. "ASCII"
provides no translation for posting or results.

464

Chapter 12: Methods

### Example
```lingo
This statement omits the serverCharSetString parameter:
netID = postNetText("www.mydomain.com\database.cgi", "Bill Jones", "Win")

This example generates a form from user-entry fields for first and last name, along with a Score.
Both serverOSString and serverCharSetString have been omitted:
lastName = member("Last Name").text
firstName = member("First Name").text
totalScore = member("Current Score").text
infoList = ["FName":firstName, "LName":lastName, "Score":totalScore]
netID = postNetText("www.mydomain.com\userbase.cgi", infoList)
```

### See also
getNetText(), netTextResult(), netDone(), netError()

### Implementation
- **File**: `apps/client/src/director/api/postNetText.js`
- **Test**: `apps/client/src/director/api/__tests__/postNetText.test.js`
- **Dependencies**: None (pure function)

