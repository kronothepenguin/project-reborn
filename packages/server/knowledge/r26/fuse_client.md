---
type: Reference
title: R26 fuse_client
description: How the R26 client opens its #info and #mus connections, frames packets both ways, encodes every value, and maps listeners and commands, from fuse_client's .ls scripts.
timestamp: 2026-11-06T23:28:02+00:00
generated: {by: claude-code/claude-opus-5-5, at: "2026-11-05T22:10:00+00:00"}
tags: [r26, protocol]
---

# Scripts

All in `packages/client-r26/src/game/fuse_client/`:

| Script | What it holds |
| --- | --- |
| `12_Connection API.ls` | `createConnection`, `getConnection`, `registerListener`, `registerCommands` and their `un…` pairs, all forwarded to the connection manager |
| `33_Connection Manager Class.ls` | One listener table and one command table per connection id; turns command ids into their 2 wire characters |
| `51_Connection Instance Class.ls` | The `#info` socket: connect and retry, `send`, `sendNew`, `msghandler` (framing), `forwardMsg`, `GetIntFrom`, `GetStrFrom`, `GetBoolFrom`, `GetByteFrom` |
| `24_Multiuser API.ls`, `45_Multiuser Manager Class.ls` | The same manager for `#mus` (`multiuser.manager.class` is `Manager Template Class`, `Connection Manager Class`, `Multiuser Manager Class`) |
| `52_Multiuser Instance Class.ls` | The `#mus` socket, in the Multiuser Xtra's own message mode |
| `42_Binary Manager Class.ls`, `22_Binary API.ls` | The queue that opens `#mus` on demand, logs in, stores and fetches binary data |
| `37_String Services Class.ls` | `encodeUTF8`, `decodeUTF8`, `convertSpecialChars` |
| `1_System Props.txt` | `connection.log.level`, `char.conversion.win`/`.mac`, `struct.message`, the class lists |

