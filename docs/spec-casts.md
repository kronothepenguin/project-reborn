# Cast Source Reference Specification

**Purpose:** Reference guide for navigating the ripped Macromedia Director R26 Habbo Hotel source code stored in `/casts/`. Use this to locate algorithms and protocol logic for reimplementation in Go (game server) and Godot 4 (client).

---

## 1. Startup Sequence

```
habbo.dcr  (Director projector — entry point)
  └── Internal_1_Initialization.ls
        └── preloads castLib(2): fuse_client.cct
              └── reads external_variables.txt
                    └── loads cast.entry.1 through cast.entry.47  (47 feature casts)
```

- `/casts/habbo/` contains the projector bootstrap scripts: `Internal_1_Initialization.ls`, `Internal_2_Init.ls`, `Internal_3_Loop.ls`, and `Casts.csv`.
- `/casts/fuse_client/` is the engine/framework cast loaded first; it bootstraps everything else.
- `/client/external/external_variables.txt` contains the `cast.entry.*` keys that tell fuse_client which feature casts to load and in what order.

---

## 2. Cast Folder Anatomy

Every cast lives in its own directory under `/casts/`. The layout is consistent:

```
/casts/hh_entry_init/
  Members.csv                  cast member index (see section 3)
  1_thread.index.txt           thread definitions for this cast
  2_variable.index.txt         cast-local config key=value pairs
  6_Login Interface Class.ls   cast member #6 — Lingo source
  7_Login Component Class.ls   cast member #7
  8_Login Handler Class.ls     cast member #8
  9_Login Subscript.ls
  19_login_b.window.txt        cast member #19 — UI window layout
  ...
```

**File naming convention:** Every file is prefixed with its cast member `Number` from `Members.csv`, followed by an underscore and the original internal member name. The number is the canonical identifier; the name is the label used in Lingo code.

---

## 3. Members.csv

Each cast directory contains a `Members.csv` with the following columns:

| Column | Description |
|---|---|
| `Number` | Cast member index (matches the numeric file prefix) |
| `Type` | `script`, `field`, `bitmap`, `sound`, etc. |
| `Name` | Original internal name referenced in Lingo code |
| `Registration Point` | `(x, y)` pixel anchor for bitmap members; `(0, 0)` for non-visual |
| `Filename` | Original external filename if the member was linked; empty if internal |

Use `Members.csv` to cross-reference a file on disk with its original cast member name and type. Script members are the code; field members are data (config, window layouts, indexes).

---

## 4. File Type Reference

### `.ls` — LingoScript source
The actual code. Named `[Number]_[Class Name].ls`. These are the primary reading target for the remake. Focus on `Handler`, `Component`, and framework classes.

### `.txt` subtypes — by naming convention

| Filename pattern | Original member name | Content |
|---|---|---|
| `thread.index.txt` | `thread.index` | Lists thread IDs and their Interface/Component/Handler class names for this cast |
| `variable.index.txt` | `variable.index` | Key=value config variables scoped to this cast |
| `System Props.txt` | `System Props` | Master config for fuse_client: manager class arrays, system settings, struct prototypes |
| `System Texts.txt` | `System Texts` | Localized UI strings |
| `external_variables.txt` | — | External file read at runtime; contains `cast.entry.*` load list and server addresses |
| `external_texts.txt` | — | External localized strings loaded at runtime |
| `external_props.txt` | — | External property overrides loaded at runtime |
| `fuse.object.classes.txt` | `fuse.object.classes` | Declares object class hierarchies for a cast (used in `hh_furni_classes`) |
| `*.data.txt`, `*.props.txt` | varies | Structured data for specific game objects (e.g. furniture placeholder definitions) |

### `.window.txt` — UI window layouts
Saved as `[Number]_[name].window.txt`. Originally `field` members containing XML-like markup that describes a window: widget types, positions, sizes, and identifiers. Use these as layout reference when rebuilding UI in Godot. Do not port the format itself.

### `Members.csv`
See section 3. Present in every cast directory.

### `.htm` — character encoding tables
Mac-to-Windows character conversion tables. Irrelevant for the remake; UTF-8 handles this natively. Ignore these files entirely.

---

## 5. Thread System (MVC-like Pattern)

