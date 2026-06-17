## netError()

**Source**: `docs/drmx2004_scripting_ref.txt` lines 21305-21422

### Usage
```lingo

```

### Description
Function; determines whether an error has occurred in a network operation and, if so, returns an
error number corresponding to an error message. If the operation was successful, this function
returns a code indicating that everything is okay. If no background loading operation has started,
or if the operation is in progress, this function returns an empty string.

• Use netError() to test the last network operation.
• Use netError(netID) to test the network operation specified by netID.
Several possible error codes may be returned:
0

Everything is okay.

4

Bad MOA class. The required network or nonnetwork Xtra extensions are improperly
installed or not installed at all.

5

Bad MOA Interface. See 4.

6

Bad URL or Bad MOA class. The required network or nonnetwork Xtra extensions are
improperly installed or not installed at all.

20

Internal error. Returned by netError() in the Netscape browser if the browser detected
a network or internal error.

4146

Connection could not be established with the remote host.

4149

Data supplied by the server was in an unexpected format.

4150

Unexpected early closing of connection.

4154

Operation could not be completed due to timeout.

4155

Not enough memory available to complete the transaction.

4156

Protocol reply to request indicates an error in the reply.

4157

Transaction failed to be authenticated.

4159

Invalid URL.

4164

Could not create a socket.

4165

Requested object could not be found (URL may be incorrect).

4166

Generic proxy failure.

4167

Transfer was intentionally interrupted by client.

4242

Download stopped by netAbort(url).

4836

Download stopped for an unknown reason, possibly a network error, or the download
was abandoned.

### Parameters
netID Optional. Specifies the ID of the network operation to test.

412

Chapter 12: Methods

### Example
```lingo
This statement passes a network ID to netError to check the error status of a particular
network operation:
--Lingo syntax
on exitFrame
global mynetID
if netError(mynetID)<>"OK" then beep
end
// JavaScript syntax
function exitFrame() {
global mynetID;
if (netError(mynetID) != "OK") {
_sound.beep();
}
}
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/netError.js`
- **Test**: `apps/client/src/director/api/__tests__/netError.test.js`
- **Dependencies**: None (pure function)

