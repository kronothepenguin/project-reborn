# Task: fuse_client — Core Engine

**Priority:** P0 (DONE — Partial)  
**Status:** 🟡 Partially translated  
**Source:** `casts/fuse_client/` (72 `.ls` files, 5 `.window.txt`, system props/texts)

## Description

The foundational FuseClient runtime. Provides the entire object model, threading, messaging, windowing, networking, encryption, and rendering infrastructure. All other casts depend on this.

## Already Translated ✅
- `6_Object API.ls` → `src/casts/fuse_client/object-api.js`
- `27_Object Manager Class.ls` → `src/casts/fuse_client/object-manager-class.js`
- `46_Object Base Class.ls` → `src/casts/fuse_client/object-base-class.js`
- `8_Core Thread API.ls` → `src/casts/fuse_client/thread-api.js`
- `29_Thread Manager Class.ls` → `src/casts/fuse_client/thread-manager-class.js`
- `4_Client Initialization Script.ls` → `src/casts/fuse_client/client-initialization.js`
- `7_Error API.ls` → `src/casts/fuse_client/error-api.js`
- `3_Event Broker Behavior.ls` → `src/casts/fuse_client/event-broker.js`
- `1_System Props.txt` → `src/system/system-props.js`

## Still To Translate

### Core APIs (numbered 9-25)
| # | Source File | Description |
|---|------------|-------------|
| 9 | `9_Resource API.ls` | `createMember()`, `getMember()`, `registerMember()` |
| 10 | `10_CastLoad API.ls` | Dynamic cast loading API |
| 11 | `11_Download API.ls` | Download manager API |
| 12 | `12_Connection API.ls` | Network connection API |
| 13 | `13_Sprite API.ls` | Sprite manipulation API |
| 14 | `14_Timeout API.ls` | Timeout/scheduler API |
| 15 | `15_Text API.ls` | Text/string resource API |
| 16 | `16_String Services API.ls` | String manipulation services |
| 17 | `17_Visualizer API.ls` | Visualizer creation/management API |
| 18 | `18_Window API.ls` | Window creation/management API |
| 19 | `19_Broker Manager API.ls` | Message broker manager API |
| 20 | `20_Variable API.ls` | Global variable container API |
| 21 | `21_Write API.ls` | File/data writing API |
| 22 | `22_Binary API.ls` | Binary data handling API |
| 23 | `23_Special Services API.ls` | Net page opening, external links |
| 24 | `24_Multiuser API.ls` | Multi-user connection API |

### Manager Classes (numbered 26-45)
| # | Source File | Description |
|---|------------|-------------|
| 26 | `26_Manager Template Class.ls` | Base template all managers inherit from |
| 28 | `28_Error Manager Class.ls` | Error manager implementation |
| 30 | `30_Resource Manager Class.ls` | Resource/asset manager |
| 31 | `31_Download Manager Class.ls` | Download queue manager |
| 32 | `32_CastLoad Manager Class.ls` | ⭐ Cast library loading (.cct/.cst) |
| 33 | `33_Connection Manager Class.ls` | Network connection manager |
| 34 | `34_Sprite Manager Class.ls` | Sprite channel manager |
| 35 | `35_Timeout Manager Class.ls` | Timeout scheduler |
| 36 | `36_Text Manager Class.ls` | Text resource manager |
| 37 | `37_String Services Class.ls` | String utility services |
| 38 | `38_Visualizer Manager Class.ls` | Visualizer rendering manager |
| 39 | `39_Window Manager Class.ls` | Window UI manager |
| 40 | `40_Broker Manager Class.ls` | Message broker manager |
| 41 | `41_Method Manager Class.ls` | Method routing/dispatch |
| 42 | `42_Binary Manager Class.ls` | Binary data manager |
| 43 | `43_Writer Manager Class.ls` | Data writing manager |
| 44 | `44_Special Services Class.ls` | Special services manager |
| 45 | `45_Multiuser Manager Class.ls` | Multi-user manager |

