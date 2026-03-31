# Godot Client Specification

**Status:** WIP
**Location:** `client/`

---

## Goal

Reimplement the original Habbo R26 Macromedia Shockwave Director client as a Godot 4 project exported to HTML5. The Godot client must be wire-compatible with the game server's Habbo R26 binary protocol (see `spec-game-server.md`).

The exported HTML5 build is served statically by the `reborn` HTTP server from `web/client/`.

---

## Transport

The client supports two transports, selected at runtime based on the server URI scheme:

| URI scheme | Transport class | Use case |
|---|---|---|
| `tcp://` | `TCPTransport` (`StreamPeerTCP`) | Native (desktop) builds, or when external params supply a TCP URI. |
| `ws://` or `wss://` | `WebSocketTransport` (`WebSocketPeer`) | HTML5 export and any build where the server URI is a WebSocket URL. |

The connection URI is resolved at login time from external variables (`VariableContainer`):

- If `connection.info.host` is set, the client constructs `tcp://<host>:<port>` using `SpecialServices.build_tcp_uri`.
- If `connection.info.url` is set (and `connection.info.host` is empty), that URL is used directly. The URL's scheme prefix determines which transport class is instantiated.

Both transports implement the abstract `Transport` interface (`connect_to`, `poll`, `get_status`, `read_bytes`, `write_bytes`, `dispose`), so the connection layer above them is transport-agnostic.

---

## Connection Manager

`fuse_client/connection_manager.gd` manages two named connections:

| ID | Name | Purpose |
|---|---|---|
| `ID_INFO` | Info connection | Primary game protocol connection. |
| `ID_MUS` | MUS connection | Multi-user server (TBD). |

Each connection is polled every `_process` frame. Inbound packets are dispatched to registered listener callbacks keyed by command ID. Outbound packets are sent via `conn.send(cmd_name, args)`, which looks up the numeric command ID from a registered commands dictionary.

---

## Startup / Initialisation State Machine

`fuse_client/fuse_client.gd` drives a state machine before the hotel UI becomes active:

1. `LOAD_PARAMS` — reads `sw1`–`sw9` external params (semicolon-separated `key=value` pairs) into `VariableContainer`.
2. `LOAD_VARIABLES` — fetches `external_variables.txt` from the URL in `VariableContainer` (or `res://` in editor mode) and populates more variables.
3. `WAIT_VARIABLES` — waits for the HTTP fetch to complete.
4. `LOAD_RESOURCE_PACKS` — loads `.pck` resource packs listed as `cast.entry.N` variables.
5. `WAIT_RESOURCE_PACKS` — waits for pack loading.
6. `INIT_MODULES` — calls `ResourcePackManager.create_all()` and fires the `Initialize` message bus event.

---

## Protocol Layout (Client Side)

Packet framing in `ConnectionInstace`:

- **Read:** 2-byte command (6-bit encoding), body bytes up to terminator byte `1`.
- **Write:** 3-byte length prefix (6-bit, 3-byte), 2-byte command, body, no explicit terminator.

`Message` field encoding matches the server (`spec-game-server.md` IO Encoding table) and is implemented in GDScript inside `connection_manager.gd`.

---

## Project Structure

The Godot project root is `client/`. Key directories:

| Path | Description |
|---|---|
| `client/director/` | Director utilities: image composition, atlas textures, ink/inker, slice textures. Mirrors the Shockwave Director cast/sprite metaphor. |
| `client/fuse_client/` | Core client infrastructure: `ConnectionManager`, `MessageBus`, `VariableContainer`, `SpecialServices`, `ResourcePackManager`, `HTTPRequestPool`. |
| `client/figurepreview/` | Standalone avatar figure preview tool (see below). |
| `client/external/` | External variables and assets. |
| `client/.godot/` | Godot editor cache (not committed). |

### hh_* Scenes

Each `hh_*` directory is a resource pack module corresponding to a protocol feature:

| Scene | Feature |
|---|---|
| `hh_buffer` | Buffer management |
| `hh_cat_code` | Item catalogue |
| `hh_cat_gfx_all` | Catalogue graphics |
| `hh_club` | Habbo Club |
| `hh_dynamic_downloader` | Asset downloader |
| `hh_empty` | Empty room placeholder |
| `hh_entry_base` / `hh_entry_init` / `hh_entry_uk` | Login / entry flow |
| `hh_friend_list` | Friend list |
| `hh_furni_classes` | Furniture class definitions |
| `hh_guide` | Guide system |
| `hh_human` + `hh_human_*` | Avatar figure parts (body, face, hair, hats, accessories, etc.) |
| `hh_ig` / `hh_ig_interface` | In-game system UI |
| `hh_instant_messenger` | Private messaging |
| `hh_interface` | Main game HUD / chrome |
| `hh_kiosk_room` | Room kiosk dialogs |
| `hh_navigator` | Room navigator |
| `hh_pets` / `hh_pets_common` | Pets (TBD) |
| `hh_photo` | Photo system |
| `hh_poll` | Polls |
| `hh_recycler` | Recycler / exchange |
| `hh_room` / `hh_room_ui` / `hh_room_utils` | Room rendering and UI |
| `hh_shared` | Shared error/dialog messages |
| `hh_tutorial` | Tutorial |

---

## Figure Preview Tool

`client/figurepreview/` is a standalone Godot scene for rendering Habbo avatar figures from a figure string. Used as a development aid. Also exported separately to `web/figurepreview/`.

Dev server: `tools/dev/figurepreview/`.

---

## Asset Pipeline

| Tool | Location | Purpose |
|---|---|---|
| Client dev server | `tools/dev/client/` | Serves the Godot HTML5 export in development. |
| Build tool | `tools/build/` | Runs the Godot export pipeline to produce HTML5 builds. |
| Export presets | `client/export_presets.cfg` | Godot export configuration (HTML5 target). |
| Presets utility | `tools/presets/` | TBD. |
| WebSocket test tool | `tools/ws/` | Low-level WebSocket testing against the game server. |

Exported client output lands in `web/client/` and is served as static files.
