# Habbo R26 Protocol Specification

**Source:** LingoScript Handler Classes from `/casts/` directory
**Era:** Habbo Hotel R26 (2008)
**Purpose:** Complete protocol reference for Project Reborn implementation

---

## Protocol Encoding Notes

### Inbound Messages (Server→Client)
Inbound messages use the **numeric opcode directly** in the packet payload. Handlers register listeners with the opcode:
```lingo
tMsgs.setaProp(295, #handle_furni_revisions)  -- Opcode 295 = FURNI_REVISIONS
```

### Outbound Commands (Client→Server)
Outbound commands are registered with a **string name and opcode**:
```lingo
tCmds.setaProp("GET_FURNI_REVISIONS", 213)  -- GET_FURNI_REVISIONS → Opcode 213
```

The Connection Manager encodes the opcode to **2 bytes** using this format:
```lingo
tBy1 = numToChar(bitOr(64, tNum / 64))   -- Byte 1: 64 + (opcode / 64)
tBy2 = numToChar(bitOr(64, bitAnd(63, tNum)))  -- Byte 2: 64 + (opcode % 64)
tCommand = tBy1 & tBy2 & commandName  -- Example: CHR(67)&CHR(85)&"GET_FURNI_REVISIONS"
```

**Example:** Opcode 213 → Bytes [67, 85] → `CHR(67) + CHR(85) + "GET_FURNI_REVISIONS"`

### Connection Types
- **Info Connection** (`connection.info.id`): Login, navigator, friends, IM, catalogue
- **Room Connection** (`connection.room.id`): Room protocol, furniture, chat
- **MUS Connection** (`connection.mus.id`): Photo system

---

## 1. Connection & Session Management

### 1.1 Initial Connection

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 0 | `HELLO` | Inbound | `hh_entry_init` | — |
| 206 | `INIT_CRYPTO` | Outbound | `hh_entry_init` | — |
| 277 | `CRYPTO_PARAMETERS` | Inbound | `hh_entry_init` | `serverToClient: bool` |
| 2002 | `GENERATEKEY` | Outbound | `hh_entry_init` | `publicKey: string` |
| 1 | `SERVER_SECRET_KEY` | Inbound | `hh_entry_init` | `serverPublicKey: string` |
| 207 | `SECRETKEY` | Outbound | `hh_entry_init` | `clientPublicKey: string` |
| 2 | `END_OF_CRYPTO_PARAMS` | Inbound | `hh_entry_init` | — |
| 1170 | `VERSIONCHECK` | Outbound | `hh_entry_init` | `versionId: int, clientURL: string, extVarsURL: string` |
| 813 | `UNIQUEID` | Outbound | `hh_entry_init` | `machineID: string` |
| 1817 | `GET_SESSION_PARAMETERS` | Outbound | `hh_entry_init` | — |
| 257 | `SESSION_PARAMETERS` | Inbound | `hh_entry_init` | `count: int, pairs: [{id: int, value: int|string}]` |

### 1.2 Login

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 756 | `TRY_LOGIN` | Outbound | `hh_entry_init` | `username: string, password: string` |
| 3 | `LOGIN_OK` | Inbound | `hh_entry_init` | — |
| 7 | `GET_INFO` | Outbound | `hh_entry_init` | — |
| 8 | `GET_CREDITS` | Outbound | `hh_entry_init` | — |
| 5 | `USER_OBJ` | Inbound | `hh_entry_init` | `userId: string, name: string, figure: string, sex: string, customData: string, phTickets: int, phFigure: string, photoFilm: int, directMail: int` |
| 33 | `ERR` | Inbound | `hh_entry_init` | `errorMessage: string` |
| 35 | `USER_BANNED` | Inbound | `hh_entry_init` | `banMessage: string` |
| 161 | `MOD_ALERT` | Inbound | `hh_entry_init` | `messageText: string, url: string` |
| 287 | `HOTEL_LOGOUT` | Inbound | `hh_entry_init` | `logoutMsgId: int (-1=disconnect, 1=logged_out, 2=concurrent, 3=timeout)` |

### 1.3 Session Maintenance

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 50 | `PING` | Inbound | `hh_entry_init` | — |
| 196 | `PONG` | Outbound | `hh_entry_init` | — |
| 141 | `CHECKSUM` | Inbound | `hh_entry_init` | `checksum: string` |
| 105 | `BTCKS` | Outbound | `hh_entry_init` | — |
| 139 | `SYSTEM_BROADCAST` | Inbound | `hh_entry_init` | `message: string` |
| 52 | `EPS_NOTIFY` | Inbound | `hh_entry_init` | `type: int, data: string` |
| 354 | `LATENCY_TEST` | Inbound | `hh_entry_init` | `latencyId: int` |
| 315 | `TEST_LATENCY` | Outbound | `hh_entry_init` | — |
| 316 | `REPORT_LATENCY` | Outbound | `hh_entry_init` | `latencyId: int, latency: int` |

### 1.4 User Rights & Badges

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 2 | `RIGHTS` | Inbound | `hh_entry_init` | `privileges: string[]` (null-terminated) |
| 7 | `GET_INFO` | Outbound | `hh_entry_init` | — |
| 8 | `GET_CREDITS` | Outbound | `hh_entry_init` | — |
| 157 | `GET_AVAILABLE_BADGES` | Outbound | `hh_entry_init` | — |
| 229 | `AVAILABLE_BADGES` | Inbound | `hh_entry_init` | `count: int, badges: string[], chosenCount: int, chosen: [{index: int, badgeId: string}]` |
| 159 | `GET_SELECTED_BADGES` | Outbound | `hh_entry_init` | — |

### 1.5 Achievements

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 370 | `GET_POSSIBLE_ACHIEVEMENTS` | Outbound | `hh_entry_init` | — |
| 436 | `POSSIBLE_ACHIEVEMENTS` | Inbound | `hh_entry_init` | `count: int, achievements: [{typeId: int, level: int, badgeId: string}]` |
| 437 | `ACHIEVEMENT_NOTIFICATION` | Inbound | `hh_entry_init` | `typeId: int, level: int, badgeId: string, removedBadgeId: string` |

