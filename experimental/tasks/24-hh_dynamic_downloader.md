# Task: hh_dynamic_downloader — Dynamic Asset Loading

**Priority:** P7  
**Status:** 🔴 Not started  
**Source:** `casts/hh_dynamic_downloader/` (3 scripts, thread.index, variable.index)

## Description

Dynamic download system — loads furniture, avatar, and other asset casts on demand at runtime.

## Key Classes

| Member | Type | Description |
|--------|------|-------------|
| `Dynamic Downloader Component Class` | Script | Download state management |
| `Dynamic Downloader Handler Class` | Script | Download message handling |
| `Dynamic Download Instance` | Script | Individual download instance |

## Thread Index
```
thread.id = dynamicdownloader
```

## Translation Criteria

1. **Dynamic Downloader Component**: Manages download queue for missing casts
2. **Download Instance**: Individual cast download with progress tracking
3. **On-Demand Loading**: Furniture icons, avatar parts, catalogue graphics loaded when needed
4. **Callback System**: Notifies requesting component when download completes
5. **Retry Logic**: Configurable retry count and delay from system props
6. **Cast Resolution**: Maps class names (e.g., `watermatic`) to cast file URLs

## Cross-Cast Dependencies
- Used by `hh_room` for furniture loading
- Used by `hh_room_utils` (Container Hand Class) for icon downloads
- Used by `hh_furni_classes` for furniture preview assets
- Used by `hh_human` for avatar part assets

## Notes
- In the JS version, this maps to dynamic `import()` or WASM-based .cct loading
- For MVP: all casts can be pre-bundled; dynamic loading can be stubbed
- Future: WASM module parses binary .cct files and exposes script members