### Instance Classes (numbered 47-52)
| # | Source File | Description |
|---|------------|-------------|
| 47 | `47_Variable Container Class.ls` | Variable storage container |
| 48 | `48_Download Instance Class.ls` | Individual download instance |
| 49 | `49_CastLoad Instance Class.ls` | Individual cast load instance |
| 50 | `50_CastLoad Task Class.ls` | Cast load task wrapper |
| 51 | `51_Connection Instance Class.ls` | Connection instance (RC4 encoded) |
| 52 | `52_Multiuser Instance Class.ls` | Multi-user session instance |

### Layout/Window Classes (numbered 53-72)
| # | Source File | Description |
|---|------------|-------------|
| 53 | `53_Layout Parser Class.ls` | Parses room .room recording files |
| 54 | `54_Visualizer Instance Class.ls` | Visualizer instance implementation |
| 55 | `55_Window Instance Class.ls` | Window instance implementation |
| 56 | `56_Element Wrapper Class.ls` | UI element wrapper base |
| 57 | `57_Grouped Element Class.ls` | Grouped UI element |
| 58 | `58_Unique Element Class.ls` | Unique UI element |
| 59 | `59_Image Wrapper Class.ls` | Image element wrapper |
| 60 | `60_Text Wrapper Class.ls` | Text element wrapper |
| 61 | `61_Field Wrapper Class.ls` | Editable field wrapper |
| 62 | `62_Pattern Wrapper Class.ls` | Pattern/fill wrapper |
| 63-65 | `63_Common Button Class.ls`, `64_Image Button Class.ls`, `65_Icon Button Class.ls` | Button widgets |
| 66 | `66_Scrollbar Class.ls` | Scrollbar widget (V/H variants) |
| 67 | `67_Event Agent Class.ls` | Event agent for sprite routing |
| 68 | `68_Loading Bar Class.ls` | Loading bar visualization |
| 69 | `69_Writer Class.ls` | Writer instance |
| 70 | `70_Thread Instance Class.ls` | Thread instance implementation |
| 71 | `71_FPS Test Class.ls` | Performance monitor |
| 72 | `72_RC4 Class.ls` | ⭐ RC4 encryption (multiple key modes) |

### Additional Classes (numbered 74-86)
| # | Source File | Description |
|---|------------|-------------|
| 74 | `74_Core Thread Class.ls` | Core thread (main loop handler) |
| 80 | `80_Visualizer Part Wrapper Class.ls` | Visualizer sub-part wrapper |
| 81 | `81_HttpCookie Instance Class.ls` | HTTP cookie handling |
| 82 | `82_CBigInt16.ls` | BigInt arithmetic (multiply, power, modulo) |
| 83 | `83_JSBigInt.ls` | BigInt stub (decompiled placeholder) |
| 84 | `84_JavaScript Proxy.ls` | JavaScript bridge stub |
| 85 | `85_UTF8 To Locale Class.ls` | UTF-8 locale conversion |
| 86 | `86_tYy1rX5j7e4PLYJLER.ls` | ⭐ Obfuscated RC4 Extended (triple-swap, key mixing) |

### Window Layout Files
- `75_modal.window.txt`
- `76_system.window.txt`
- `77_empty.window.txt`
- `78_error.window.txt`
- `79_performance.window.txt`

## Translation Criteria

1. **1:1 mapping**: Each `.ls` file → corresponding `.js` file preserving function/class names
2. **Object system**: Use the ancestor chain pattern from `object-manager-class.js`
3. **Global APIs**: Export as named functions matching Lingo handler names
4. **Manager classes**: Extend `ObjectBase`, register via `ObjectManager.registerClass()`
5. **Window files**: Parse XML-like format → JS layout objects for Canvas rendering
6. **Encryption**: RC4 must be byte-accurate for server compatibility
7. **BigInt**: Native JS BigInt can replace `CBigInt16` but keep API compatible

## Dependencies
- None (this is the root — everything depends on fuse_client)