### 1.6 Sound Settings

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 228 | `GET_SOUND_SETTING` | Outbound | `hh_entry_init` | — |
| 308 | `SOUND_SETTING` | Inbound | `hh_entry_init` | `state: int (0=off, 1=on)` |
| 229 | `SET_SOUND_SETTING` | Outbound | `hh_entry_init` | `state: int` |

---

## 2. Room Protocol

### 2.1 Room Entry & Exit

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| — | `OPC_OK` | Inbound | `hh_room` | — |
| — | `CLC` | Inbound | `hh_room` | — |
| — | `YOUAREMOD` | Inbound | `hh_room` | — |
| — | `FLAT_LETIN` | Inbound | `hh_room` | `name: string` |
| — | `ROOM_READY` | Inbound | `hh_room` | `roomId: string` |
| — | `LOGOUT` | Inbound | `hh_room` | `userId: string` |
| — | `DISCONNECT` | Inbound | `hh_room` | — |
| — | `ERROR` | Inbound | `hh_room` | `errorMessage: string` |
| 50 | `HEIGHTMAP` | Inbound | `hh_room` | `heightMap: string` (line-delimited tile grid) |
| 51 | `HEIGHTMAPUPDATE` | Inbound | `hh_room` | `heightMap: string` |
| 40 | `USERS` | Inbound | `hh_room` | `userCount: int, users: [{prop: char, data: string}]` |
| 27 | `STATUS` | Inbound | `hh_room` | `userCount: int, status: string` (line-delimited) |
| 44 | `OBJECTS` | Inbound | `hh_room` | `objectCount: int, objects: string` (line-delimited) |
| 90 | `ACTIVEOBJECTS` | Inbound | `hh_room` | `count: int, objects: [{id, class, x, y, width, height, direction, altitude, colors, runtimeData, extra, stuffData}]` |

### 2.2 Furniture Lifecycle (Buffer)

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 84 | `REMOVEITEM` | Inbound | `hh_buffer` | `itemId: string` |
| 85 | `UPDATEITEM` | Inbound | `hh_buffer` | `itemId: string, state: string` |
| 88 | `STUFFDATAUPDATE` | Inbound | `hh_buffer` | `targetId: string, value: string` |
| 94 | `ACTIVEOBJECT_REMOVE` | Inbound | `hh_buffer` | `objectId: string` |
| 95 | `ACTIVEOBJECT_UPDATE` | Inbound | `hh_buffer` | `object: {id, class, x, y, width, height, direction, altitude, colors, runtimeData, extra, stuffData}` |
| — | `ACTIVEOBJECT_ADD` | Inbound | `hh_room` | `object: {id, class, x, y, width, height, direction, altitude, colors, runtimeData, extra, stuffData}` |
| — | `REMOVESTRIPITEM` | Inbound | `hh_room` | `stripId: string` |

### 2.3 Asset Pipeline

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 213 | `GET_FURNI_REVISIONS` | Outbound | `hh_dynamic_downloader` | — |
| 295 | `FURNI_REVISIONS` | Inbound | `hh_dynamic_downloader` | `typeCount: 2, perType: [{count: int, entries: [{className: string, revision: int}]}]` |
| 215 | `GET_ALIAS_LIST` | Outbound | `hh_dynamic_downloader` | — |
| 297 | `ALIAS_LIST` | Inbound | `hh_dynamic_downloader` | `count: int, aliases: [{originalClass: string, aliasClass: string}]` |
| 217 | `DOWNLOAD_URLS` | Inbound | `hh_dynamic_downloader` | `urls: string[]` |

### 2.4 Furniture Interactions

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 190 | `DICE_VALUE` | Inbound | `hh_room` | `objectId: string, value: int` |
| — | `PRESENTOPEN` | Inbound | `hh_room` | `type: string, code: string, colors: string` |
| — | `DOOR_IN` | Inbound | `hh_room` | `doorId: string, userName: string` |
| — | `DOOR_OUT` | Inbound | `hh_room` | `doorId: string` |
| — | `DOORFLAT` | Inbound | `hh_room` | `teleId: int, flatId: int` |
| — | `DOORDELETED` | Inbound | `hh_room` | — |
| 73 | `MOVESTUFF` | Outbound | `hh_room` | `objectId: string, x: int, y: int, direction: int` |
| 67 | `ADDSTRIPITEM` | Outbound | `hh_room` | `itemData: string` |

### 2.5 Room Properties

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| — | `FLATPROPERTY` | Inbound | `hh_room` | `key: string, value: string` |
| — | `ROOM_RIGHTS` | Inbound | `hh_room` | `subject: int (42=right_granted, 43=right_removed, 47=owner)` |
| 140 | `STRIPINFO` | Inbound | `hh_room` | `items: string` (complex delimited format) |
| 98 | `STRIPUPDATED` | Inbound | `hh_room` | — |
| 65 | `GETSTRIP` | Outbound | `hh_room` | `mode: string` |

### 2.6 Trading

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| — | `YOUARENOTALLOWED` | Inbound | `hh_room` | — |
| — | `OTHERNOTALLOWED` | Inbound | `hh_room` | — |
| — | `TRADE_ITEMS` | Inbound | `hh_room` | `user1: string, accept1: int, items1: string, user2: string, accept2: int, items2: string` |
| — | `TRADE_CLOSE` | Inbound | `hh_room` | — |
| — | `TRADE_ACCEPT` | Inbound | `hh_room` | `user: string, accepted: bool` |
| — | `TRADE_COMPLETED` | Inbound | `hh_room` | — |
| 70 | `TRADE_CLOSE` | Outbound | `hh_room` | — |
| 69 | `TRADE_ACCEPT` | Outbound | `hh_room` | — |
| 68 | `TRADE_UNACCEPT` | Outbound | `hh_room` | — |
| 71 | `TRADE_OPEN` | Outbound | `hh_room` | — |
| 72 | `TRADE_ADDITEM` | Outbound | `hh_room` | `itemId: string` |