Each feature cast implements one or more **Threads**. A Thread is a self-contained feature module composed of three Lingo classes:

| Component | Suffix | Role |
|---|---|---|
| Interface Class | `Interface Class.ls` | UI rendering and user input events (View) |
| Component Class | `Component Class.ls` | Connects Interface to Handler; contains feature logic (Controller) |
| Handler Class | `Handler Class.ls` | Game protocol: commands sent to server, callbacks from server, event dispatch (Model/Protocol) |

Thread IDs and their class mappings are declared in `thread.index.txt`. Example from `/casts/hh_entry_init/1_thread.index.txt`:

```
thread.id              = ["login", "openinghours"]
login.interface.class  = Login Interface Class
login.component.class  = Login Component Class
login.handler.class    = Login Handler Class
openinghours.interface.class = Opening Hours Interface Class
openinghours.component.class = Opening Hours Component Class
openinghours.handler.class   = Opening Hours Handler Class
```

The Thread Manager (`/casts/fuse_client/29_Thread Manager Class.ls`) loads and unloads threads dynamically at runtime.

**For the remake:** Handler classes contain the protocol logic worth porting. Interface and Component classes describe behavior that maps to Godot nodes and signals.

---

## 6. fuse_client Framework

`/casts/fuse_client/` implements an OOP and component system on top of Lingo, which had no native OOP. Understanding this system is necessary to read the code, but it should not be ported.

### OOP via property lists
Classes are Lingo scripts. Instances are property lists (structs) built by a factory pattern. Inheritance is simulated by composing arrays of class names declared in `System Props.txt`.

### Key framework files

| File | Purpose |
|---|---|
| `27_Object Manager Class.ls` | Singleton registry; stores references to all live object instances |
| `29_Thread Manager Class.ls` | Loads/unloads threads dynamically |
| `26_Manager Template Class.ls` | Base class inherited by all managers via `System Props` class arrays |
| `72_RC4 Class.ls` | RC4 encryption used for the game protocol connection |
| `1_System Props.txt` | Declares manager class arrays, e.g. `connection.manager.class = ["Manager Template Class", "Connection Manager Class"]` |
| `2_System Texts.txt` | Localized UI strings |

### API files
Files named `[Number]_[Name] API.ls` (e.g. `12_Connection API.ls`) are flat function wrappers providing a public interface to their corresponding manager. They exist because Lingo had no namespaces. When reading code, trace calls through the API file into the manager.

### Manager inheritance
`System Props.txt` declares manager classes as arrays. When a manager is instantiated, fuse_client merges the properties of all listed classes in order. The first entry is typically `Manager Template Class` (base), followed by the specific manager.

---

## 7. What to Port vs. Ignore vs. Reference

### PORT — extract algorithms and logic
- **Handler classes** in all feature casts: game protocol commands, server callbacks, event dispatch
- `/casts/fuse_client/72_RC4 Class.ls`: RC4 encryption for the connection
- `/casts/hh_room/7_Room Geometry Class.ls`: isometric coordinate math
- `/casts/hh_human/` — figure rendering and animation logic (Figure System Class, Human Class EX, Bodypart Class EX, Figure Data Class)
- `/casts/hh_room_utils/` — pathfinding, movement, chat manager, object mover
- `/casts/hh_buffer/` — Buffer Handler: binary packet framing
- `/casts/hh_furni_classes/` — furniture state machines and interaction logic
- `/casts/hh_navigator/6_Navigator Handler Class.ls` — room list and search protocol
- Chat bubble logic in `/casts/hh_room_ui/`

### IGNORE — do not port (Godot replaces natively)
- The entire Thread/Manager/Object OOP system in `fuse_client/`
- Thread Manager, Object Manager, Manager Template Class
- API wrapper files (any `* API.ls`)
- Download Manager, CastLoad Manager, Timeout Manager (Director-specific machinery)
- `/casts/habbo/` bootstrap scripts (projector initialization, not game logic)

### REFERENCE ONLY — consult but rebuild natively
- `.window.txt` files: UI layout and widget structure. Use as layout reference for Godot scenes; do not parse or port the format.
- Interface classes: describe what the UI does and what events it handles. Map to Godot signals and Control nodes.
- Component classes: describe data flow between UI and protocol. Map to Godot autoloads or scene scripts.
- `/casts/fuse_client/2_System Texts.txt`: UI string catalog. Extract strings; do not port the lookup system.

