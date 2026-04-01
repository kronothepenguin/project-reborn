# Game Server Specification

**Status:** WIP
**Package:** `internal/app/game`

---

## Transport Layer

The game server exposes two transports, both handled by the same session logic:

| Transport | Purpose |
|---|---|
| TCP (port configurable via env, default 31337) | Classic Habbo client connections (original Shockwave client). |
| WebSocket at `/client/info` | HTML5 Godot client connections served over HTTP. |

Both transports implement the `transport.Connection` interface so the protocol layer is transport-agnostic.

---

## Habbo R26 Binary Protocol

### Packet Structure

All communication is framed as packets. Each packet consists of:

1. **Length prefix** — 3 bytes, Base64-encoded integer. Encodes the byte length of the command + message body.
2. **Command** — 2 bytes, Base64-encoded `int16`. Identifies the packet type.
3. **Message body** — variable-length payload. Field encoding depends on type.
4. **Packet terminator** — byte value `1` (on outgoing packets).

Wire encoding uses a 6-bit-per-byte scheme (values masked with `63`, with `64` added as a flag). This matches the original Habbo R26 wire format.

### IO Encoding

| Type | Encoding |
|---|---|
| `int16` (command/length) | 2 bytes, each `(v >> shift) & 63 | 64` |
| `int` | Variable-length: 1 header byte encoding sign, low 2 bits, and byte count; subsequent bytes each hold 6 bits of value. |
| `string` | 2-byte length prefix (same 6-bit encoding) followed by UTF-8 bytes, terminated by byte `2`. |
| `bool` | 1 byte: `64` (false) or `65` (true). |
| raw string | Unframed UTF-8, read to end of buffer. |

The implementation is in `internal/app/game/protocol/io.go`.

### Crypto

Post-handshake traffic is encrypted with a custom RC4 variant (`protocol/crypto.go`):

- Key exchange uses Diffie-Hellman with a fixed prime `P` and generator `G = 5`.
- The shared key is derived during the `GenerateKey` / `SecretKey` handshake packets.
- The cipher applies a salted KSA and a modified PRGA with extra swap steps at specific indices.
- A decode-side seed string is consumed after each decoded chunk.

---

## Session Lifecycle

```
Client connects (TCP or WebSocket)
  |
  v
SendInitialCommands()      -- server sends: HELLO, CRYPTOPARAMETERS, ENDOFCRYPTOPARAMS
  |
  v
Login loop (loginRegistry)
  |
  +-- client: VersionCheck, UniqueID, LangCheck, GenerateKey, SSO / TryLogin
  |
  v
session.Habbo set (Hotel.Login)
  |
  v
Game loop (gameRegistry)
  |
  +-- client: GetInfo, GetCredits, Navigator, Room, FriendList, IM, Catalogue, ...
  |
  v
Connection closed / error -> cleanup (Habbo.Connection = NopConnection)
```

The session transitions from `loginRegistry` to `gameRegistry` once `session.Habbo` is non-nil.

---

## Virtual State Model

All mutable game state is held in memory under `internal/pkg/virtual/`:

| Type | Description |
|---|---|
| `Hotel` | Singleton. Owns all online `Habbo` instances and the global `Navigator`. Has a `Storage` reference for persistence. |
| `Habbo` | One per connected, authenticated player. Embeds `Connection` (the live session writer), `FriendList`, `Achievements`, navigator flats, rights, badges. |
| `Navigator` | Tree of `NavigatorInfo` nodes (categories and flats/rooms). Shared across all sessions. |
| `Room` | TBD. |
| `FriendList` | Per-Habbo friend state. |
| `Achievement` | Per-Habbo achievement records. |

`Hotel.Login(ticket)` creates and loads a `Habbo` from storage, then registers it in the live map. On disconnect, `Habbo.Connection` is set to `NopConnection()` to prevent writes to a closed socket.

---

## Protocol Registries

Two registries are created in `game.New()`:

- **`loginRegistry`** — handles pre-authentication packets.
- **`gameRegistry`** — handles post-authentication packets.

Each registry holds:
- **Commands** — outbound packet IDs registered by name (used by handler code to look up the numeric ID for a given logical command).
- **Listeners** — inbound packet handlers keyed by numeric command ID.

### Login Registry Handlers (hh_entry_init)

| Inbound ID | Handler |
|---|---|
| 756 | TryLogin |
| 1170 | VersionCheck |
| 813 | UniqueID |
| 58 | LangCheck |
| 2002 | GenerateKey |
| 204 | SSO |
| 206 | InitCrypto |
| 207 | SecretKey |

### Game Registry Handlers

| Module | Scope |
|---|---|
| `hh_entry_init` (session) | GetInfo, GetCredits, GetPassword, Pong, Badges, SessionParameters, SoundSettings, Achievements, Latency |
| `hh_navigator` | Room listing, navigation |
| `hh_room` | Room join, state |
| `hh_kiosk_room` | Room kiosk dialogs |
| `hh_room_utils` | Room utility dialogs |
| `hh_friend_list` | Friend social system |
| `hh_instant_messenger` | Private messaging |
| `hh_cat_code` | Item catalogue |
| `hh_club` | Habbo Club subscription |
| `hh_guide` | Guide system |
| `hh_photo` | Photo system |
| `hh_poll` | Polls |
| `hh_recycler` | Recycler / item exchange |
| `hh_dynamic_downloader` | Client asset downloader |
| `hh_buffer` | Buffer management |
| `hh_ig` | In-game system |
| `hh_tutorial` | Tutorial |
| `hh_shared` | Shared messages: error_report, hobba |

---

## Mapping Lingo Casts to Go Packages

The Lingo cast name is a starting point, not an architecture boundary. Two things to keep in mind:

### Casts communicate across boundaries
In the original source, casts call each other via `executeMessage` (global event bus) and shared objects (`getObject(#session)`). A single game action may involve handlers across multiple casts. Example: `PURSE` (server→client, ID 6) is handled by `hh_cat_code`, but it is also sent by the server in response to `GET_CREDITS` from the login flow. The cast that registers a listener in `regMsgList` owns the handler — not the cast whose name matches the command.

**Rule:** Before implementing a Go handler, read the `regMsgList` of the corresponding Lingo Handler class to identify exactly which command IDs it owns.

### What to map 1:1 and what to skip
| Lingo | Go server | Godot client |
|---|---|---|
| Handler class `regMsgList` + callbacks | Go handler functions in a package per feature | GDScript handling server messages |
| Protocol command IDs | Registered in `protocol.Registry` | Packet dispatch in connection manager |
| Object Manager / Thread Manager | Not ported — Go uses plain structs | Not ported — Godot uses autoloads and nodes |
| Interface Class | Not applicable | Rebuilt as `.tscn` scene + Control nodes |
| Component Class | Not applicable | Scene script or autoload |
| `.window.txt` layouts | Not applicable | Reference only — recreate as Godot scenes |
| `executeMessage` event bus | Not applicable | Godot signals |