The login handler in `hh_entry_init/8_Login Handler Class.ls` decides the encryption; this document only says what
the connection does with it ([Encryption](#encryption)).

# Connections

| Id | Variable | Opened by | Host and port | Mode |
| --- | --- | --- | --- | --- |
| `#info` | `connection.info.id` | `hh_entry_init/7_Login Component Class.ls`: `openConnection` | `connection.info.host`, `connection.info.port` | raw bytes (`connectToNetServer(…, 1)`) |
| `#info` | `connection.room.id` | the room casts | the same connection: the variable's value is `#info` | |
| `#mus` | `connection.mus.id` | `42_Binary Manager Class.ls`: `next`, only when the queue has work | `connection.mus.host`, `connection.mus.port` | Multiuser Xtra messages (`connectToNetServer(…, 0)`) |

On LibreShockwave each of these sockets is a WebSocket to `ws(s)://<host>:<port><websocketPath>`, with the same bytes
(0015 (`knowledge/decisions/server/0015-client-on-libreshockwave.md`)).

The hosts and ports come from the page that embeds the client, not from a cast: `packages/client-r26/index.html`
passes `connection.info.host=localhost;connection.info.port=30000` and
`connection.mus.host=localhost;connection.mus.port=30001`.

## Opening `#info` and retrying

- `connect` creates a Multiuser Xtra with `setNetBufferLimits(16 * 1024, 100 * 1024, 100)` and calls
  `connectToNetServer("*", "*", host, port, "*", 1)`. The last `1` is the Xtra's raw mode: the client reads and writes
  plain bytes, and does all the framing itself.
- Until the first message arrives without an error, the connection is still establishing. Each error then retries
  `connect` after `connection.retry.delay` ms (default 2000), up to `connection.retry.count` times (default 5). No cast
  sets these two variables, so the defaults apply. After that, the client logs a critical error and disconnects.
- `connectionReady` is true only once `setEncryption` ran. With no encryption no one calls it, and nothing on `#info`
  checks it: only the `#mus` scripts call `connectionReady`, on their own instance.

## Closing and the `-1` message

- `disconnect(tControlled)`: when the close was not asked for (`tControlled <> 1`), the instance first delivers the
  message id `-1` to its listeners, with no body. `hh_entry_init` registers `-1` to `handleDisconnect`, which shows
  the disconnect screen or a fatal error. `-1` never travels on the wire.
- A lost connection after it was established (an Xtra error code) calls `disconnect()` and therefore sends `-1`.
- Every `disconnect`, controlled or not, writes one byte `0x00` to the socket before it drops the handler
  (`sendNetMessage(0, 0, numToChar(0))`). The server reads a single `0x00` where a frame would start, right before
  the client closes. That byte is not a frame.
- `removeConnection` (the login component's `#closeConnection`, the ban handler) is a controlled close: no `-1`.

# Framing

## Client to server

`send(tCmd, tMsg)` and `sendNew(tCmd, tParmArr)` both write:

| Bytes | Content |
| --- | --- |
| 3 | length, B64, most significant first: `64 | (n / 4096 & 63)`, `64 | (n / 64 & 63)`, `64 | (n & 63)` |
| 2 | the command id, as `registerCommands` turned it into 2 characters ([Commands](#commands)) |
| n − 2 | the body |

The length `n` counts the 2 id characters and the body. It is 18 bits, so it wraps above 262,143.

- `send` with a property list as `tMsg` calls `sendNew`. Most casts write `send("NAME", [#string: …])`, so a typed
  body does not mean a `sendNew` call in the source.
- `send` with text: the body is `encodeUTF8(tMsg)` as it is, and `n` is its length plus 2. Each character counts
  as 1, plus 1 more when its code is above 255 and not a multiple of 256: a 2-byte character of a Director whose
  text is not bytes.
- `sendNew` adds up `n` from the values it writes.
- `tCmd` is a name looked up in the connection's command table. An unknown name logs "Unrecognized command!" and
  sends nothing. An integer `tCmd` would be written as decimal digits, but no cast passes one.

Example, `INIT_CRYPTO` (206) with no body:

```text
@  @  B  C  N
40 40 42 43 4E      length 2; id 206 = 3 × 64 + 14
```

Example, `GENERATEKEY` (2002) with `[#string: "ab"]`:

```text
@  @  F  _  R  @  B  a  b
40 40 46 5F 52 40 42 61 62      length 6 = id 2 + string length 2 + "ab" 2; id 2002 = 31 × 64 + 18
```

## Server to client

`msghandler` reads, in a loop over the bytes received so far:

| Bytes | Content |
| --- | --- |
| 2 | the message id: `(byte1 & 63) × 64 + (byte2 & 63)` |
| any | the body |
| 1 | `0x01`, the end of the message |

- There is no length: a message ends at the first `0x01`. A body therefore never holds `0x01`.
- Fewer than 3 bytes, or no `0x01` yet: the bytes wait in `pLastContent` for the next read. One read may also hold
  several messages, and the loop handles each.
- The body goes through `decodeUTF8` and then `convertSpecialChars` ([Text](#text)) before any handler reads it.
- On a Director below version 11 with no `0x01` in sight, the client also looks for a character whose code is
  `256 × k + 1` and splits it into `k` and `0x01`. A server that writes bytes never meets this case.

Example, `CRYPTOPARAMETERS` (277) with the integer 0:

```text
D  U  H  ␁
44 55 48 01      id 277 = 4 × 64 + 21; VL64 0; end
```

`HELLO` (0) with no body is `40 40 01`.

## Delivering a message

`forwardMsg(id, body)` looks the id up in the connection's listener table:

- Every listener registered for the id is called, in the order they registered. Before each call the shared message
  struct is set again to `[#subject: id, #content: body, #connection: <instance>]`, so each handler reads the body
  from its start.
- An id that no script registered logs "Listener not found: <id> / <connection>" as a minor error and is dropped.
  The connection stays open.
- A listener whose object no longer exists is removed from the list.

# Values

## B64

Two characters: `64 | (n / 64)`, then `64 | (n & 63)`. Command ids, `#short` values and string lengths all use it.

| Value | Characters | Bytes |
| --- | --- | --- |
| 0 | `@@` | 40 40 |
| 206 | `CN` | 43 4E |
| 2002 | `_R` | 5F 52 |
| 4095 | two `DEL` characters | 7F 7F |

Nothing masks the first character, so 4095 is the largest value B64 holds. 4096 comes out as `@@`, the same as 0,
and from 8192 the first character goes above 127. Negative `#short` values are not handled either.

## VL64

`sendNew #integer` writes it; `GetIntFrom` reads it.

- First character: `64 | count × 8 | 4 if negative | (|v| & 3)`.
- Each next character: `64 | (next 6 bits of |v|)`, the least significant first.
- `count` is the number of characters, 1 to 6. A negative number is written as its absolute value with the 4 bit set,
  so there is no two's complement.
- `GetIntFrom` multiplies the characters by 4, 256, 16384, 1048576 and 67108864, so it reads at most 6 characters. A
  first character whose count is 7 has no multiplier and is a script error. A count of 0 reads as the low bits and
  consumes nothing.

| Value | Characters | Bytes |
| --- | --- | --- |
| 0 | `H` | 48 |
| 1 | `I` | 49 |
| 3 | `K` | 4B |
| −1 | `M` | 4D |
| 4 | `PA` | 50 41 |
| 100 | `PY` | 50 59 |
| −100 | `TY` | 54 59 |
| 1000 | `XzC` | 58 7A 43 |
| 67,108,863 | 5 characters | 6B 7F 7F 7F 7F |
| 67,108,864 | 6 characters | 70 40 40 40 40 41 |
| 2,147,483,647, the largest Lingo integer | 6 characters | 73 7F 7F 7F 7F 5F |

Each example was computed with a literal port of `sendNew` and read back with a port of `GetIntFrom`.

## Strings

- Client to server, `sendNew #string`: the B64 length of the encoded text, then the text. `"ab"` is
  `40 42 61 62`. A string longer than 4095 bytes gets a wrong length ([B64](#b64)).
- Client to server, `send` with text: the text is the whole body, with no length and no end mark. Its fields are
  whatever the sender put in it, for example values joined with `TAB` or `RETURN`. Each cast's reference describes them.
- Server to client, `GetStrFrom`: the text up to the first `0x02`, which is consumed. `"abc"` is `61 62 63 02`.
  With no `0x02` left, it returns empty and consumes nothing.

## Booleans, bytes and raw bodies

- `sendNew #boolean`: one character, `@` (40) for false and `A` (41) for true. Any non-zero value is true.
- `GetBoolFrom`: one character; true when its low 6 bits are not 0.
- `GetByteFrom`: one character; the value is its low 6 bits, 0 to 63.
- A handler that reads `tMsg.content` itself takes the rest of the body as text. Many handlers do this and split it
  into lines (`RETURN`, `0x0D`), items or words.
- `sendNew` has no `#byte`: an unknown type logs "Unsupported param type" and writes nothing for it.

## Text

How text becomes bytes depends on the variable `client.textdata.utf8`. No cast sets it, so it comes from the
external variables the site serves; the server's text is UTF-8 with it on (0014 (`knowledge/decisions/server/0014-text-is-utf8.md`)).
Several paths also depend on `the productVersion`. LibreShockwave reports `"10.1"`
(0015 (`knowledge/decisions/server/0015-client-on-libreshockwave.md`)), so the client takes the paths for Director below 11.

- `client.textdata.utf8` true: `encodeUTF8` writes UTF-8 for code points up to U+FFFF, so `é` is `C3 A9`.
  `decodeUTF8` reads 1- to 3-byte sequences back, but only on a Director below version 11; from version 11 the text
  is used as it arrives.
- `client.textdata.utf8` false or missing: both functions return the text unchanged, so each byte is one character of
  the client's locale, such as Windows-1252.
- On a Director below version 11, `convertSpecialChars` then maps characters through `char.conversion.win`
  (`[128:164]`) or `char.conversion.mac`, by platform. From version 11 the tables are emptied.
- On a Director of version 11 or later, with no encryption, `send` with a text body refuses any character above 127:
  "Encryption required for non-ascii content with SW11", a critical error. `sendNew` does not check.

# Commands

`registerCommands(connection, object, ["NAME": id, …])` stores, per connection, `NAME → B64(id)`
([B64](#b64)). The id is turned into its 2 characters when it is registered, not when it is sent.

- Every cast that sends a command registers it, and the same name may be registered by several casts. If two of them
  give it different ids, the last one wins and the manager logs "Registered command override".
- `unregisterCommands` removes nothing: once a name is registered, it stays.

`registerListener(connection, object, [id: #handler, …])` stores, per connection, `id → [[object, handler], …]`. A
handler the object does not have is skipped, with an error. `unregisterListener` removes one `[object, handler]` pair.

# The `#mus` connection

`#mus` carries the photo data of `hh_photo` (s1-16). It is not Holo's MUS, the
site-to-server commands of 0013 (`knowledge/decisions/server/0013-site-changes-like-mus.md`); the two only share a name.

## Wire format

`connectToNetServer("*", "*", host, port, "*", 0)` opens the Multiuser Xtra in its own message mode, not raw mode.
Every message is `(recipients, subject, content)`, and the Xtra writes the bytes on the wire: MUS, the protocol of
Macromedia's Shockwave Multiuser Server. No `.ls` script holds that byte format, so it comes from LibreShockwave's
Multiuser Xtra (0015 (`knowledge/decisions/server/0015-client-on-libreshockwave.md`)), and s1-24
describes it.

What the scripts put in those messages:

- `send(tMsg)`: the subject is the first word of `tMsg`, and the content is the rest from the second word on. Below
  Director 11 both go through `encodeUTF8`. Recipients are always `"*"`. `send("LOGIN 12 abc")` sends subject `LOGIN`
  and content `12 abc`.
- `sendBinary(tObject)`: subject `BINDATA`, with a Lingo value as content (the photo data `hh_photo` builds).
- Received with text content: the listeners get `subject & RETURN & content`, run through `convertSpecialChars`.
  The first word is the subject they are looked up by, and `#content` is word 2 to the end. `DISCONNECT` is also
  delivered, with no content, when the connection drops by itself.
- Received with non-text content: passed to the one binary callback, `binaryDataReceived` of the Binary Manager.
- A message with no content and the subject `ConnectToNetServer` is the Xtra's reply to the connect; any other empty
  message is an error.

## Session

The Binary Manager owns `#mus` and keeps a queue of tasks: `#store` (`storeBinaryData`), `#retrieve`
(`retrieveBinaryData`) and `#fusemsg` (`addMessageToBinaryQueue`).

1. The first task with no `#mus` open creates it, and checks every 1000 ms until the connection has received a
   message and the handshake is finished.
2. The server sends `HELLO`, with content a number as text. `0`, empty or not a number means no encryption; any
   other number becomes an RC4 key (`72_RC4 Class.ls`, `setKey(…, #initPremix)`) and turns `pUseCrypto` on.
3. Client: `LOGIN <user id> <machine id>`, each enciphered with that key when `pUseCrypto` is on. The user id is the
   session's `user_user_id`, from the `#info` login.
4. Tasks, one at a time, in order:
   - `#store`: `BINDATA` with the data. The server answers `BINDATA_SAVED`, whose content goes to the task's callback
     (`binaryDataStored`), or `BINDATA_AUTHKEYERROR`, which drops the task.
   - `#retrieve`: `GETBINDATA <id> <auth>`. The server answers with a binary message, given to the callback as
     `binaryDataReceived(data, id)`.
   - `#fusemsg`: the text is sent as it is, and the queue moves on without waiting.
5. With the queue empty, a 30,000 ms timeout closes `#mus`. The next task opens it again.

The Binary Manager also listens for `U_RTS` and does nothing with it. `hh_photo` adds `OK` and `FILM` on `#mus`,
described in s1-16.

# Encryption

The server skips it (0012 (`knowledge/decisions/server/0012-no-encryption.md`)), so this is only what the client would do.

- `handleCryptoParameters` always takes client-to-server encryption as on, so the client always answers
  `CRYPTOPARAMETERS` with `GENERATEKEY` and its Diffie–Hellman public key in hex. The server then chooses: it answers
  `ENDOFCRYPTOPARAMS` and the session stays plain, or `SERVERSECRETKEY` with its own public key in hex.
- With `SERVERSECRETKEY`, the client computes the shared key. It gives one cipher object of
  `86_tYy1rX5j7e4PLYJLER.ls` to the connection as encoder and one as decoder, and calls `setEncryption(1)`. From then
  on `send` and `sendNew` encipher the whole frame, length and id included.
- Server-to-client text is deciphered only when `CRYPTOPARAMETERS` carried a non-zero integer. In that case the
  client also sends `SECRETKEY` and turns `#deciphering` on.
- When `CRYPTOPARAMETERS` is 0, the server never sends `SERVERSECRETKEY`, and nothing is enciphered in either
  direction.

[hh_entry_init](/r26/hh_entry_init.md#the-handshake) maps these messages' ids and the rest of the
handshake.

# Notes

- `connection.log.level` is 0 in `1_System Props.txt`, so the client logs no traffic.
- Ids registered for both `#info` and `#mus` do not clash: each connection has its own tables, keyed by its id.
- The `tLength` that `52_Multiuser Instance Class.ls` computes in `send` is never used.