### IRRELEVANT
- `.htm` character conversion tables — discard entirely.

---

## 8. Cast Index

| entry # | Cast | Description |
|---|---|---|
| 1 | `hh_entry_uk` | UK-specific entry overrides |
| 2 | `hh_entry_base` | Base entry and session initialization |
| 3 | `hh_shared` | Shared utilities: Hobba moderation tools, Ticket Window, Help Tooltip, Date Class |
| 4 | `hh_interface` | Core UI element definitions: buttons, scrollbars, dropdowns, general loader window |
| 5 | `hh_patch_uk` | UK client patch overrides |
| 6 | `hh_human` | Figure system: Human Class EX, Figure System Class, Figure Data Class, Figure Preview |
| 7 | `hh_human_body` | Body part graphics |
| 8 | `hh_human_face` | Face graphics |
| 9 | `hh_human_item` | Held item graphics |
| 10 | `hh_human_hats` | Hat graphics |
| 11 | `hh_human_hair` | Hair graphics |
| 12 | `hh_human_shirt` | Shirt/top graphics |
| 13 | `hh_human_leg` | Leg/trouser graphics |
| 14 | `hh_human_shoe` | Shoe graphics |
| 15 | `hh_kiosk_room` | Kiosk/public room — TODO: verify Handler |
| 16 | `hh_pets_common` | Shared pet logic and data |
| 17 | `hh_room_utils` | Room utilities: pathfinding, movement, chat manager, info stand, object mover, badges |
| 18 | `hh_room_ui` | In-room UI: object display windows, room info, chat bubbles |
| 19 | `hh_furni_classes` | Furniture class implementations: teleport, fridge, TV, PostIt, wheel, credit furni |
| 20 | `hh_room` | Core room: Room Interface/Component/Handler, Room Geometry Class, Spectator system, Hiliter |
| 21 | `hh_club` | Habbo Club subscription UI and protocol |
| 22 | `hh_photo` | Photo/snapshot feature |
| 23 | `hh_navigator` | Navigator: room list, search, group rooms, password rooms |
| 24 | `hh_cat_code` | Catalogue purchase logic and order dialogs |
| 25 | `hh_cat_gfx_all` | Catalogue graphics and UI |
| 26 | `hh_buffer` | Binary buffer protocol: packet framing, member alias index |
| 27 | `hh_dynamic_downloader` | Dynamic asset downloading at runtime |
| 28 | `hh_recycler` | Recycler/exchange feature |
| 29 | `hh_poll` | In-room poll feature |
| 30 | `hh_tutorial` | Tutorial system |
| 31 | `hh_entry_init` | Login and opening hours: Login Interface/Component/Handler, window layouts |
| 32 | `hh_human_acc_eye` | Eye accessory graphics |
| 33 | `hh_human_acc_face` | Face accessory graphics |
| 34 | `hh_human_acc_head` | Head accessory graphics |
| 35 | `hh_human_50_face` | Face graphics (legacy 50px scale) |
| 36 | `hh_human_50_hats` | Hat graphics (legacy 50px scale) |
| 37 | `hh_human_50_hair` | Hair graphics (legacy 50px scale) |
| 38 | `hh_human_50_acc_eye` | Eye accessory graphics (legacy 50px scale) |
| 39 | `hh_human_50_acc_face` | Face accessory graphics (legacy 50px scale) |
| 40 | `hh_human_50_acc_head` | Head accessory graphics (legacy 50px scale) |
| 41 | `hh_human_50_body` | Body graphics (legacy 50px scale) |
| 42 | `hh_friend_list` | Friend list: online status, messaging, relationships |
| 43 | `hh_instant_messenger` | Instant messenger (console) UI and protocol |
| 44 | `hh_ig` | In-game feature — TODO: verify Handler |
| 45 | `hh_ig_interface` | In-game interface layer — TODO: verify Handler |
| 46 | `hh_pets` | Pet system: pet objects and interactions |
| 47 | `hh_guide` | Guide/help system |
