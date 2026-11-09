---
type: Reference
title: R26 mus
description: The bytes of the #mus connection under LibreShockwave, the WebSocket messages, the SMUS frame, the Logon frame the player sends, every serialized Lingo value, and the messages fuse_client and hh_photo exchange on it, each with a worked frame.
timestamp: 2026-11-09T19:19:11+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-09T19:19:11+00:00"}
tags: [r26, protocol]
---

# Sources

LibreShockwave at commit `3f9048009ff4bc9bf4bedb4a44f875c2ab36645b`, the submodule `vendor/LibreShockwave`
([0015](/decisions/0015-client-on-libreshockwave.md)), read only for this framing
([0008](/decisions/0008-reverse-engineer-ls-only.md)):

| File | What it holds |
| --- | --- |
| `cpp/src/player/xtra/queued_multiuser_bridge.cpp` | The SMUS frame, the Logon frame and the Lingo values, written and read |
| `cpp/src/player/xtra/socket_multiuser_bridge.cpp` | The native build's raw TCP socket, which splits its stream into frames |
| `cpp/src/lingo/xtra/multiuser_xtra.cpp` | The Multiuser Xtra's Lingo methods: `connectToNetServer`, `sendNetMessage`, `getNetMessage` |
| `cpp/apps/wasm/wasm_bridge.cpp`, `web/libreshockwave-cpp-worker.js` | The browser build: one WebSocket per connection |
| `cpp/tests/sdk_foundation_test.cpp` | LibreShockwave's own round trip of a frame |

