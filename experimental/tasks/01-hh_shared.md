# Task: hh_shared — Shared Utilities & Cross-Cutting Systems

**Priority:** P1  
**Status:** 🔴 Not started  
**Source:** `casts/hh_shared/` (14 script members, 24 `.window.txt`, 3 index files)

## Description

Container for shared utilities and cross-cutting systems used by multiple other casts. Includes moderation (Hobba/CFH), sound system, tooltips, error reporting, statistics, and external link handling.

## Key Classes

| Member | Type | Description |
|--------|------|-------------|
| `Hobba Interface/Component/Handler Class` | 3 scripts | Moderation / CFH (Call For Help) system |
| `Sound API/Manager/Channel/Instance Class` | 4 scripts | Audio system |
| `Help Tooltip Manager Class` | 1 script | Tooltip system |
| `Ticket Window Manager Class` | 1 script | Support ticket UI |
| `Error Report Interface/Component/Handler Class` | 3 scripts | Error reporting to server |
| `External Link Interface Class` | 1 script | URL opening handler |
| `Game Oneclick Buy Window Manager Class` | 1 script | Microtransaction UI |
| `Statistics Broker Class` + `Statistics Broker Javascript Class` | 2 scripts | Analytics |
| `Server Date Class` / `Date Class` | 2 scripts | Date/time formatting |
| `Connection Problem Class` | 1 script | Network issue detection |
| `Element Bouncer Class` | 1 script | UI animation utility |
| `CLangTest` | 1 script | Localization testing |
| `Figure Converter Class COPY` | 1 script | Avatar figure conversion |
| `OLD Figure System/Preview/Template Classes` | 3 scripts | Deprecated avatar system |

## Thread Index (`1_thread.index.txt`)
```
thread.id = [hobba, error_report, external_link]
hobba.interface.class = Hobba Interface Class
error_report.interface.class = Error Report Interface Class
external_link.interface.class = External Link Interface Class
```

## Window Files (24)
- `habbo_modtool_main.window.txt` — Moderation tool main window
- `habbo_hobba_alert.window.txt` — CFH alert notification
- `error_report.window.txt` — Error report dialog
- `plate_gold/silver/bronze.window.txt` — Achievement plates
- `habbo_orderinfo_dialog.window.txt` — Purchase info dialog
- `tooltip_external_link.window.txt` — External link tooltip
- `habbo_lang_test.window.txt` — Language test panel
- Plus ticket management windows, sound windows, etc.

## Translation Criteria

1. **Hobba/CFH**: Moderate priority — maps to alert reporting system
2. **Sound API**: Can use Web Audio API; map Director sound commands
3. **Tooltips**: Canvas or DOM overlay, delay from system props (`tooltip.delay = 2000`)
4. **Statistics broker**: Map analytics events to JS tracking
5. **External link**: `window.open()` wrapper
6. **Error report**: POST error data to server endpoint
7. **Date classes**: Use JS `Date`/`Intl` for formatting

## Dependencies
- `fuse_client` (Object API, Window API, Visualizer API, Thread API)
- `hh_interface` (UI window chrome, buttons, dialogs)

## Notes
- This cast is used by almost all feature casts
- Hobba (moderation) is critical for the CFH system in rooms
- Sound system may be stubbed initially (no audio required for MVP)
