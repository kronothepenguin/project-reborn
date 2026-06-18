## getNetText()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 17308-17368

### Usage
```lingo

```

### Description
Function; starts the retrieval of text from a file usually on an HTTP or FTP server, or initiates a
CGI query.
The first syntax shown starts the text retrieval. You can submit HTTP CGI queries this way and
must properly encode them in the URL. The second syntax includes a property list and submits a
CGI query, providing the proper URL encoding.
Use the optional parameter propertyList to take a property list for CGI queries. The property
list is URL encoded and the URL sent is (urlstring & "?" & encodedproplist).
Use the optional parameter serverOSString to encode any return characters in propertylist.
The value defaults to UNIX but may be set to Win or Mac and translates any carriage returns in the
propertylist argument into those used on the server. For most applications, this setting is
unnecessary because line breaks are usually not used in form responses.
The optional parameter characterSet applies only if the user is running Director on a
shift-JIS (Japanese) system. Possible character set settings are JIS, EUC, ASCII, and AUTO.
Lingo converts the retrieved data from shift-JIS to the named character set. Using the AUTO
setting, character set tries to determine what character set the retrieved text is in and translate it to
the character set on the local machine. The default setting is ASCII.
Use netDone to find out when the getNetText operation is complete, and netError to find out
if the operation was successful. Use netTextResult to return the text retrieved by getNetText.
The function works with relative URLs.

getNetText()

335

To see an example of getNetText() used in a completed movie, see the Forms and Post movie in
the Learning/Lingo folder inside the Director application folder.

### Parameters
URL Required. The URL to the file that contains the text to get.
propertyList Optional. Specifies a property list used for CGI queries.
serverOSString Optional. Specifies the encoding of return characters in propertyList.
characterSet Optional. Specifies character settings.

### Example
```lingo
This script retrieves text from the URL http://BigServer.com/sample.txt and updates the field cast
member the mouse pointer is on when the mouse button is clicked:
property spriteNum
property theNetID
on mouseUp me
theNetID = getNetText ("http://BigServer.com/sample.txt")
end
on exitFrame me
if netDone(theNetID) then
sprite(spriteNum).member.text = netTextResult(theNetID)
end if
end

This example retrieves the results of a CGI query:
getNetText("http://www.yourserver.com/cgi-bin/query.cgi?name=Bill")

This is the same as the previous example, but it uses a property list to submit a CGI query, and
does the URL encoding for you:
getNetText("http://www.yourserver.com/cgi-bin/query.cgi", [#name:"Bill"])
```

### See also
netDone(), netError(), netTextResult()

### Implementation
- **File**: `apps/client/src/director/api/getNetText.js`
- **Test**: `apps/client/src/director/api/__tests__/getNetText.test.js`
- **Dependencies**: None (pure function)

