# Habbo R26 Features Specification

**Source:** Reverse-engineered from LingoScript Handler Classes (`/casts/`)
**Era:** Habbo Hotel R26 (2008) - Macromedia Director/Shockwave
**Purpose:** Complete feature specification extracted from original client code via handler analysis

---

## Feature Index by Thread/Handler

| Thread ID | Cast | Handler Class | Feature Category |
|-----------|------|---------------|------------------|
| `login` | hh_entry_init | Login Handler Class | Authentication & Session |
| `openinghours` | hh_entry_init | Opening Hours Handler | Hotel Status |
| `room` | hh_room | Room Handler | Room System |
| `buffer` | hh_buffer | Buffer Handler | Furniture Protocol |
| `dynamicdownloader` | hh_dynamic_downloader | Dynamic Downloader Handler | Asset Pipeline |
| `navigator` | hh_navigator | Navigator Handler | Room Browsing |
| `friend_list` | hh_friend_list | Friend List Handler | Social Features |
| `instant_messenger` | hh_instant_messenger | IM Handler | Messaging |
| `catalogue` | hh_cat_code | Catalogue Handler | Economy |
| `habbo_club` | hh_club | Club Handler | Premium Features |
| `photo` | hh_photo | Photo Handler | Photo System |
| `poll` | hh_poll | Poll Handler | Polls |
| `recycler` | hh_recycler | Recycler Handler | Recycling |
| `new_user_help` | hh_tutorial | NUH/Tutorial Handler | Tutorial |
| `guide` | hh_guide | Guide Handler | Guide Program |
| `ig` | hh_ig | IG Handler | Mini-Games |
| `hobba` | hh_shared | Hobba Handler | Moderation |
| `error_report` | hh_shared | Error Report Handler | Error Handling |
| `roomkiosk` | hh_kiosk_room | RoomKiosk Handler | Room Creation |

---

## 1. Authentication & Session Management

**Thread:** `login`
**Handler:** `Login Handler Class.ls` (hh_entry_init/8_Login Handler Class.ls)

### 1.1 Cryptographic Session Establishment

**Feature:** RSA key exchange with RC4 session encryption

**Flow:**
1. Server → Client: `HELLO` (0) - Connection established
2. Client → Server: `INIT_CRYPTO` (206) - Request crypto parameters
3. Server → Client: `CRYPTO_PARAMETERS` (277) - Encryption flags
4. Client → Server: `GENERATEKEY` (2002) - Client public key (BigInt)
5. Server → Client: `SERVER_SECRET_KEY` (1) - Server public key
6. Client → Server: `SECRETKEY` (207) - Encrypted session key
7. Server → Client: `END_OF_CRYPTO_PARAMS` (2) - Handshake complete

**Implementation Details:**
- Uses `BigInt` class for RSA operations
- RC4 encryption via `tYy1rX5j7e4PLYJLER.ls` class
- Shared secret computed via Diffie-Hellman key exchange
- Prime P and Generator G hardcoded in client

### 1.2 Client Version Check

**Feature:** Version validation and integrity verification

**Flow:**
1. Client → Server: `VERSIONCHECK` (1170) - versionId, clientURL, extVarsURL
2. Client → Server: `UNIQUEID` (813) - Machine identifier
3. Client → Server: `GET_SESSION_PARAMETERS` (1817)
4. Server → Client: `SESSION_PARAMETERS` (257) - Configuration pairs

**Session Parameters:**
| ID | Name | Type | Description |
|----|------|------|-------------|
| 0 | coppa | int | Child protection (0=off, 1=basic, 2=strict) |
| 1 | voucher | int | Voucher system enabled |
| 2 | parent_email_request | int | Parent email required |
| 3 | parent_email_reregistration | int | Re-registration required |
| 4 | allow_direct_mail | int | Marketing consent |
| 5 | date_format | string | Date format pattern |
| 6 | partner_integration | int | Partner features |
| 7 | allow_profile_editing | int | Profile editing allowed |
| 8 | tracking_header | string | Analytics header |
| 9 | tutorial_enabled | int | Tutorial system enabled |

### 1.3 User Login

**Flow:**
1. Client → Server: `TRY_LOGIN` (756) - username, password
2. Server → Client: `LOGIN_OK` (3) - Authentication successful
3. Client → Server: `GET_INFO` (7) - Request user profile
4. Client → Server: `GET_CREDITS` (8) - Request balance
5. Server → Client: `USER_OBJ` (5) - User profile data
6. Client → Server: `GETAVAILABLEBADGES`, `GET_POSSIBLE_ACHIEVEMENTS`, `GET_SOUND_SETTING`

**User Object Structure:**
```
user_id: string
name: string
figure: string (figure string)
sex: string ("M" or "F")
customData: string (motto)
ph_tickets: int (photo tickets)
ph_figure: string (pet hotel figure)
photo_film: int (film rolls remaining)
directMail: int (marketing consent flag)
```

### 1.4 Session Maintenance

**Keep-Alive:**
- Server → Client: `PING` (50)
- Client → Server: `PONG` (196)

**Latency Testing:**
- Server → Client: `LATENCY_TEST` (354) - latencyId
- Client → Server: `TEST_LATENCY` (315)
- Client → Server: `REPORT_LATENCY` (316) - latencyId, latency

**Integrity:**
- Server → Client: `CHECKSUM` (141) - Client integrity checksum

**Announcements:**
- Server → Client: `SYSTEM_BROADCAST` (139) - Server-wide message

### 1.5 User Rights System

**Feature:** Privilege-based access control

**Server → Client:** `RIGHTS` (2) - Null-terminated privilege list