### 2.7 Chat System

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 52 | `CHAT` | Outbound | `hh_room_utils` | `message: string` |
| 55 | `SHOUT` | Outbound | `hh_room_utils` | `message: string` |
| 56 | `WHISPER` | Outbound | `hh_room_utils` | `message: string` |
| 24 | `CHAT` | Inbound | `hh_room_utils` | `userId: string, message: string` |
| 25 | `WHISPER` | Inbound | `hh_room_utils` | `userId: string, message: string` |
| 26 | `SHOUT` | Inbound | `hh_room_utils` | `userId: string, message: string` |

### 2.8 Doorbell & Access

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| — | `DOORBELL_RINGING` | Inbound | `hh_room` | `visitorName: string` |
| — | `FLATNOTALLOWEDTOENTER` | Inbound | `hh_room` | `name: string` |
| 98 | `LETUSERIN` | Outbound | `hh_room` | `userName: string` |
| 57 | `TRYFLAT` | Outbound | `hh_room` | `password: string` |

### 2.9 Room Ads

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 180 | `ROOMAD` | Inbound | `hh_room` | `sourceURL: string, targetURL: string` |
| 126 | `GETROOMAD` | Outbound | `hh_room` | — |

### 2.10 Pet Stats

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| — | `PETSTAT` | Inbound | `hh_room` | `petId: int, name: string, age: int, hungry: int, thirsty: int, happiness: int, nature01: int, nature02: int` |
| 128 | `GETPETSTAT` | Outbound | `hh_room` | `petId: int` |

### 2.11 Slide Object Bundle

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| — | `SLIDEOBJECTBUNDLE` | Inbound | `hh_room` | `fromX: int, fromY: int, toX: int, toY: int, stuffCount: int, items: [{itemId: int, fromH: float, toH: float}], tileId: int` |

### 2.12 Room Actions

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 75 | `MOVE` | Outbound | `hh_room` | `x: int, y: int` |
| 88 | `STOP` | Outbound | `hh_room` | — |
| 93 | `DANCE` | Outbound | `hh_room` | `danceId: int` |
| 94 | `WAVE` | Outbound | `hh_room` | — |
| 79 | `LOOKTO` | Outbound | `hh_room` | `x: int, y: int` |
| 80 | `CARRYDRINK` | Outbound | `hh_room` | `itemId: int` |
| 87 | `CARRYITEM` | Outbound | `hh_room` | `itemId: int` |
| 81 | `INTODOOR` | Outbound | `hh_room` | `doorId: int` |
| 82 | `DOORGOIN` | Outbound | `hh_room` | `doorId: int` |
| 54 | `GOVIADOOR` | Outbound | `hh_room` | `doorId: int` |
| 28 | `GETDOORFLAT` | Outbound | `hh_room` | `doorId: int` |
| 90 | `PLACESTUFF` | Outbound | `hh_room` | `itemId: string, x: int, y: int, direction: int` |
| 99 | `REMOVESTUFF` | Outbound | `hh_room` | `itemId: string` |
| 74 | `SETSTUFFDATA` | Outbound | `hh_room` | `itemId: string, data: string` |
| 89 | `USEITEM` | Outbound | `hh_room` | `itemId: string` |
| 214 | `SETITEMSTATE` | Outbound | `hh_room` | `itemId: string, state: int` |
| 84 | `SETITEMDATA` | Outbound | `hh_room` | `itemId: string, data: string` |
| 85 | `REMOVEITEM` | Outbound | `hh_room` | `itemId: string` |
| 76 | `THROW_DICE` | Outbound | `hh_room` | `diceId: int` |
| 77 | `DICE_OFF` | Outbound | `hh_room` | `diceId: int` |
| 78 | `PRESENTOPEN` | Outbound | `hh_room` | `presentId: int` |
| 247 | `SPIN_WHEEL_OF_FORTUNE` | Outbound | `hh_room` | `wheelId: int` |
| 183 | `CONVERT_FURNI_TO_CREDITS` | Outbound | `hh_room` | `itemId: string` |
| 314 | `SET_RANDOM_STATE` | Outbound | `hh_room` | `itemId: string, state: int` |

### 2.13 Room Moderation

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 95 | `KICKUSER` | Outbound | `hh_room` | `userId: string` |
| 96 | `ASSIGNRIGHTS` | Outbound | `hh_room` | `userId: string` |
| 97 | `REMOVERIGHTS` | Outbound | `hh_room` | `userId: string` |
| 319 | `IGNOREUSER` | Outbound | `hh_room` | `userId: string` |
| 320 | `BANUSER` | Outbound | `hh_room` | `userId: string` |
| 321 | `GET_IGNORE_LIST` | Outbound | `hh_room` | — |
| 322 | `UNIGNORE_USER` | Outbound | `hh_room` | `userId: string` |
| 261 | `RATEFLAT` | Outbound | `hh_room` | `rating: int` |
| 211 | `ROOM_QUEUE_CHANGE` | Outbound | `hh_room` | `queueId: int, position: int` |
| 216 | `GET_SPECTATOR_AMOUNT` | Outbound | `hh_room` | — |
| 230 | `GET_GROUP_BADGES` | Outbound | `hh_room` | `groupId: string` |
| 231 | `GET_GROUP_DETAILS` | Outbound | `hh_room` | `groupId: string` |
| 263 | `GET_USER_TAGS` | Outbound | `hh_room` | `userId: string` |
| 182 | `GETINTERST` | Outbound | `hh_room` | — |
| 317 | `USER_START_TYPING` | Outbound | `hh_room` | — |
| 318 | `USER_CANCEL_TYPING` | Outbound | `hh_room` | — |

