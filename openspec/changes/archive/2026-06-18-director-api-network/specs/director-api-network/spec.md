## ADDED Requirements

### Requirement: Network functions SHALL be implemented in api/ directory

The Director MX 2004 network functions SHALL be implemented in `apps/client/src/director/api/` with each function in its own file.

**Source**: `docs/drmx2004_scripting_ref.txt`
**Inventory**: `docs/director-inventory.json`

**Files**:
- `apps/client/src/director/api/downloadNetThing.js`
- `apps/client/src/director/api/getNetText.js`
- `apps/client/src/director/api/getStreamStatus.js`
- `apps/client/src/director/api/gotoNetMovie.js`
- `apps/client/src/director/api/gotoNetPage.js`
- `apps/client/src/director/api/netAbort.js`
- `apps/client/src/director/api/netDone.js`
- `apps/client/src/director/api/netError.js`
- `apps/client/src/director/api/netLastModDate.js`
- `apps/client/src/director/api/netMIME.js`
- `apps/client/src/director/api/netTextResult.js`
- `apps/client/src/director/api/postNetText.js`
- `apps/client/src/director/api/preloadNetThing.js`

**Tests**:
- `apps/client/src/director/api/__tests__/downloadNetThing.test.js`
- `apps/client/src/director/api/__tests__/getNetText.test.js`
- `apps/client/src/director/api/__tests__/getStreamStatus.test.js`
- `apps/client/src/director/api/__tests__/gotoNetMovie.test.js`
- `apps/client/src/director/api/__tests__/gotoNetPage.test.js`
- `apps/client/src/director/api/__tests__/netAbort.test.js`
- `apps/client/src/director/api/__tests__/netDone.test.js`
- `apps/client/src/director/api/__tests__/netError.test.js`
- `apps/client/src/director/api/__tests__/netLastModDate.test.js`
- `apps/client/src/director/api/__tests__/netMIME.test.js`
- `apps/client/src/director/api/__tests__/netTextResult.test.js`
- `apps/client/src/director/api/__tests__/postNetText.test.js`
- `apps/client/src/director/api/__tests__/preloadNetThing.test.js`

#### Scenario: Network functions are importable
- **WHEN** code imports `import { getNetText, netDone, netError } from "../../director/api"`
- **THEN** all network functions are available

#### Scenario: Network functions use transaction IDs
- **WHEN** network functions are called
- **THEN** they return transaction IDs for status checking

### Requirement: getNetText() SHALL fetch text from URL

The `getNetText()` function SHALL fetch text from a URL and return a transaction ID.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 17308-17368

#### Scenario: getNetText starts fetch
- **WHEN** `getNetText("http://example.com/data.txt")` is called
- **THEN** returns transaction ID and starts async fetch

### Requirement: netDone() SHALL check operation status

The `netDone()` function SHALL return true when a network operation is complete.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 21241-21304

#### Scenario: netDone returns false while pending
- **WHEN** `netDone(netId)` is called before operation completes
- **THEN** returns `false`

#### Scenario: netDone returns true when complete
- **WHEN** `netDone(netId)` is called after operation completes
- **THEN** returns `true`

### Requirement: netError() SHALL return error message

The `netError()` function SHALL return error message or "OK".

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 21305-21422

#### Scenario: netError returns OK on success
- **WHEN** `netError(netId)` is called on successful operation
- **THEN** returns `"OK"`

#### Scenario: netError returns error message
- **WHEN** `netError(netId)` is called on failed operation
- **THEN** returns error message string

### Requirement: netTextResult() SHALL return text result

The `netTextResult()` function SHALL return the text result of a network operation.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 21552-21596

#### Scenario: netTextResult returns fetched text
- **WHEN** `netTextResult(netId)` is called after successful getNetText
- **THEN** returns the fetched text content

### Requirement: postNetText() SHALL post text to URL

The `postNetText()` function SHALL post text to a URL and return a transaction ID.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 23877-23943

#### Scenario: postNetText starts post
- **WHEN** `postNetText("http://example.com/api", "data=value")` is called
- **THEN** returns transaction ID and starts async post

### Requirement: netAbort() SHALL cancel operation

The `netAbort()` function SHALL cancel a pending network operation.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 21212-21240

#### Scenario: netAbort cancels operation
- **WHEN** `netAbort(netId)` is called on pending operation
- **THEN** operation is cancelled

### Requirement: netLastModDate() SHALL return last modified date

The `netLastModDate()` function SHALL return the last modified date of a fetched resource.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 21423-21465

#### Scenario: netLastModDate returns date
- **WHEN** `netLastModDate(netId)` is called after successful fetch
- **THEN** returns last modified date string

### Requirement: netMIME() SHALL return MIME type

The `netMIME()` function SHALL return the MIME type of a fetched resource.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 21466-21529

#### Scenario: netMIME returns content type
- **WHEN** `netMIME(netId)` is called after successful fetch
- **THEN** returns MIME type string

### Requirement: gotoNetPage() SHALL navigate to URL

The `gotoNetPage()` function SHALL navigate the browser to a URL.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 18196-18239

#### Scenario: gotoNetPage navigates
- **WHEN** `gotoNetPage("http://example.com")` is called
- **THEN** browser navigates to URL

### Requirement: gotoNetMovie() SHALL navigate to movie URL

The `gotoNetMovie()` function SHALL navigate to a movie URL.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 18162-18195

#### Scenario: gotoNetMovie navigates
- **WHEN** `gotoNetMovie("http://example.com/movie.dcr")` is called
- **THEN** browser navigates to movie URL

### Requirement: downloadNetThing() SHALL download file

The `downloadNetThing()` function SHALL download a file from a URL.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 15301-15333

#### Scenario: downloadNetThing starts download
- **WHEN** `downloadNetThing("http://example.com/file.zip")` is called
- **THEN** returns transaction ID and starts download

### Requirement: preloadNetThing() SHALL preload resource

The `preloadNetThing()` function SHALL preload a network resource.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 24153-24190

#### Scenario: preloadNetThing starts preload
- **WHEN** `preloadNetThing("http://example.com/image.jpg")` is called
- **THEN** returns transaction ID and starts preload

### Requirement: getStreamStatus() SHALL return stream status

The `getStreamStatus()` function SHALL return the status of a stream.

**Reference**: `docs/drmx2004_scripting_ref.txt` lines 17817-17872

#### Scenario: getStreamStatus returns status
- **WHEN** `getStreamStatus(netId)` is called
- **THEN** returns stream status object

### Requirement: All network functions SHALL match Director MX 2004 exactly

Each network function SHALL behave exactly as documented in Director MX 2004. See individual spec files for full documentation:

- `downloadNetThing.md` - Download file from URL
- `getNetText.md` - Get text from URL
- `getStreamStatus.md` - Get stream status
- `gotoNetMovie.md` - Navigate to movie URL
- `gotoNetPage.md` - Navigate to page URL
- `netAbort.md` - Abort network operation
- `netDone.md` - Check if network operation complete
- `netError.md` - Get network error
- `netLastModDate.md` - Get last modified date
- `netMIME.md` - Get MIME type
- `netTextResult.md` - Get text result
- `postNetText.md` - Post text to URL
- `preloadNetThing.md` - Preload network resource

#### Scenario: All functions implemented
- **WHEN** any network function is called
- **THEN** behavior matches Director MX 2004 documentation exactly