**Common Privileges:**
- `mod` - Moderator access
- `trade_anywhere` - Trade outside room
- `room_entry_log` - View entry logs
- `any_room_owner` - Own any room
- `kick_any` - Kick any user
- `ban_any` - Ban any user

### 1.6 Achievement System

**Feature:** Progress tracking with badge rewards

**Flow:**
1. Client → Server: `GET_POSSIBLE_ACHIEVEMENTS` (370)
2. Server → Client: `POSSIBLE_ACHIEVEMENTS` (436)
3. Server → Client: `ACHIEVEMENT_NOTIFICATION` (437) - Real-time unlock

**Achievement Structure:**
```
Achievement:
  typeId: int    -- Category identifier
  level: int     -- Current level (1-N)
  badgeId: string -- Reward badge code
```

### 1.7 Badge Collection System

**Feature:** Collectible badges with equipment slots

**Flow:**
1. Client → Server: `GETAVAILABLEBADGES` (157)
2. Server → Client: `AVAILABLE_BADGES` (229)
3. Client → Server: `GET_SELECTED_BADGES` (159)
4. Client → Server: `SETBADGE` (158) - Equip badge
5. Server → Client: `USERBADGE` (228) - Broadcast to room

**Badge Data:**
```
Available Badges Response:
  count: int
  badges: string[]
  chosenCount: int
  chosen: [{index: int, badgeId: string}]
```

### 1.8 Audio Configuration

**Feature:** Sound settings synchronization

**Flow:**
1. Client → Server: `GET_SOUND_SETTING` (228)
2. Server → Client: `SOUND_SETTING` (308) - state (0=off, 1=on)
3. Client → Server: `SET_SOUND_SETTING` (229)

---

## 2. Hotel Status & Availability

**Thread:** `openinghours`
**Handler:** `Opening Hours Handler Class.ls` (hh_entry_init/13_Opening Hours Handler Class.ls)

### 2.1 Operating Hours System

**Feature:** Scheduled hotel opening/closing with user notifications

**Flow:**
1. Client → Server: `GET_AVAILABILITY_TIME` (212)
2. Server → Client: `AVAILABILITY_STATUS` (290) - isOpen, shutDown
3. Server → Client: `AVAILABILITY_TIME` (293) - isOpen, timeUntil
4. Server → Client: `INFO_HOTEL_CLOSING` (291) - minutesUntil (alert)
5. Server → Client: `INFO_HOTEL_CLOSED` (292) - openHour, openMinute, disconnect
6. Server → Client: `LOGIN_FAILED_HOTEL_CLOSED` (294) - Rejection on login

**States:**
- `isOpen: int` - Hotel accepting connections
- `shutDown: int` - Permanent (1) vs temporary (0)
- `tClosingState` - 0=open, 1=shutdown, 2=temporary close

---

## 3. Navigator - Room Browsing

**Thread:** `navigator`
**Handler:** `Navigator Handler Class.ls` (hh_navigator/6_Navigator Handler Class.ls)

### 3.1 Hierarchical Room Browser

**Feature:** Tree-structured room categories with live visitor counts

**Node Types:**
- **Category (nodeType=0):** Container with children
- **Unit (nodeType=1):** Public room with connection info
- **Flat (nodeType=2):** Private room listing

**Flow:**
1. Client → Server: `NAVIGATE` (150) - nodeId, nodeMask, depth
2. Server → Client: `NAVNODEINFO` (220) - Node tree

**Node Structure:**
```
NavigatorNode:
  id: string
  nodeType: int
  name: string
  userCount: int
  maxUsers: int
  parentId: string
  
  For Units (nodeType=1):
    unitStrId: string
    port: int
    door: int (0=open, 1=closed, 2=password)
    casts: string[]
    usersInQueue: int
    isVisible: bool
    
  For Flats (nodeType=2):
    flatId: int
    owner: string
    door: string ("open"|"closed"|"password")
    description: string
    marker: string
    showOwnerName: int
    trading: int
    alert: int
    maxVisitors: int
    absoluteMaxVisitors: int
```

### 3.2 Recommended Rooms

**Flow:**
1. Client → Server: `GET_RECOMMENDED_ROOMS` (264)
2. Server → Client: `RECOMMENDED_ROOM_LIST` (351)

### 3.3 Room Search

**Commands:**
- `SBUSYF` (13) - Busy rooms
- `SUSERF` (16) - User's rooms
- `SRCHF` (17) - General search
- `GETFVRF` (18) - Favorites

**Results:** `GETFLAT_RESULTS` (16/55) - TAB-delimited room list

### 3.4 Favorites Management

**Flow:**
1. Client → Server: `ADD_FAVORITE_ROOM` (19) / `DEL_FAVORITE_ROOM` (20)
2. Server → Client: `FAVORITEROOMRESULTS` (61) - Updated favorites

**Limit:** Maximum 10 favorite rooms (server-enforced, error 33)

### 3.5 Room Access Control

**Password Protection:**
1. Client → Server: `TRYFLAT` (57) - password
2. Server → Client: `FLATPASSWORD_OK` (130) - Access granted

**Queue System:**
1. Client → Server: `GETSPACENODEUSERS` (154) - nodeId
2. Server → Client: `SPACENODEUSERS` (223) - nodeId, userCount, usernames[]

**Entry Denial:**
- Server → Client: `CANTCONNECT` (224)
  - Error 1: Room full
  - Error 2: Room closed
  - Error 3: Queue (with queue name)
  - Error 4: User banned

### 3.6 Category Management