### 2.14 Room Events

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 345 | `CAN_CREATE_ROOMEVENT` | Outbound | `hh_room` | — |
| 346 | `CREATE_ROOMEVENT` | Outbound | `hh_room` | `eventData: {...}` |
| 347 | `QUIT_ROOMEVENT` | Outbound | `hh_room` | `eventId: int` |
| 348 | `EDIT_ROOMEVENT` | Outbound | `hh_room` | `eventData: {...}` |
| 349 | `GET_ROOMEVENT_TYPE_COUNT` | Outbound | `hh_room` | — |
| 350 | `GET_ROOMEVENTS_BY_TYPE` | Outbound | `hh_room` | `typeId: int` |

### 2.15 One-Way Door

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 312 | `CHANGE_STATUS` | Inbound | `hh_room_utils` | `doorId: int, status: int` |
| 232 | `ENTER_ONEWAY_DOOR` | Outbound | `hh_room_utils` | `doorId: int` |

---

## 3. Navigator Protocol

### 3.1 Room Browsing

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 150 | `NAVIGATE` | Outbound | `hh_navigator` | `nodeId: int, nodeMask: int, depth: int` |
| 220 | `NAVNODEINFO` | Inbound | `hh_navigator` | `nodeMask: int, node: {id, nodeType, name, userCount, maxUsers, parentId, ...}` |
| 264 | `GET_RECOMMENDED_ROOMS` | Outbound | `hh_navigator` | — |
| 351 | `RECOMMENDED_ROOM_LIST` | Inbound | `hh_navigator` | `roomCount: int, rooms: [{id, name, owner, door, userCount, maxUsers, description}]` |
| 58 | `NOFLATS` | Inbound | `hh_navigator` | — |
| 57 | `NOFLATSFORUSER` | Inbound | `hh_navigator` | — |

### 3.2 Room Info & Management

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 21 | `GETFLATINFO` | Outbound | `hh_navigator` | `flatId: int` |
| 54 | `FLATINFO` | Inbound | `hh_navigator` | `ableOthersMoveFurniture: int, door: int, flatId: int, owner: string, marker: string, name: string, description: string, showOwnerName: int, trading: int, alert: int, maxVisitors: int, absoluteMaxVisitors: int` |
| 16 | `GETFLAT_RESULTS` | Inbound | `hh_navigator` | `flats: string` (TAB-delimited lines) |
| 55 | `FLAT_RESULTS` | Inbound | `hh_navigator` | `flats: string` (TAB-delimited lines) |
| 61 | `FAVORITEROOMRESULTS` | Inbound | `hh_navigator` | `nodeMask: int, nodeId: int, nodeType: int, nodeInfo: {...}, children: [...]` |
| 130 | `FLATPASSWORD_OK` | Inbound | `hh_navigator` | — |
| 23 | `DELETEFLAT` | Outbound | `hh_navigator` | `flatId: int` |
| 24 | `UPDATEFLAT` | Outbound | `hh_navigator` | `flatId: int, settings: {...}` |
| 25 | `SETFLATINFO` | Outbound | `hh_navigator` | `name: string, description: string` |

### 3.3 Categories & Favorites

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 19 | `ADD_FAVORITE_ROOM` | Outbound | `hh_navigator` | `flatId: int` |
| 20 | `DEL_FAVORITE_ROOM` | Outbound | `hh_navigator` | `flatId: int` |
| 151 | `GETUSERFLATCATS` | Outbound | `hh_navigator` | — |
| 221 | `USERFLATCATS` | Inbound | `hh_navigator` | `count: int, categories: [{nodeId: int, name: string}]` |
| 152 | `GETFLATCAT` | Outbound | `hh_navigator` | `flatId: int` |
| 222 | `FLATCAT` | Inbound | `hh_navigator` | `flatId: int, categoryId: int` |
| 153 | `SETFLATCAT` | Outbound | `hh_navigator` | `flatId: int, categoryId: int` |
| 154 | `GETSPACENODEUSERS` | Outbound | `hh_navigator` | `nodeId: int` |
| 223 | `SPACENODEUSERS` | Inbound | `hh_navigator` | `nodeId: string, userCount: int, users: string[]` |
| 155 | `REMOVEALLRIGHTS` | Outbound | `hh_navigator` | `flatId: int` |
| 156 | `GETPARENTCHAIN` | Outbound | `hh_navigator` | `nodeId: int` |
| 227 | `PARENTCHAIN` | Inbound | `hh_navigator` | `childId: string, nodes: [{id: int, name: string}]` |

### 3.4 Room Entry & Errors

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 224 | `CANTCONNECT` | Inbound | `hh_navigator` | `error: int (1=full, 2=closed, 3=queue, 4=banned)` |
| 225 | `SUCCESS` | Inbound | `hh_navigator` | `msgId: int` |
| 226 | `FAILURE` | Inbound | `hh_navigator` | `msgId: int, errorText: string` |
| 286 | `ROOMFORWARD` | Inbound | `hh_navigator` | `isPublic: int, roomId: int` |
| 33 | `ERROR` | Inbound | `hh_navigator` | `errorMessage: string` |
| 228 | `ROOMFORWARD` | Inbound | `hh_navigator` | `isPublic: int, roomId: int` |

### 3.5 Search

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 13 | `SBUSYF` | Outbound | `hh_navigator` | `searchTerm: string` |
| 16 | `SUSERF` | Outbound | `hh_navigator` | `userId: string` |
| 17 | `SRCHF` | Outbound | `hh_navigator` | `searchTerm: string` |
| 18 | `GETFVRF` | Outbound | `hh_navigator` | — |

---

## 4. Friend List Protocol

