# Task: hh_ig + hh_ig_interface — Minigame System

**Priority:** P6  
**Status:** 🔴 Not started  
**Source:** `casts/hh_ig/` (52 scripts, 1 `.window.txt`, thread.index, variable.index, sound members)  
**Paired with:** `casts/hh_ig_interface/` (0 scripts, 116 `.window.txt`, 20+ palettes, 200+ bitmaps)

## Description

In-game minigame system. Game lobby, matchmaking, pre-game, gameplay, post-game results. Includes SnowWar and BattleBalls game types.

## hh_ig Key Classes (52 scripts)

### Core
| Member | Description |
|--------|-------------|
| `IG Handler/Component/Interface Class` | Core IG system |
| `IG TooltipManager Class` | Game tooltips |
| `IGComponent Base/ListContainer/ItemContainer/UI Base/Subcomponent Classes` | UI component hierarchy |
| `IG RoomLoader Class` | Game room loading |
| `IG GameAssetImport Class` | Asset loading for games |

### Game Types
| Member | Description |
|--------|-------------|
| `IG GameTypes Class` | Game type registry |
| `IG Snowwar GameType Class` | SnowWar game logic |
| `IG BB GameType Class` | BattleBalls game logic |

### Game Lobby
| Member | Description |
|--------|-------------|
| `IG Recommended Class/UI Class` | Recommended games display |
| `IG GameList/UI/List/Details/Snowwar/BB/Highscore Classes` | Game list browser |
| `IG LevelList/UI/List/Details/Snowwar/BB/Highscore Classes` | Level browser |

### Pre-Game
| Member | Description |
|--------|-------------|
| `IG Prejoin/UI Class` | Pre-join lobby |
| `IG GameRulesUI Class` | Rules display |
| `IG BottomBarUI Class` | Bottom action bar |
| `IG ArenaQueueUI Class` | Arena queue display |
| `IG PreGame/UI/Countdown/ProgressBar/Teams/Rules/ShowRulesButton/HideRulesButton Classes` | Pre-game sequence |

### In-Game
| Member | Description |
|--------|-------------|
| `IG GameChat Class` | In-game chat |
| `IG GameData Class` | Game state data |
| `IG JoinedGame/UI/Details/Highscore/Minimized/ChangeTeam Classes` | Active game UI |
| `IG TeamUI Subcomponent Class` | Team display |

### Post-Game
| Member | Description |
|--------|-------------|
| `IG AfterGame/UI/Gameover/GameScore/ReplayQuery/HighscoreButton/GamescoreButton/AlltimeScore/Rejoin Classes` | Post-game results |

### Flags & Misc
| Member | Description |
|--------|-------------|
| `IG FlagManager Class` / `IG UIFlag Class` | Country flag system |
| `Multicomponent Window Wrapper Class/Set Class` | Multi-window management |
| `IG Chat Bubble Info` | Chat bubble styling |
| `IG InviteResp/Send Class` | Game invite handling |

### Sound Members
- `ig-losing`, `ig-winning`, `ig-countdown` — Game sound effects

## hh_ig_interface (116 window files)
Pure UI definitions for the minigame system:
- Recommended games popup
- Game list/team displays for various player counts (2v6, 4v3, 3v4, 1v12)
- Pre-game loading bars, rules displays, countdown timers
- After-game scoreboards, team highscores, replay prompts
- Team selection screens, powerup selection (BattleBalls)
- Chat bubbles, tooltips, arena queue
- Frame templates for different player configurations

## Translation Criteria

1. **Game System**: Complex — multiple game types with different rules
2. **Matchmaking**: Queue system, team balancing, level matching
3. **Pre-Game**: Countdown, rules display, team assignment
4. **Post-Game**: Scoreboard, highscores, replay option
5. **Game Chat**: Separate from room chat
6. **Flags**: Country flag display for players

## Cross-Cast Dependencies
- Uses `hh_ig_interface` for all UI windows
- Referenced by `hh_instant_messenger` for game invites
- Uses `hh_room` for game rooms

## Notes
- This is one of the LARGEST feature casts (52 scripts + 116 windows)
- SnowWar and BattleBalls are the two main game types
- For MVP: can stub the entire minigame system and focus on core room features