**Flow:**
1. Client → Server: `GETUSERFLATCATS` (151)
2. Server → Client: `USERFLATCATS` (221) - Category list
3. Client → Server: `GETFLATCAT` (152) / `SETFLATCAT` (153)
4. Server → Client: `FLATCAT` (222) - Confirmation
5. Client → Server: `GETPARENTCHAIN` (156)
6. Server → Client: `PARENTCHAIN` (227) - Hierarchy

### 3.7 Room Forwarding

**Server → Client:** `ROOMFORWARD` (286) - isPublic, roomId

---

## 4. Room System

**Thread:** `room`
**Handler:** `Room Handler Class.ls` (hh_room/5_Room Handler Class.ls)

### 4.1 Room Entry Sequence

**Feature:** Complete state synchronization

**Sequence:**
1. Server → Client: `OPC_OK` - Connection established
2. Server → Client: `HEIGHTMAP` (50) - Tile grid
3. Server → Client: `USERS` (40) - User list
4. Server → Client: `STATUS` (27) - Positions/actions
5. Server → Client: `OBJECTS` (44) - Passive furniture
6. Server → Client: `ACTIVEOBJECTS` (90) - Active furniture
7. Server → Client: Room items (wall-mounted)
8. Server → Client: `ROOM_READY` - Entry complete

### 4.2 Height Map System

**Format:** Line-delimited string
- `0-8` = Walkable tile at height
- `x` = Void (non-walkable)
- `y` = Walkable, no placement

**Example:**
```
xxxxxxxx
x000000x
x001100x
x002200x
xxxxxxxx
```

**Updates:** `HEIGHTMAPUPDATE` (51) - Delta updates

### 4.3 User Representation

**USERS Packet Format (line-delimited with property prefixes):**
```
i12345       -- User ID
nUsername    -- Name
fHD180.HR835 -- Figure string
l10,10,0.0   -- Location (x,y,h)
cCustom      -- Motto
sM           -- Sex (M/F)
b1:BADGE1,2:BADGE2 -- Badges
a12345       -- Account ID
gGROUP123    -- Group ID
tSTATUS      -- Group status
x100         -- XP points
```

### 4.4 Status Actions

**STATUS Packet Format:**
```
userId x,y,h,dirBody,dirHead/action1/action2...
```

**Action Types:**
- `mv x,y,h` - Moving
- `sit x,y,h,dir` - Sitting
- `lay x,y,h,dir` - Lying down
- `wav` - Waving
- Custom furniture actions

### 4.5 User Movement

**Commands:**
- Client → Server: `MOVE` (75) - x, y
- Client → Server: `STOP` (88) - Cancel movement
- Client → Server: `LOOKTO` (79) - x, y (look direction)

### 4.6 Room Exit

**Commands:**
- Client → Server: `QUIT` (53) - Voluntary exit
- Server → Client: `LOGOUT` - User logged out
- Server → Client: `DISCONNECT` - Connection lost
- Server → Client: `CLC` - Connection closed

---

## 5. Furniture System

**Thread:** `buffer`
**Handler:** `Buffer Handler Class.ls` (hh_buffer/4_Buffer Handler Class.ls)

### 5.1 Furniture Classification

**Three Types:**
1. **Passive Objects** - Static decorations (floor/wall)
2. **Active Objects** - Interactive with state machines
3. **Item Objects** - Wall-mounted (PostIt, photos, posters)

### 5.2 Furniture Lifecycle

**Passive/Active Objects:**
- Server → Client: `ACTIVEOBJECTS` (90) - Initial list
- Server → Client: `ACTIVEOBJECT_ADD` - New object
- Server → Client: `ACTIVEOBJECT_UPDATE` (95) - State change
- Server → Client: `ACTIVEOBJECT_REMOVE` (94) - Removed
- Server → Client: `STUFFDATAUPDATE` (88) - Custom data update

**Wall Items:**
- Server → Client: `ITEMS` - Initial list
- Server → Client: `UPDATEITEM` (85) - State change
- Server → Client: `REMOVEITEM` (84) - Removed

### 5.3 Furniture Placement

**Commands:**
- Client → Server: `PLACESTUFF` (90) - Place from inventory
- Client → Server: `REMOVESTUFF` (99) - Remove to inventory
- Client → Server: `MOVESTUFF` (73) - Reposition
- Client → Server: `SETSTUFFDATA` (74) - Set state
- Client → Server: `SETITEMSTATE` (214) - Set item state
- Client → Server: `SETITEMDATA` (84) - Set item data
- Client → Server: `USEITEM` (89) - Use item

### 5.4 Interactive Furniture

**Dice:**
- Client → Server: `THROW_DICE` (76) - diceId
- Client → Server: `DICE_OFF` (77) - diceId
- Server → Client: `DICE_VALUE` (190) - diceId, value (1-6)

**Wheel of Fortune:**
- Client → Server: `SPIN_WHEEL_OF_FORTUNE` (247) - wheelId

**Teleports:**
- Client → Server: `INTODOOR` (81) - doorId
- Client → Server: `DOORGOIN` (82) - doorId
- Client → Server: `GETDOORFLAT` (28) - doorId
- Server → Client: `DOOR_IN` - doorId, userName
- Server → Client: `DOOR_OUT` - doorId
- Server → Client: `DOORFLAT` - teleId, flatId
- Server → Client: `DOORDELETED`

**Presents:**
- Client → Server: `PRESENTOPEN` (78) - presentId
- Server → Client: `PRESENTOPEN` - type, code, colors

**Credit Furni:**
- Client → Server: `CONVERT_FURNI_TO_CREDITS` (183) - itemId

**Random State:**
- Client → Server: `SET_RANDOM_STATE` (314) - itemId, state