### 4.1 Friend List Initialization

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 12 | `FRIENDLIST_INIT` | Outbound | `hh_friend_list` | — |
| 3 | `OK` | Inbound | `hh_friend_list` | — |
| 12 | `FRIENDLIST_INIT` | Inbound | `hh_friend_list` | `userLimit: int, normalLimit: int, extendedLimit: int, categoryCount: int, categories: [{uniqueId: int, name: string}], friendCount: int, friends: [{id, name, sex, online, canFollow, figure, categoryId, mission, lastAccess}], friendRequestLimit: int, friendRequestCount: int` |
| 15 | `FRIENDLIST_UPDATE` | Outbound | `hh_friend_list` | — |
| 13 | `FRIENDLIST_UPDATE` | Inbound | `hh_friend_list` | `categoryCount: int, categories: [{id: int, name: string}], friendCount: int, updates: [{updateType: int, id, name, sex, online, canFollow, figure, categoryId, mission, lastAccess}]` |

### 4.2 Friend Management

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 32 | `FRIENDLIST_GETOFFLINEFRIENDS` | Outbound | `hh_friend_list` | — |
| 40 | `FRIENDLIST_REMOVEFRIEND` | Outbound | `hh_friend_list` | `friendId: int` |
| 41 | `MESSENGER_HABBOSEARCH` | Outbound | `hh_friend_list` | `searchTerm: string` |
| 435 | `HABBO_SEARCH_RESULT` | Inbound | `hh_friend_list` | `friendCount: int, friends: [{id, name, mission, online, canFollow, roomName, sex, figure, lastAccess}], habboCount: int, habbos: [...]` |
| 37 | `FRIENDLIST_ACCEPTFRIEND` | Outbound | `hh_friend_list` | `requestId: int` |
| 38 | `FRIENDLIST_DECLINEFRIEND` | Outbound | `hh_friend_list` | `requestId: int` |
| 39 | `FRIENDLIST_FRIENDREQUEST` | Outbound | `hh_friend_list` | `targetName: string, message: string` |
| 233 | `FRIENDLIST_GETFRIENDREQUESTS` | Outbound | `hh_friend_list` | — |
| 314 | `FRIEND_REQUEST_LIST` | Inbound | `hh_friend_list` | `totalRequests: int, requestCount: int, requests: [{id: string, name: string, userId: string}]` |
| 132 | `FRIEND_REQUEST` | Inbound | `hh_friend_list` | `request: {id: string, name: string, userId: string}` |
| 315 | `FRIEND_REQUEST_RESULT` | Inbound | `hh_friend_list` | `failureCount: int, errors: [{senderName: string, errorCode: int}]` |

### 4.3 Follow & Mail

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 262 | `FOLLOW_FRIEND` | Outbound | `hh_friend_list` | `friendId: int` |
| 349 | `FOLLOW_FAILED` | Inbound | `hh_friend_list` | `failureType: int (0=not_friend, 1=offline, 2=hotelview, 3=prevented)` |
| 363 | `MAIL_NOTIFICATION` | Inbound | `hh_friend_list` | `userId: string` |
| 364 | `MAIL_COUNT_NOTIFICATION` | Inbound | `hh_friend_list` | `unreadCount: int` |

### 4.4 Errors

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 260 | `FRIENDLIST_ERROR` | Inbound | `hh_friend_list` | `clientMessageId: int, errorCode: int` |

---

## 5. Instant Messenger Protocol

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 33 | `MESSENGER_SENDMSG` | Outbound | `hh_instant_messenger` | `recipientId: int, message: string` |
| 34 | `FRIEND_INVITE` | Outbound | `hh_instant_messenger` | `recipientId: int, message: string` |
| 134 | `IM_MESSAGE` | Inbound | `hh_instant_messenger` | `senderId: int, text: string` |
| 135 | `IM_INVITATION` | Inbound | `hh_instant_messenger` | `senderId: int, text: string` |
| 261 | `IM_ERROR` | Inbound | `hh_instant_messenger` | `errorCode: int, chatId: int` |
| 262 | `INVITATION_ERROR` | Inbound | `hh_instant_messenger` | `errorCode: int` |

---

## 6. Catalogue Protocol

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 100 | `GPRC` | Outbound | `hh_cat_code` | — |
| 6 | `PURSE` | Inbound | `hh_cat_code` | `credits: string` |
| 101 | `GCIX` | Outbound | `hh_cat_code` | `editMode: int, language: string` |
| 126 | `CATALOGINDEX` | Inbound | `hh_cat_code` | `pages: string` (TAB-delimited: `pageId\tparentId\tname\tminRank\tleaf`) |
| 102 | `GCAP` | Outbound | `hh_cat_code` | `pageId: int, editMode: int, language: string` |
| 127 | `CATALOGPAGE` | Inbound | `hh_cat_code` | `page: string` (key:value lines: `i:id`, `n:name`, `l:layout`, `h:headerText`, `g:headerImage`, `w:teaserText`, `e:teaserImages`, `s:teaserSpecial`, `t:texts`, `u:links`, `p:products`) |
| 67 | `PURCHASE_OK` | Inbound | `hh_cat_code` | — |
| 65 | `PURCHASE_ERROR` | Inbound | `hh_cat_code` | `content: string` |
| 68 | `PURCHASE_NOBALANCE` | Inbound | `hh_cat_code` | `content: string` |
| 296 | `PURCHASENOTALLOWED` | Inbound | `hh_cat_code` | `code: int` |

---

## 7. Figure & Avatar Protocol

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 9 | `GETAVAILABLESETS` | Outbound | `hh_human` | — |
| 266 | `FIGURE_CHANGE` | Inbound | `hh_room` | `userId: string, newFigure: string` |
| 228 | `USERBADGE` | Inbound | `hh_room` | `userId: string, chosenBadgeCount: int, badges: [{index: int, badgeId: string}]` |
| 158 | `SETBADGE` | Outbound | `hh_room` | `slot: int, visible: bool, badgeCode: string` |

---