The client's side is `packages/client-r26/src/game/fuse_client/`: `52_Multiuser Instance Class.ls` opens `#mus` and
sends and receives on it, and `42_Binary Manager Class.ls` runs the session
([fuse_client](/reference/r26/fuse_client.md#the-mus-connection)).

Every worked frame below was checked against LibreShockwave. A probe compiled from `queued_multiuser_bridge.cpp`
wrote the client's frames, the same byte for byte, and read the server's frames and every value back as shown.

# Transport

- In the browser the player opens one WebSocket per connection, `ws://<connection.mus.host>:<connection.mus.port>`,
  or `wss://` on an HTTPS page, and sends binary messages ([0020](/decisions/0020-info-and-mus-websocket-ports.md)).
- Each client frame is one WebSocket message.
- Each WebSocket message from the server must hold exactly one whole frame. The player reads one frame from the
  message's start and drops whatever follows it, so a second frame in the same message is lost. A message that does
  not start with `72 00`, or whose frame is cut short, is dropped without a word; a body too short for its own fields
  becomes error −5 ([Errors](#errors)). A text message is read as bytes, one per character.
- The native build, the desktop debugger, opens a raw TCP socket instead and splits its stream into frames by their
  length. The server listens for WebSockets only.

# Frames

Numbers are big-endian. A chunk is a 4-byte length, the bytes, and one zero byte when the length is odd.

| Bytes | Field |
| --- | --- |
| 2 | `72 00` (114, 0) |
| 4 | Length of the body that follows |
| 4 | Error code: 0 ([Errors](#errors)) |
| 4 | Timestamp: the player writes 0, and reads past it |
| chunk | Subject |
| chunk | Sender |
| 4 | Count of recipients |
| chunk each | Recipients |
| the rest | Content: one Lingo value ([Values](#values)) |

Except for the Logon frame, the player's frames have the sender `*`, since `fuse_client` connects with
`connectToNetServer("*", "*", host, port, "*", 0)`, and the recipients the Lingo gives, `*`. Of a server frame, Lingo
gets the error code, the sender as `#senderID`, the subject and the content; the timestamp and the recipients are
read past. No script reads `#senderID`.

`HELLO` from the server, sender `System`, no recipients, content the string `0`, is 46 bytes:

```text
72 00                        magic
00 00 00 28                  body: 40 bytes
00 00 00 00                  error code 0
00 00 00 00                  timestamp 0
00 00 00 05 48 45 4c 4c 4f 00  subject "HELLO", padded
00 00 00 06 53 79 73 74 65 6d  sender "System"
00 00 00 00                  no recipients
00 03 00 00 00 01 30 00      content: string "0", padded
```

# Values

The content is one value: a 2-byte type, then its data.

| Type | Value | Data | Example | Bytes |
| --- | --- | --- | --- | --- |
| 0 | void | none | `VOID` | `00 00` |
| 1 | integer | 4 bytes, signed | `4321` | `00 01 00 00 10 e1` |
| 2 | symbol | chunk of its name | `#cs` | `00 02 00 00 00 02 63 73` |
| 3 | string | chunk of its bytes | `"Hi"` | `00 03 00 00 00 02 48 69` |
| 3 | string, odd length | chunk, padded | `"abc"` | `00 03 00 00 00 03 61 62 63 00` |
| 5 | media | chunk of its bytes | a bitmap's `media` | `00 05 00 00 00 03 01 02 03 00` |
| 6 | float | 8-byte IEEE double | `1.5` | `00 06 3f f8 00 00 00 00 00 00` |
| 7 | list | 4-byte count, then each value | `[1, "a"]` | `00 07 00 00 00 02 00 01 00 00 00 01 00 03 00 00 00 01 61 00` |
| 8 | point | two values, int | `point(4, 5)` | `00 08 00 01 00 00 00 04 00 01 00 00 00 05` |
| 9 | rect | four values, int | `rect(6, 7, 8, 9)` | `00 09` then four type-1 values |
| 10 | property list | 4-byte count, then each key and value | `[#cs: 1]` | `00 0a 00 00 00 01 00 02 00 00 00 02 63 73 00 01 00 00 00 01` |
| 18 | colour | byte 1, then red, green, blue | `rgb(10, 11, 12)` | `00 12 01 0a 0b 0c` |

- A property list's symbol keys are written as symbols and any other key as a string; read, a key is any value.
- A float is written as a double and read back as a single-precision float.
- Type 20 reads as media too. Any other type reads as media holding the 2 type bytes and the rest of the content.
- The player writes a value of any other kind as its string.
- A string's bytes are the text as the player holds it. `fuse_client` passes text through `encodeUTF8` first, as on
  `#info` ([fuse_client](/reference/r26/fuse_client.md#text)).

# The Logon frame

When the socket opens, the player tells Lingo it is connected, a `ConnectToNetServer` message, and sends this fixed
80-byte frame, the same every time:

```text
72 00 00 00 00 4a            magic; body 74 bytes
00 00 00 00 00 00 00 00      error code 0; timestamp 0
00 00 00 05 4c 6f 67 6f 6e 00  subject "Logon", padded
00 00 00 00                  sender: empty
00 00 00 01                  one recipient
00 00 00 06 53 79 73 74 65 6d  "System"
8c b0 61 ca 11 53 a0 57 f8 6c d8 cd 4b 2e f8 2a 63 da 69
6d 60 1f 2f 59 c6 a7 34 3f e2 f6 71 39 38 45 c2 36 ce 3c
                             content: 38 fixed bytes, not a value the server needs
```

Nothing waits for an answer: the client's session starts with the server's `HELLO`, and a frame from the server with
the subject `Logon` or `logon` is dropped.

# Messages from the server

| Subject | Content | What the client does |
| --- | --- | --- |
| `HELLO` | string: a number; `0` for no encryption ([0012](/decisions/0012-no-encryption.md)) | Ends the handshake; the client then sends `LOGIN`. Any other number turns RC4 on ([fuse_client](/reference/r26/fuse_client.md#session)) |
| `BINDATA_SAVED` | string: the stored photo's id | Ends a store; `hh_photo` keeps the id ([s1-16](/tasks/s1-16-photo.md)) |
| `BINDATA_AUTHKEYERROR` | string, unused | Drops the task at the head of the queue, a store or a fetch |
| Any | the property list stored with `BINDATA` | The answer to `GETBINDATA`: a content that is not a string goes to the Binary Manager's binary callback, whatever the subject |
| `U_RTS` | string | Listened to, and nothing done |
| `OK`, `FILM` | string | `hh_photo`'s ([s1-16](/tasks/s1-16-photo.md)) |

The client hands a string content to the listeners of the subject as `subject`, `RETURN` and the content, through
`convertSpecialChars`; the content is that text from its second word on. Any other content goes to the binary callback.

`BINDATA_SAVED` with `17` (54 bytes):

```text
72 00 00 00 00 30 00 00 00 00 00 00 00 00 00 00 00 0d 42 49 4e 44 41 54 41 5f 53 41 56 45 44 00
00 00 00 06 53 79 73 74 65 6d 00 00 00 00 00 03 00 00 00 02 31 37
```

`BINDATA_AUTHKEYERROR` with an empty string (58 bytes):

```text
72 00 00 00 00 34 00 00 00 00 00 00 00 00 00 00 00 14 42 49 4e 44 41 54 41 5f 41 55 54 48 4b 45
59 45 52 52 4f 52 00 00 00 06 53 79 73 74 65 6d 00 00 00 00 00 03 00 00 00 00
```

The photo of the `BINDATA` example below, sent back under the subject `BINDATA` (114 bytes): the content is the same
value the client stored.

```text
72 00 00 00 00 6c 00 00 00 00 00 00 00 00 00 00 00 07 42 49 4e 44 41 54 41 00 00 00 00 06 53 79
73 74 65 6d 00 00 00 00 00 0a 00 00 00 03 00 02 00 00 00 05 69 6d 61 67 65 00 00 05 00 00 00 03
01 02 03 00 00 02 00 00 00 04 74 69 6d 65 00 03 00 00 00 0f 39 2e 31 31 2e 32 30 32 36 20 31 39
3a 33 30 00 00 02 00 00 00 02 63 73 00 01 00 00 10 e1
```

# Messages from the client

| Subject | Content | Sent by |
| --- | --- | --- |
| `Logon` | 38 fixed bytes | LibreShockwave, when the socket opens |
| `LOGIN` | string: `<user id> <machine id>`, each enciphered when `HELLO` turned RC4 on | `42_Binary Manager Class.ls`: `checkConnection`, once `HELLO` has come |
| `BINDATA` | the photo's property list: `#image` media, `#time` string, `#cs` int | `42_Binary Manager Class.ls`: `next`, a store; `52_Multiuser Instance Class.ls`: `sendBinary` |
| `GETBINDATA` | string: `<item id> <auth key>` | `42_Binary Manager Class.ls`: `next`, a fetch |
| The text's first word | string: the text from its second word on | `42_Binary Manager Class.ls`: `next`, a text message, such as `hh_photo`'s `PHOTOTXT` |
| `0` | string: one character, 0 | `52_Multiuser Instance Class.ls`: `disconnect`, when the client closes the connection |

The last frame goes to the recipient `0`. Every other frame goes to `*`. The user id is the session's `user_user_id`.

`LOGIN` for user 12 and machine `abc` (52 bytes):

```text
72 00 00 00 00 2e            magic; body 46 bytes
00 00 00 00 00 00 00 00      error code 0; timestamp 0
00 00 00 05 4c 4f 47 49 4e 00  subject "LOGIN", padded
00 00 00 01 2a 00            sender "*", padded
00 00 00 01 00 00 00 01 2a 00  one recipient, "*"
00 03 00 00 00 06 31 32 20 61 62 63  content: string "12 abc"
```

`GETBINDATA` for item 5 with the auth key `9a8b` (56 bytes):

```text
72 00 00 00 00 32 00 00 00 00 00 00 00 00 00 00 00 0a 47 45 54 42 49 4e 44 41 54 41 00 00 00 01
2a 00 00 00 00 01 00 00 00 01 2a 00 00 03 00 00 00 06 35 20 39 61 38 62
```

`BINDATA` with a 3-byte image, the time `9.11.2026 19:30` and the checksum 4321 (116 bytes). The image's bytes are the
bitmap's `media` as LibreShockwave holds it, which the server keeps and returns as they are:

```text
72 00 00 00 00 6e 00 00 00 00 00 00 00 00 00 00 00 07 42 49 4e 44 41 54 41 00 00 00 00 01 2a 00
00 00 00 01 00 00 00 01 2a 00 00 0a 00 00 00 03 00 02 00 00 00 05 69 6d 61 67 65 00 00 05 00 00
00 03 01 02 03 00 00 02 00 00 00 04 74 69 6d 65 00 03 00 00 00 0f 39 2e 31 31 2e 32 30 32 36 20
31 39 3a 33 30 00 00 02 00 00 00 02 63 73 00 01 00 00 10 e1
```

`PHOTOTXT` with the text `Hi` (52 bytes), sent as `PHOTOTXT /Hi`:

```text
72 00 00 00 00 2e 00 00 00 00 00 00 00 00 00 00 00 08 50 48 4f 54 4f 54 58 54 00 00 00 01 2a 00
00 00 00 01 00 00 00 01 2a 00 00 03 00 00 00 03 2f 48 69 00
```

The closing frame (44 bytes):

```text
72 00 00 00 00 26 00 00 00 00 00 00 00 00 00 00 00 01 30 00 00 00 00 01 2a 00 00 00 00 01 00 00
00 01 30 00 00 03 00 00 00 01 00 00
```

# Flows

1. The first photo task opens `#mus`. The player sends the Logon frame, which needs no answer.
2. The server sends `HELLO`. The client checks every 1000 ms, and once `HELLO` has come it sends `LOGIN`.
3. Tasks go one at a time: a store sends `BINDATA` and waits for `BINDATA_SAVED`; a fetch sends `GETBINDATA` and waits
   for the photo; `BINDATA_AUTHKEYERROR` drops either. A text message goes, and the queue moves on at once.
4. 30,000 ms after the queue empties, the client sends the closing frame and lets the connection go. The next task
   opens a new WebSocket and starts again at 1.

# Notes

## Errors

- A frame with an error code other than 0 makes the client disconnect, as if the connection had dropped.
- A body too short for its fields reaches Lingo as `ConnectionProblem` with error −5, and the client disconnects.
- When the socket closes or fails, the player hands Lingo a `ConnectionProblem` with error −2, or the close code.

## What the client depends on

- One frame per WebSocket message, and error code 0 in each.
- Text as strings: a content of any other type, an int too, takes the binary path.
- A dropped connection, or a `DISCONNECT` frame, runs the Binary Manager's `deconstruct` through its `DISCONNECT`
  listener. That unregisters its listeners, while the manager object stays, so `HELLO` is never heard again and
  `#mus` stays dead for the rest of the session. After the closing frame the client has cleared its handler, so a
  close is safe then.
- At this commit nothing calls `destroyInstance`, so the closing frame does not close the WebSocket: it stays open
  until the server or the page closes it.

## Quirks

- The photo goes to the task at the head of the queue, whatever that task is.
- `DISCONNECT` and `ConnectToNetServer` come from the player itself, not from the server.