### 5.5 Asset Pipeline

**Thread:** `dynamicdownloader`
**Handler:** `Dynamic Downloader Handler Class.ls`

**Flow:**
1. Client → Server: `GET_FURNI_REVISIONS` (213)
2. Server → Client: `FURNI_REVISIONS` (295) - className, revision pairs
3. Client → Server: `GET_ALIAS_LIST` (215)
4. Server → Client: `ALIAS_LIST` (297) - className → alias mappings
5. Server → Client: `DOWNLOAD_URLS` (217) - Asset pack URLs

**Process:**
- Compare revisions with local cache
- Queue downloads for missing/outdated packs
- Serial download (one at a time)
- Show placeholder graphics during download
- Replace placeholders on download complete

### 5.6 Strip (Inventory) System

**Flow:**
1. Client → Server: `GETSTRIP` (65) - "new"
2. Server → Client: `STRIPINFO` (140) - Inventory contents
3. Server → Client: `STRIPUPDATED` (98) - Change notification
4. Server → Client: `REMOVESTRIPITEM` - Item removed

**Strip Data Structure:**
```
StripItem:
  stripId: string
  striptype: "S" (active) or "I" (item)
  id: string
  class: string
  name: string
  custom: string
  dimensions: [width, height]
  stuffdata: string
  colors: string
  isRecyclable: bool
  slotID: string (music discs)
  songID: string (music furniture)
  stripColor: RGB
```

---

## 6. Chat & Communication

**Handler:** `Chat Manager.ls` (hh_room_utils/25_Chat Manager.ls)

### 6.1 Chat System

**Feature:** Three-range chat with visual bubbles

**Commands:**
- Client → Server: `CHAT` (52) - message
- Client → Server: `SHOUT` (55) - message
- Client → Server: `WHISPER` (56) - message
- Server → Client: `CHAT` (24/25/26) - userId, message

**Chat Modes:**
- CHAT (24) - Normal range
- WHISPER (25) - Short range
- SHOUT (26) - Extended range
- UNHEARD - Empty message (muted)

### 6.2 User Expressions

**Commands:**
- Client → Server: `WAVE` (94)
- Client → Server: `DANCE` (93) - danceId (1-4)
- Client → Server: `CARRYDRINK` (80) - itemId
- Client → Server: `CARRYITEM` (87) - itemId

### 6.3 Typing Indicator

**Commands:**
- Client → Server: `USER_START_TYPING` (317)
- Client → Server: `USER_CANCEL_TYPING` (318)

---

## 7. Social Features

### 7.1 Friend List

**Thread:** `friend_list`
**Handler:** `Friend List Handler Class.ls` (hh_friend_list/5_Friend List Handler Class.ls)

**Initialization:**
1. Client → Server: `FRIENDLIST_INIT` (12)
2. Server → Client: `FRIENDLIST_INIT` (12) - Limits, categories, friends

**Friend List Data:**
```
Limits:
  userLimit: int
  normalLimit: int
  extendedLimit: int (HC)

Categories:
  - uniqueId: int
  - name: string

Friends:
  - id: int
  - name: string
  - sex: int
  - online: bool
  - canFollow: bool
  - figure: string
  - categoryId: int
  - mission: string
  - lastAccess: string
```

**Updates:**
- Server → Client: `FRIENDLIST_UPDATE` (13/15)
  - UpdateType: -1=remove, 0=update, 1=add

**Friend Requests:**
1. Client → Server: `FRIENDLIST_FRIENDREQUEST` (39)
2. Server → Client: `FRIEND_REQUEST` (132)
3. Client → Server: `FRIENDLIST_ACCEPTFRIEND` (37) / `DECLINE` (38)
4. Server → Client: `FRIEND_REQUEST_RESULT` (315)
5. Client → Server: `FRIENDLIST_GETFRIENDREQUESTS` (233)
6. Server → Client: `FRIEND_REQUEST_LIST` (314)

**Search:**
1. Client → Server: `MESSENGER_HABBOSEARCH` (41)
2. Server → Client: `HABBO_SEARCH_RESULT` (435)

**Follow:**
1. Client → Server: `FOLLOW_FRIEND` (262)
2. Server → Client: `FOLLOW_FAILED` (349) - reason

**Error Codes:**
- 2 = Friend list full
- 3 = Doesn't accept requests
- 4 = Request not found
- 37 = Various limits
- 39/42 = Concurrency error

### 7.2 Instant Messenger

**Thread:** `instant_messenger`
**Handler:** `Instant Messenger Handler Class.ls`

**Commands:**
- Client → Server: `MESSENGER_SENDMSG` (33) - recipientId, message
- Server → Client: `IM_MESSAGE` (134) - senderId, text
- Client → Server: `FRIEND_INVITE` (34)
- Server → Client: `IM_INVITATION` (135)
- Server → Client: `IM_ERROR` (261) - errorCode, chatId
- Server → Client: `INVITATION_ERROR` (262)

### 7.3 Mail Notifications

**Server → Client:**
- `MAIL_NOTIFICATION` (363) - userId
- `MAIL_COUNT_NOTIFICATION` (364) - unreadCount

---

## 8. Economy & Catalogue

**Thread:** `catalogue`
**Handler:** `Catalogue Handler Class.ls` (hh_cat_code/5_Catalogue Handler Class.ls)

### 8.1 Credit Balance

**Flow:**
1. Client → Server: `GPRC` (100)
2. Server → Client: `PURSE` (6) - credits (string, can have decimals)

### 8.2 Catalogue Navigation

**Flow:**
1. Client → Server: `GCIX` (101) - editMode, language
2. Server → Client: `CATALOGINDEX` (126) - Page tree