## 8. Habbo Club Protocol

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 26 | `SCR_GET_USER_INFO` | Outbound | `hh_club` | `productName: string` |
| 3 | `OK` | Inbound | `hh_club` | — |
| 7 | `SCR_SINFO` | Inbound | `hh_club` | `productName: string, daysLeft: int, elapsedPeriods: int, prepaidPeriods: int, responseFlag: int` |
| 190 | `SCR_BUY` | Outbound | `hh_club` | `productName: string` |
| 210 | `SCR_GIFT_APPROVAL` | Outbound | `hh_club` | `recipientName: string, giftType: string` |
| 280 | `GIFT` | Inbound | `hh_club` | `giftCount: int` |

---

## 9. Photo System Protocol

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 4 | `FILM` | Inbound | `hh_photo` | `filmCount: int` |
| — | `FILM` (MUS) | Inbound | `hh_photo` | `filmCount: int` |
| — | `OK` (MUS) | Inbound | `hh_photo` | — |

---

## 10. Poll System Protocol

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 316 | `POLL_OFFER` | Inbound | `hh_poll` | `pollId: int, pollDescription: string` |
| 317 | `POLL_CONTENTS` | Inbound | `hh_poll` | `pollId: int, pollHeadLine: string, pollThankYou: string, questionCount: int, questions: [{questionId: int, questionNumber: int, questionCount: int, questionType: int, questionText: string, selectionData: {minSelect: int, maxSelect: int, questions: string[]}}]` |
| 318 | `POLL_ERROR` | Inbound | `hh_poll` | — |
| 234 | `POLL_START` | Outbound | `hh_poll` | `pollId: int` |
| 235 | `POLL_REJECT` | Outbound | `hh_poll` | `pollId: int` |
| 236 | `POLL_ANSWER` | Outbound | `hh_poll` | `pollId: int, questionId: int, answer: string` |

---

## 11. Recycler Protocol

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 222 | `GET_FURNI_RECYCLER_CONFIGURATION` | Outbound | `hh_recycler` | — |
| 303 | `RECYCLER_CONFIGURATION` | Inbound | `hh_recycler` | `serviceEnabled: int, quarantineMinutes: int, recyclingMinutes: int, minutesToTimeout: int, rewardItemCount: int, rewards: [{furniValue: int, type: int, class: string, ...}]` |
| 223 | `GET_FURNI_RECYCLER_STATUS` | Outbound | `hh_recycler` | — |
| 304 | `RECYCLER_STATUS` | Inbound | `hh_recycler` | `status: int (0=open, 1=progress, 2=ready, 3=timeout), rewardType: int, furniClass: string, minutesLeft: int` |
| 224 | `APPROVE_RECYCLED_FURNI` | Outbound | `hh_recycler` | `approved: bool` |
| 305 | `APPROVE_RECYCLING_RESULT` | Inbound | `hh_recycler` | `result: bool` |
| 225 | `START_FURNI_RECYCLING` | Outbound | `hh_recycler` | — |
| 306 | `START_RECYCLING_RESULT` | Inbound | `hh_recycler` | `result: bool` |
| 226 | `CONFIRM_FURNI_RECYCLING` | Outbound | `hh_recycler` | `confirmed: bool` |
| 307 | `CONFIRM_RECYCLING_RESULT` | Inbound | `hh_recycler` | `result: bool` |

---

## 12. Tutorial System Protocol

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 228 | `GET_ACCOUNT_PREFERENCES` | Outbound | `hh_tutorial` | — |
| 308 | `ACCOUNT_PREFERENCES` | Inbound | `hh_tutorial` | `sounds: bool, tutorial: int` |
| 249 | `SET_TUTORIAL_MODE` | Outbound | `hh_tutorial` | `enabled: bool` |
| 250 | `GET_TUTORIAL_CONFIGURATION` | Outbound | `hh_tutorial` | — |
| 327 | `TUTORIAL_CONFIG` | Inbound | `hh_tutorial` | `tutorialId: int, tutorialName: string, topicCount: int, topics: [{topicId: int, topicName: string, status: int}]` |
| 251 | `GET_TUTORIAL_TOPIC_CONFIGURATION` | Outbound | `hh_tutorial` | `topicId: int` |
| 328 | `TOPIC_CONFIG` | Inbound | `hh_tutorial` | `topicId: int, stepCount: int, steps: [{stepId: int, stepName: string, prerequisites: [{message: string, param: string}], triggers: string[], restrictions: string[], content: [{textKey: string, targetId: string, direction: string, offsetX: string, offsetY: string, special: string}]}]` |
| 252 | `GET_TUTORIAL_STATUS` | Outbound | `hh_tutorial` | — |
| 329 | `TUTORIAL_STATUS` | Inbound | `hh_tutorial` | `tutorialId: int, statusCount: int, statuses: [{id: int, status: int}]` |
| 253 | `COMPLETE_TUTORIAL_TOPIC` | Outbound | `hh_tutorial` | `topicId: int` |
| 330 | `TOPIC_RESULT` | Inbound | `hh_tutorial` | `userRewarded: int` |

---

## 13. Guide System Protocol

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 357 | `MSG_ACCEPT_TUTOR_INVITATION` | Outbound | `hh_guide` | `invitationId: int` |
| 358 | `MSG_REJECT_TUTOR_INVITATION` | Outbound | `hh_guide` | `invitationId: int` |
| 360 | `MSG_INIT_TUTORSERVICE` | Outbound | `hh_guide` | — |
| 362 | `MSG_WAIT_FOR_TUTOR_INVITATIONS` | Outbound | `hh_guide` | — |
| 363 | `MSG_CANCEL_WAIT_FOR_TUTOR_INVITATIONS` | Outbound | `hh_guide` | — |
| 355 | `INVITATION` | Inbound | `hh_guide` | `userId: string, name: string` |
| 359 | `INVITATION_FOLLOW_FAILED` | Inbound | `hh_guide` | — |
| 360 | `INVITATION_CANCELLED` | Inbound | `hh_guide` | — |
| 425 | `INIT_TUTOR_SERVICE_STATUS` | Inbound | `hh_guide` | `state: int (1=enabled, 2=disabled, 3=disabled)` |
| 426 | `ENABLE_TUTOR_SERVICE_STATUS` | Inbound | `hh_guide` | `state: int, guidePoints: int` |

