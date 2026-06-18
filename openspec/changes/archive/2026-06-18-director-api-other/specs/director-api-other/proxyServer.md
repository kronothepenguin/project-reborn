## proxyServer

**Source**: `docs/drmx2004_scripting_ref.txt` lines 24515-24542

### Usage
```lingo

```

### Description
Command; sets the values of an FTP or HTTP proxy server.
Without parameters, proxyServer() returns the settings of an FTP or HTTP proxy server.

### Parameters
serverType Optional. A symbol that specifies the type of proxy server. The value can be either
#ftp or #http.
ipAddress Optional. A string that specifies the IP address.
portNum Optional. An integer that specifies the port number.

### Example
```lingo
This statement sets up an HTTP proxy server at IP address 197.65.208.157 using port 5:
proxyServer #http,"197.65.208.157",5

This statement returns the port number of an HTTP proxy server:
put proxyServer(#http,#port)

If no server type is specified, the function returns 1.
This statement returns the IP address string of an HTTP proxy server:
put proxyServer(#http)

This statement turns off an FTP proxy server:
proxyServer #ftp,#stop
```

### See also
N/A

### Implementation
- **File**: `apps/client/src/director/api/proxyServer.js`
- **Test**: `apps/client/src/director/api/__tests__/proxyServer.test.js`
- **Dependencies**: Various (depends on function)