**Index Format (TAB-delimited):**
```
pageId\tparentId\tname\tminRank\tleaf
```

**Page Request:**
1. Client → Server: `GCAP` (102) - pageId, editMode, language
2. Server → Client: `CATALOGPAGE` (127)

**Page Format (key:value lines):**
```
i:id              -- Page ID
n:pageName        -- Display name
l:layout          -- Layout code
h:headerText      -- Header (with <br>)
g:headerImage     -- Header image filename
w:teaserText      -- Promo text
e:img1,img2       -- Teaser images
s:specialText     -- Special offer
t1:text           -- Text block 1
u:url1,url2       -- Links
p:product...      -- Product line
```

**Product Format:**
```
p:name\tdesc\tprice\tspecial\ttype\tclass\tdir\tdims\tcode\tcolors\tcount\tclass1\tcount1\tcolors1...
```

### 8.3 Purchase Flow

**Server → Client:**
- `PURCHASE_OK` (67) - Success
- `PURCHASE_ERROR` (65) - Failure with reason
- `PURCHASE_NOBALANCE` (68) - Insufficient funds
- `PURCHASENOTALLOWED` (296) - Restricted (HC required)

---

## 9. Avatar & Figure System

**Handler:** `Figure System Class.ls` (hh_human/11_Figure System Class.ls)

### 9.1 Figure String Format

**Format:** `partType-setID-colorID.partType-setID-colorID...`

**Example:** `hd180.hr835-ccf66.ey836.cch835.ch210.lg270.sh290`

**Part Types:**
| Code | Type | Colorable |
|------|------|-----------|
| hd | Head/skin | Yes |
| hr | Hair | Yes |
| he | Head accessory | Yes |
| ha | Hat | Yes |
| hf | Face | Yes |
| ch | Chest/shirt | Yes |
| ca | Chest accessory | Yes |
| wa | Waist | Yes |
| lg | Legs | Yes |
| sh | Shoes | Yes |

### 9.2 Figure Data Loading

**Configuration (downloaded):**
- `figure.partsets.xml` - Part definitions
- `figure.draworder.xml` - Layer order
- `figure.animation.xml` - Animations
- `figurepartlist.txt` - Color mappings

**Part Properties:**
- swim (swimwear variant)
- small (32px scale)
- flipped-set-type (mirrored)
- remove-set-type (hidden layers)

### 9.3 Figure Changes

**Flow:**
1. Client → Server: `GETAVAILABLESETS` (9)
2. Server → Client: `FIGURE_CHANGE` (266) - Broadcast to room

---

## 10. Habbo Club

**Thread:** `habbo_club`
**Handler:** `Club Handler Class.ls`

### 10.1 Subscription Info

**Flow:**
1. Client → Server: `SCR_GET_USER_INFO` (26) - productName
2. Server → Client: `OK` (3)
3. Server → Client: `SCR_SINFO` (7)

**Subscription Data:**
```
productName: string
daysLeft: int
elapsedPeriods: int
prepaidPeriods: int
responseFlag: int
```

### 10.2 Purchase & Gifts

**Commands:**
- Client → Server: `SCR_BUY` (190) - Purchase
- Client → Server: `SCR_GIFT_APPROVAL` (210) - Gift membership
- Server → Client: `GIFT` (280) - Gift notification (count)

---

## 11. Mini-Games (IG System)

**Thread:** `ig`
**Handler:** `IG Handler Class.ls` (hh_ig/3_IG Handler Class.ls)

### 11.1 Game Directory

**Flow:**
1. Client → Server: `IG_CHECK_DIRECTORY_STATUS`
2. Server → Client: `DIRECTORY_STATUS` - code (0=available)
3. Client → Server: `IG_GET_CREATE_GAME_INFO`
4. Server → Client: `CREATE_GAME_INFO` - Available levels

### 11.2 Game List

**Flow:**
1. Client → Server: `IG_GET_GAME_LIST` - startObserving, maxResults
2. Server → Client: `GAME_LIST` - Instance list

**Game Instance:**
```
id: int
levelName: string
gameType: int
fieldType: int
numberOfTeams: int
playerCount: int
playerMaxCount: int
ownerName: string
```

### 11.3 Game Lifecycle

**Commands:**
- Client → Server: `IG_CREATE_GAME` - levelId, params
- Client → Server: `IG_START_GAME`
- Client → Server: `IG_JOIN_GAME` - gameId, teamId
- Client → Server: `IG_LEAVE_GAME`
- Client → Server: `IG_START_OBSERVING_GAME` - gameId
- Client → Server: `IG_STOP_OBSERVING_GAME` - gameId
- Client → Server: `IG_ACCEPT_INVITE_REQUEST` / `DECLINE`
- Client → Server: `IG_LOAD_STAGE_READY` - percentage
- Client → Server: `IG_EXIT_GAME` - redirectFlag
- Client → Server: `IG_PLAY_AGAIN`
- Client → Server: `IG_GET_LEVEL_HALL_OF_FAME` - levelId
- Client → Server: `IG_ROOM_GAME_STATUS` - joinedFlag, gameId, gameType
- Client → Server: `IG_INVITE_USER` - userName, message
- Client → Server: `IG_KICK_USER` - userId

### 11.4 Game States (Server → Client)

