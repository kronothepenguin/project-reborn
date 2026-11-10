-- The game's fuses Holo's ranks held, for every access group whose level reaches the rank.
-- The ranks are the minrank of system_fuserights in Holo's newest dump (source/holoemu/database.sql), as a group's
-- level is Holo's rank number; the fuses that dump does not rank go to level 7.

INSERT OR IGNORE INTO access_group_attributes (access_group_id, attribute)
SELECT access_groups.id, fuses.column1
FROM access_groups
JOIN (VALUES
    ('fuse_use_club_dance', 2),
    ('fuse_use_special_room_layouts', 2),
    ('fuse_habbo_chooser', 2),
    ('fuse_furni_chooser', 2),
    ('fuse_room_alert', 3),
    ('fuse_enter_full_rooms', 3),
    ('fuse_alert', 4),
    ('fuse_kick', 4),
    ('fuse_mute', 4),
    ('fuse_enter_locked_rooms', 4),
    ('fuse_remove_stickies', 5),
    ('fuse_ban', 5),
    ('fuse_room_kick', 5),
    ('fuse_room_mute', 5),
    ('fuse_receive_calls_for_help', 5),
    ('fuse_see_all_roomowners', 5),
    ('fuse_any_room_controller', 6),
    ('fuse_performance_panel', 6),
    ('fuse_pick_up_any_furni', 6),
    ('fuse_superban', 6),
    ('fuse_moderator_access', 6),
    ('fuse_teleport', 6),
    ('fuse_see_flat_ids', 7),
    ('fuse_administrator_access', 7),
    ('fuse_freeze', 7),
    ('fuse_cancel_roomevent', 7),
    ('fuse_catalog_editor', 7),
    ('fuse_credits', 7),
    ('fuse_debug_window', 7),
    ('fuse_remove_photos', 7),
    ('fuse_see_chat_log_link', 7)
) AS fuses ON access_groups.level >= fuses.column2;
