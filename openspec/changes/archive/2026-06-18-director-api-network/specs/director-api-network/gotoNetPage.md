## gotoNetPage

**Source**: `docs/drmx2004_scripting_ref.txt` lines 18196-18239

### Usage
```lingo

```

### Description
Command; opens a movie with Shockwave content or another MIME file in the browser.
Only URLs are supported as valid parameters. Relative URLs work if the movie is on an
HTTP or FTP server.
In the authoring environment, the gotoNetPage command launches the preferred browser if it is
enabled. In projectors, this command tries to launch the preferred browser set with the Network
Preferences dialog box or browserName command. If neither has been used to set the preferred
browser, the goToNetPage command attempts to find a browser on the computer.

### Parameters
URL Required. Specifies the URL of the movie with Shockwave content or MIME file to play.
targetName Optional. An HTML parameter that identifies the frame or window in which the
page is loaded.

• If targetName is a window or frame in the browser, gotoNetPage replaces the contents of that
window or frame.

• If targetName isn’t a frame or window that is currently open, goToNetPage opens a
new window. Using the string "_new" always opens a new window.

• If targetName is omitted, gotoNetPage replaces the current page, wherever it is located.

### Example
```lingo
The following script loads the file Newpage.html into the frame or window named frwin. If a
window or frame in the current window called frwin exists, that window or frame is used. If the
window frwin doesn’t exist, a new window named frwin is created.
on keyDown
gotoNetPage "Newpage.html", "frwin"
end

This handler opens a new window regardless of what window the browser currently has open:
on mouseUp
goToNetPage "Todays_News.html", "_new"
end
```

### See also
browserName(), netDone()

gotoNetPage

353

### Implementation
- **File**: `apps/client/src/director/api/gotoNetPage.js`
- **Test**: `apps/client/src/director/api/__tests__/gotoNetPage.test.js`
- **Dependencies**: None (pure function)