| State | Opcode/Command | Description |
|-------|----------------|-------------|
| Enter Arena Failed | `ENTER_ARENA_FAILED` | code |
| Game Rejoin | `GAME_REJOIN` | timeLeft |
| Player Exited | `PLAYER_EXITED_GAME_ARENA` | roomIndex |
| Start Failed | `START_FAILED` | code |
| Join Failed | `JOIN_FAILED` | code |
| In Queue | `IN_ARENA_QUEUE` | queuePos |
| Still Loading | `STAGE_STILL_LOADING` | progress, finishedPlayers |
| Game Not Found | `GAME_NOT_FOUND` | gameId |
| Game Chat | `GAME_CHAT` | id, message |
| Enter Arena | `ENTER_ARENA` | gameType, levelId, teams |
| Arena Entered | `ARENA_ENTERED` | player, teamId |
| Load Stage | `LOAD_STAGE` | gameType |
| Stage Starting | `STAGE_STARTING` | gameType, roomMarker, time |
| Stage Running | `STAGE_RUNNING` | - |
| Stage Ending | `STAGE_ENDING` | timeToNext |
| Game Ending | `GAME_ENDING` | teams, scores, xp |
| Game Created | `GAME_CREATED` | game data |
| Game Long Data | `GAME_LONG_DATA` | Full game state |
| User Joined | `USER_JOINED_GAME` | player data |
| User Left | `USER_LEFT_GAME` | playerId |
| Observation Started | `GAME_OBSERVATION_STARTED_SHORT` | game |
| Game Cancelled | `GAME_CANCELLED` | gameId, reason |
| Game Started | `GAME_STARTED` | gameId |

### 11.5 Hall of Fame

**Server → Client:** `LEVEL_HALL_OF_FAME`
```
id: int
name: string
topLevelScores: [{name, score}]
levelTeamScores: [{score, id, players[]}]
```

---

## 12. Moderation (Hobba)

**Thread:** `hobba`
**Handler:** `Hobba Handler Class.ls` (hh_shared/5_Hobba Handler Class.ls)

### 12.1 Call for Help (CFH)

**User Submission:**
1. Client → Server: `CALL_FOR_HELP` (86) - category, message

**Moderator Queue:**
1. Server → Client: `CRYFORHELP` (148) - CFH details
2. Client → Server: `PICK_CRYFORHELP` (48) - Claim CFH
3. Server → Client: `PICKED_CRY` (149) - Confirmation
4. Client → Server: `FOLLOW_CRYFORHELP` (323) - Teleport to room
5. Client → Server: `CHANGECALLCATEGORY` (198) - Recategorize
6. Client → Server: `MESSAGETOCALLER` (199) - Reply
7. Server → Client: `CRY_REPLY` (274) - Reply from mod
8. Client → Server: `MODERATIONACTION` (200) - Take action
9. Server → Client: `DELETE_CRY` (273) - Remove from queue

**CFH Structure:**
```
cry_id: string
category: int
time: string
sender: string
Msg: string (with <br> converted)
url_id: string
roomname: string
type: int (-1=IM, 0=public, 1=private, 2=game)

For type 0 (public):
  casts: string
  port: int
  door: int
  room_id: door

For type 1 (private):
  marker: string
  room_id: string
  owner: string

For type 2 (game):
  casts: string
  port: int
  door: int
  room_id: door
```

### 12.2 Room Moderation

**Commands:**
- Client → Server: `KICKUSER` (95) - userId
- Client → Server: `BANUSER` (320) - userId
- Client → Server: `ASSIGNRIGHTS` (96) - userId
- Client → Server: `REMOVERIGHTS` (97) - userId
- Client → Server: `RATEFLAT` (261) - rating

### 12.3 Ignore System

**Commands:**
- Client → Server: `IGNOREUSER` (319) - userId
- Client → Server: `GET_IGNORE_LIST` (321)
- Client → Server: `UNIGNORE_USER` (322) - userId

---

## 13. Tutorial System

**Thread:** `new_user_help`
**Handler:** `Tutorial Handler Class.ls` & `NUH Handler Class.ls`

### 13.1 Tutorial Configuration

**Flow:**
1. Client → Server: `GET_ACCOUNT_PREFERENCES` (228)
2. Server → Client: `ACCOUNT_PREFERENCES` (308) - sounds, tutorial
3. Client → Server: `SET_TUTORIAL_MODE` (249) - enabled
4. Client → Server: `GET_TUTORIAL_CONFIGURATION` (250)
5. Server → Client: `TUTORIAL_CONFIG` (327)
6. Client → Server: `GET_TUTORIAL_TOPIC_CONFIGURATION` (251)
7. Server → Client: `TOPIC_CONFIG` (328)
8. Client → Server: `GET_TUTORIAL_STATUS` (252)
9. Server → Client: `TUTORIAL_STATUS` (329)
10. Client → Server: `COMPLETE_TUTORIAL_TOPIC` (253)
11. Server → Client: `TOPIC_RESULT` (330) - userRewarded

**Tutorial Structure:**
```
Tutorial:
  id: int
  name: string
  topics: [{
    topicId: int
    topicName: string
    status: int
  }]

Topic:
  id: int
  steps: [{
    stepId: int
    stepName: string
    prerequisites: [{message, param}]
    triggers: string[]
    restrictions: string[]
    content: [{
      textKey: string
      targetId: string
      direction: string
      offsetX: string
      offsetY: string
      special: string
    }]
    tutor: {textKey, targetId="tutor", ...}
  }]
```

### 13.2 Tutor Invitations (NUH)