---

## 14. In-Game (IG) Protocol

### 14.1 Game Directory

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| — | `IG_CHECK_DIRECTORY_STATUS` | Outbound | `hh_ig` | — |
| — | `DIRECTORY_STATUS` | Inbound | `hh_ig` | `code: int` |
| — | `IG_GET_CREATE_GAME_INFO` | Outbound | `hh_ig` | — |
| — | `CREATE_GAME_INFO` | Inbound | `hh_ig` | `levelCount: int, levels: [{id: string, levelName: string, gameType: int, fieldType: int, ...}]` |

### 14.2 Game List

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| — | `IG_GET_GAME_LIST` | Outbound | `hh_ig` | `startObservingFirst: int, maxResultCount: int` |
| — | `GAME_LIST` | Inbound | `hh_ig` | `instanceCount: int, instances: [{id: int, levelName: string, gameType: int, fieldType: int, numberOfTeams: int, playerCount: int, playerMaxCount: int, ownerName: string}]` |
| — | `IG_LIST_POSSIBLE_INVITEES` | Outbound | `hh_ig` | `query: int, maxResults: int` |
| — | `IG_INVITE_USER` | Outbound | `hh_ig` | `userName: string, message: string` |
| — | `IG_KICK_USER` | Outbound | `hh_ig` | `userId: int` |

### 14.3 Game Lifecycle

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| — | `IG_CREATE_GAME` | Outbound | `hh_ig` | `levelId: string, params: [...]` |
| — | `IG_START_GAME` | Outbound | `hh_ig` | — |
| — | `IG_JOIN_GAME` | Outbound | `hh_ig` | `gameId: int, teamId: int` |
| — | `IG_LEAVE_GAME` | Outbound | `hh_ig` | — |
| — | `IG_START_OBSERVING_GAME` | Outbound | `hh_ig` | `gameId: int, longData: int` |
| — | `IG_STOP_OBSERVING_GAME` | Outbound | `hh_ig` | `gameId: int` |
| — | `IG_ACCEPT_INVITE_REQUEST` | Outbound | `hh_ig` | `gameId: int` |
| — | `IG_DECLINE_INVITE_REQUEST` | Outbound | `hh_ig` | `gameId: int` |
| — | `IG_LOAD_STAGE_READY` | Outbound | `hh_ig` | `percentage: int` |
| — | `IG_EXIT_GAME` | Outbound | `hh_ig` | `redirectFlag: int` |
| — | `IG_PLAY_AGAIN` | Outbound | `hh_ig` | — |
| — | `IG_GET_LEVEL_HALL_OF_FAME` | Outbound | `hh_ig` | `levelId: int` |
| — | `LEVEL_HALL_OF_FAME` | Inbound | `hh_ig` | `id: int, name: string, topScores: [{name: string, score: int}], teamScores: [{score: int, players: string[]}]` |

### 14.4 Game State

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| — | `ENTER_ARENA_FAILED` | Inbound | `hh_ig` | `code: int` |
| — | `GAME_REJOIN` | Inbound | `hh_ig` | `timeLeft: int` |
| — | `PLAYER_EXITED_GAME_ARENA` | Inbound | `hh_ig` | `roomIndex: int` |
| — | `START_FAILED` | Inbound | `hh_ig` | `code: int` |
| — | `JOIN_FAILED` | Inbound | `hh_ig` | `code: int` |
| — | `IN_ARENA_QUEUE` | Inbound | `hh_ig` | `queuePos: int` |
| — | `STAGE_STILL_LOADING` | Inbound | `hh_ig` | `progress: int, finishedPlayers: int[]` |
| — | `GAME_NOT_FOUND` | Inbound | `hh_ig` | `gameId: int, observing: int` |
| — | `GAME_CHAT` | Inbound | `hh_ig` | `id: int, message: string` |
| — | `ENTER_ARENA` | Inbound | `hh_ig` | `gameType: int, levelId: int, numberOfTeams: int, userCount: int, users: [{id: int, name: string, figure: string, sex: string, teamId: int}]` |
| — | `ARENA_ENTERED` | Inbound | `hh_ig` | `player: {...}, teamId: int` |
| — | `LOAD_STAGE` | Inbound | `hh_ig` | `gameType: int` |
| — | `STAGE_STARTING` | Inbound | `hh_ig` | `gameType: int, roomMarker: string, timeToStageRunning: int` |
| — | `STAGE_RUNNING` | Inbound | `hh_ig` | — |
| — | `STAGE_ENDING` | Inbound | `hh_ig` | `timeToNextState: int` |
| — | `GAME_ENDING` | Inbound | `hh_ig` | `timeToNextState: int, teamCount: int, teams: [{id: int, pos: int, score: int, isHighscore: int, players: [{roomIndex: int, pos: int, teamId: int, teamPos: int, score: int, isHighscore: int, xpGained: int, xpToday: int, xpMonth: int, xpTotal: int}]}], topScores: [...], levelTeamScores: [...]` |
| — | `GAME_CREATED` | Inbound | `hh_ig` | `game: {...}` |
| — | `GAME_LONG_DATA` | Inbound | `hh_ig` | `game: {...}` |
| — | `USER_JOINED_GAME` | Inbound | `hh_ig` | `gameId: int, player: {...}, teamId: int, requiredPlayers: {...}` |
| — | `USER_LEFT_GAME` | Inbound | `hh_ig` | `gameId: int, playerId: int, wasKicked: int, requiredPlayers: {...}` |
| — | `GAME_OBSERVATION_STARTED_SHORT` | Inbound | `hh_ig` | `game: {...}` |
| — | `GAME_CANCELLED` | Inbound | `hh_ig` | `gameId: int, reasonCode: int` |
| — | `GAME_STARTED` | Inbound | `hh_ig` | `gameId: int` |