**Commands:**
- Server → Client: `HELP_ITEMS` (352)
- Server → Client: `TUTORS_AVAILABLE` (356)
- Client → Server: `MSG_GET_TUTORS_AVAILABLE` (355)
- Client → Server: `MSG_INVITE_TUTORS` (356)
- Server → Client: `INVITING_COMPLETED` (357) - acceptCount
- Server → Client: `INVITATION_EXISTS` (358)
- Server → Client: `INVITATION_SENT` (421)
- Server → Client: `GUIDE_FOUND` (423)
- Server → Client: `INVITER_LEFT_ROOM` (424) - roomId
- Client → Server: `MSG_REMOVE_ACCOUNT_HELP_TEXT` (313)
- Client → Server: `MSG_CANCEL_TUTOR_INVITATIONS` (359)

---

## 14. Guide System

**Thread:** `guide`
**Handler:** `Guide Handler Class.ls` (hh_guide/5_Guide Handler Class.ls)

### 14.1 Guide Program

**Feature:** Volunteer helper system

**Commands:**
- Server → Client: `INVITATION` (355) - userId, name
- Client → Server: `MSG_ACCEPT_TUTOR_INVITATION` (357)
- Client → Server: `MSG_REJECT_TUTOR_INVITATION` (358)
- Server → Client: `INVITATION_FOLLOW_FAILED` (359)
- Server → Client: `INVITATION_CANCELLED` (360)
- Client → Server: `MSG_INIT_TUTORSERVICE` (360)
- Client → Server: `MSG_WAIT_FOR_TUTOR_INVITATIONS` (362)
- Client → Server: `MSG_CANCEL_WAIT_FOR_TUTOR_INVITATIONS` (363)
- Server → Client: `INIT_TUTOR_SERVICE_STATUS` (425) - state
- Server → Client: `ENABLE_TUTOR_SERVICE_STATUS` (426) - state, guidePoints

**States:**
- 1 = enabled
- 2 = disabled
- 3 = disabled (error)

**Error Alerts:**
- guide_tool_friendlist_full (state 2 on enable)
- guide_tool_service_disabled (state 3)
- guide_tool_max_newbies (state 4)

---

## 15. Photo System

**Thread:** `photo`
**Handler:** `Photo Handler Class.ls` (hh_photo/4_Photo Handler Class.ls)

### 15.1 Film Economy

**Connections:**
- Info connection: opcode 4 (`FILM`)
- MUS connection: `FILM`, `OK`

**Flow:**
- Server → Client: `FILM` (4) - filmCount
- Server → Client: `FILM` (MUS) - filmCount

**Data:**
- photo_film - Film rolls remaining
- photo_tickets - Developed photos

---

## 16. Poll System

**Thread:** `poll`
**Handler:** `Poll Handler Class.ls` (hh_poll/5_Poll Handler Class.ls)

### 16.1 In-Room Polls

**Flow:**
1. Server → Client: `POLL_OFFER` (316) - pollId, description
2. Client → Server: `POLL_START` (234) - Accept
3. Server → Client: `POLL_CONTENTS` (317) - Questions
4. Client → Server: `POLL_ANSWER` (236) - Submit
5. Client → Server: `POLL_REJECT` (235) - Decline
6. Server → Client: `POLL_ERROR` (318) - Error

**Question Structure:**
```
pollID: int
pollHeadLine: string
pollThankYou: string
questions: [{
  questionID: int
  questionNumber: int
  questionCount: int
  questionType: int (1=single, 2=multiple)
  questionText: string
  selectionData: {
    minSelect: int
    maxSelect: int
    questions: string[]
  }
}]
```

---

## 17. Recycler System

**Thread:** `recycler`
**Handler:** `Recycler Handler Class.ls` (hh_recycler/5_Recycler Handler Class.ls)

### 17.1 Furniture Recycling

**Configuration:**
1. Client → Server: `GET_FURNI_RECYCLER_CONFIGURATION` (222)
2. Server → Client: `RECYCLER_CONFIGURATION` (303)

**Config Data:**
```
serviceEnabled: int
quarantineMinutes: int
recyclingMinutes: int
minutesToTimeout: int
rewardItems: [{
  furniValue: int
  type: int (0=room, 1=wall, 2=other)
  class: string
  defaultDirection: int
  xDimension: int
  yDimension: int
  partColors: string
  name: string
}]
```

**Status:**
1. Client → Server: `GET_FURNI_RECYCLER_STATUS` (223)
2. Server → Client: `RECYCLER_STATUS` (304)

**Status Values:**
- 0 = open
- 1 = progress (rewardType, furniClass, minutesLeft)
- 2 = ready (rewardType, furniClass)
- 3 = timeout

**Recycling Flow:**
1. Client → Server: `START_FURNI_RECYCLING` (225)
2. Server → Client: `START_RECYCLING_RESULT` (306)
3. Client → Server: `APPROVE_RECYCLED_FURNI` (224)
4. Server → Client: `APPROVE_RECYCLING_RESULT` (305)
5. Client → Server: `CONFIRM_FURNI_RECYCLING` (226)
6. Server → Client: `CONFIRM_RECYCLING_RESULT` (307)

---

## 18. Room Management

**Thread:** `roomkiosk`
**Handler:** `RoomKiosk Handler Class.ls` (hh_kiosk_room/5_RoomKiosk Handler Class.ls)

### 18.1 Room Creation

**Flow:**
1. Client → Server: `CREATEFLAT` (29) - name, model, description
2. Server → Client: `FLATCREATED` (59) - id, name
3. Server → Client: `ERROR` (33) - Error message

**Web Shortcut:**
- Server → Client: `WEBSHORTCUT` (353) - requestId
- requestId=1 triggers room kiosk open

### 18.2 Room Settings

**Commands:**
- Client → Server: `DELETEFLAT` (23) - Delete room
- Client → Server: `UPDATEFLAT` (24) - Update settings
- Client → Server: `SETFLATINFO` (25) - Set name/description
- Client → Server: `GETFLATINFO` (21) - Get details
- Server → Client: `FLATINFO` (54) - Room details