### 14.5 Room Game Status

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| — | `IG_ROOM_GAME_STATUS` | Outbound | `hh_ig` | `joinedFlag: int, gameId: int, gameType: int` |

---

## 15. Hobba (Moderation) Protocol

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 48 | `PICK_CRYFORHELP` | Outbound | `hh_shared` | `cryId: string` |
| 86 | `CALL_FOR_HELP` | Outbound | `hh_shared` | `category: int, message: string` |
| 198 | `CHANGECALLCATEGORY` | Outbound | `hh_shared` | `cryId: string, newCategory: int` |
| 199 | `MESSAGETOCALLER` | Outbound | `hh_shared` | `cryId: string, message: string` |
| 200 | `MODERATIONACTION` | Outbound | `hh_shared` | `actionType: int, targetId: string, reason: string` |
| 323 | `FOLLOW_CRYFORHELP` | Outbound | `hh_shared` | `cryId: string` |
| 148 | `CRYFORHELP` | Inbound | `hh_shared` | `cryId: string, category: int, time: string, sender: string, message: string, urlId: string, roomName: string, type: int (-1=IM, 0=public, 1=private, 2=game)` |
| 149 | `PICKED_CRY` | Inbound | `hh_shared` | `cryId: string, picker: string` |
| 273 | `DELETE_CRY` | Inbound | `hh_shared` | `cryId: string` |
| 274 | `CRY_REPLY` | Inbound | `hh_shared` | `text: string` |

### 15.1 Dialog Handler (CFH Window)

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 237 | `GET_PENDING_CALLS_FOR_HELP` | Outbound | `hh_room_utils` | — |
| 238 | `DELETE_PENDING_CALLS_FOR_HELP` | Outbound | `hh_room_utils` | — |
| 319 | `GET_PENDING_RESPONSE` | Inbound | `hh_room_utils` | `count: int, cries: [...]` |
| 320 | `PENDING_CFHS_DELETED` | Inbound | `hh_room_utils` | — |
| 321 | `CFH_SENDING_RESPONSE` | Inbound | `hh_room_utils` | `status: int` |

---

## 16. Error Reporting Protocol

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 299 | `ERROR_REPORT` | Inbound | `hh_shared` | `errorId: int, errorMsgId: int, time: string` |

---

## 17. Hotel Availability Protocol

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 212 | `GET_AVAILABILITY_TIME` | Outbound | `hh_entry_init` | — |
| 290 | `AVAILABILITY_STATUS` | Inbound | `hh_entry_init` | `isOpen: int, shutDown: int` |
| 291 | `INFO_HOTEL_CLOSING` | Inbound | `hh_entry_init` | `minutesUntil: int` |
| 292 | `INFO_HOTEL_CLOSED` | Inbound | `hh_entry_init` | `openHour: int, openMinute: int, disconnect: int` |
| 293 | `AVAILABILITY_TIME` | Inbound | `hh_entry_init` | `isOpen: int, timeUntil: int` |
| 294 | `LOGIN_FAILED_HOTEL_CLOSED` | Inbound | `hh_entry_init` | `openHour: int, openMinute: int` |

---

## 18. Room Kiosk Protocol

| Opcode | Command | Direction | Handler | Payload |
|--------|---------|-----------|---------|---------|
| 29 | `CREATEFLAT` | Outbound | `hh_kiosk_room` | `name: string, model: string, description: string, ...` |
| 59 | `FLATCREATED` | Inbound | `hh_kiosk_room` | `id: string, name: string` |
| 33 | `ERROR` | Inbound | `hh_kiosk_room` | `errorMessage: string` |
| 353 | `WEBSHORTCUT` | Inbound | `hh_kiosk_room` | `requestId: int` |

---

## Appendix A: Data Format Reference

### A.1 Height Map Format
```
xxxxxxxx
x000000x
x001100x
x002200x
xxxxxxxx
```
- `0-8`: Walkable tile at height 0-8
- `x`: Non-walkable (void)
- `y`: Walkable but no object placement

### A.2 USERS Message Format
Line-delimited with property prefixes:
```
i12345       # User ID
nUsername    # Name
fHD180.HR835 # Figure string
l10,10,0.0   # Location (x,y,h)
cCustom      # Custom status
sM           # Sex (M/F)
b1:BADGE1,2:BADGE2  # Badges
a12345       # Web ID (account ID)
gGROUP123    # Group ID
tGROUPSTATUS # Group status text
x100         # XP points
```

### A.3 STATUS Message Format
```
userId x,y,h,dirBody,dirHead/action1/action2...
```
Example:
```
12345 10,10,0.0,2,4/mv 11,11,0.0
67890 5,5,0.0,0,0/sit 5,5,0.0,6
```

### A.4 Catalogue Page Format
```
i:pageId
n:pageName
l:layout_code
h:Header text
g:header_image.png
w:Teaser text
e:image1.png,image2.png
s:Special text
t1:Text block 1
t2:Text block 2
u:url1,url2
p:name\tdescription\tprice\tspecial\ttype\tclass\tdirection\tdimensions\tpurchaseCode\tpartColors\titemCount\tclass1\tcount1\tcolors1...
```

### A.5 Strip Info Format
Complex format with multiple delimiters:
- Line delimiter: `\n`
- Item delimiter: `/`
- Field delimiter: `§` (char 30)
- Tab delimiter: `\t`

---

## Appendix B: Connection Types

| Connection ID | Purpose | Used By |
|--------------|---------|---------|
| `connection.info.id` | Info connection (login, navigator, friends, IM) | Most handlers |
| `connection.room.id` | Room connection (room protocol, furniture) | `hh_room`, `hh_buffer`, `hh_recycler` |
| `connection.mus.id` | MUS connection (photo system) | `hh_photo` |

---

**Document Version:** 1.0  
**Last Updated:** 2026-03-31  
**Extracted From:** 21 Handler classes across 47 feature casts