**Room Properties:**
```
ableOthersMoveFurniture: int
door: int (0=open, 1=closed, 2=password)
flatId: int
owner: string
marker: string
name: string
description: string
showOwnerName: int
trading: int
alert: int
maxVisitors: int
absoluteMaxVisitors: int
```

### 18.3 Room Rights

**Server → Client:** `ROOM_RIGHTS`
- Subject 42 = Rights granted
- Subject 43 = Rights removed
- Subject 47 = Owner status

**Commands:**
- Client → Server: `REMOVEALLRIGHTS` (155) - Revoke all
- Client → Server: `LETUSERIN` (98) - Doorbell accept

### 18.4 Room Events

**Commands:**
- Client → Server: `CAN_CREATE_ROOMEVENT` (345)
- Client → Server: `CREATE_ROOMEVENT` (346)
- Client → Server: `QUIT_ROOMEVENT` (347)
- Client → Server: `EDIT_ROOMEVENT` (348)
- Client → Server: `GET_ROOMEVENT_TYPE_COUNT` (349)
- Client → Server: `GET_ROOMEVENTS_BY_TYPE` (350)

### 18.5 Group System

**Commands:**
- Client → Server: `GET_GROUP_BADGES` (230) - groupId
- Client → Server: `GET_GROUP_DETAILS` (231) - groupId
- Client → Server: `GET_USER_TAGS` (263) - userId

### 18.6 Spectator & Queue

**Commands:**
- Client → Server: `GET_SPECTATOR_AMOUNT` (216)
- Client → Server: `ROOM_QUEUE_CHANGE` (211) - queueId, position

---

## 19. Error Handling

**Thread:** `error_report`
**Handler:** `Error Report Handler Class.ls` (hh_shared/57_Error Report Handler Class.ls)

### 19.1 Server Error Reports

**Server → Client:** `ERROR_REPORT` (299)

**Error Data:**
```
errorId: int
errorMsgId: int
time: string
```

**Special Handling:**
- If errorId in `reload.client.on.server.errors` array → reload client

### 19.2 Common Error Messages

| Error Key | Context |
|-----------|---------|
| Alert_WrongNameOrPassword | Login failure |
| Alert_YouAreBanned | User banned |
| nav_error_room_full | Room at capacity |
| nav_error_room_closed | Room closed |
| nav_room_banned | User banned from room |
| trade_youarenotallowed | Cannot trade |
| trade_othernotallowed | Other cannot trade |
| catalog_purchase_not_allowed_hc | HC required |
| console_target_friend_list_full | Friend limit reached |
| console_target_does_not_accept | User doesn't accept |
| console_friend_request_not_found | Request not found |
| console_buddylimit_requester | Requester limit |
| console_buddylist_concurrency | Concurrency error |
| console_follow_not_friend | Not friends |
| console_follow_offline | User offline |
| console_follow_hotelview | User in hotelview |
| console_follow_prevented | User prevented follow |
| friend_invitation_error | Invitation failed |
| guide_tool_friendlist_full | Guide tool full |
| guide_tool_service_disabled | Service disabled |
| guide_tool_max_newbies | Max newbies reached |
| invitation_follow_failed | Follow failed |
| roomatic_create_error | Room creation failed |
| pet_hung_* | Pet hunger level |
| pet_thir_* | Pet thirst level |
| pet_mood_* | Pet happiness |
| pet_enrg_* | Pet energy |
| pet_frnd_* | Pet friendliness |

---

## Appendix A: Connection Architecture

### A.1 Connection Types

| Connection | Variable | Used By |
|------------|----------|---------|
| Info | `connection.info.id` | Login, navigator, friends, IM, catalogue, tutorial, guide, hobba |
| Room | `connection.room.id` | Room protocol, furniture, buffer, recycler, poll |
| MUS | `connection.mus.id` | Photo system |

### A.2 Message Encoding

**Inbound (Server→Client):**
```
[opcode: 2 bytes][payload...]
```

**Outbound (Client→Server):**
```
[encoded_opcode: 2 bytes][command_name_string][payload...]
```

**Opcode Encoding:**
```lingo
byte1 = 64 + (opcode / 64)   -- Integer division
byte2 = 64 + (opcode % 64)   -- Modulo
encoded = CHR(byte1) + CHR(byte2)
```

**Example:** Opcode 213
```
byte1 = 64 + (213 / 64) = 64 + 3 = 67 = 'C'
byte2 = 64 + (213 % 64) = 64 + 21 = 85 = 'U'
encoded = "CU" + "GET_FURNI_REVISIONS"
```

---

## Appendix B: Thread Architecture

### B.1 Thread Pattern (MVC)

Each thread implements MVC pattern:
- **Interface Class** - UI rendering, user input (View)
- **Component Class** - Business logic, data flow (Controller)
- **Handler Class** - Protocol, server communication (Model)

### B.2 Thread Registration

Threads declared in `1_thread.index.txt`:
```
thread.id              = ["login", "openinghours"]
login.interface.class  = Login Interface Class
login.component.class  = Login Component Class
login.handler.class    = Login Handler Class
```

### B.3 Cross-Thread Communication

**Global Event Bus:**
```lingo
executeMessage(#eventName, param1, param2, ...)
```

**Shared Objects:**
```lingo
getObject(#session)
getObject("Figure_System")
```

---

**Document Version:** 1.0
**Last Updated:** 2026-03-31
**Total Features:** 19 major systems
**Total Commands:** 300+ opcodes
**Total Handlers Analyzed:** 21 Handler classes across 18 threads
