-- Holo's staff ranks as access groups, for a hotel that has no access group yet.
-- Administrator holds every attribute of the catalogue as it was when the ranks became an update.

CREATE TEMP TABLE seed_ranks AS SELECT NOT EXISTS (SELECT 1 FROM access_groups) AS fresh;

INSERT INTO access_groups (id, name, description, staff_listed, level, created_at, updated_at)
SELECT column1, column2, column3, TRUE, column4, strftime('%Y-%m-%d %H:%M:%f+00:00', 'now'), strftime('%Y-%m-%d %H:%M:%f+00:00', 'now')
FROM (VALUES
    (1, 'Administrator', 'Holds every attribute.', 7),
    (2, 'Moderator', 'Looks after the hotel and its players.', 6),
    (3, 'Gold Hobba', 'Listed on the staff page.', 5),
    (4, 'Silver Hobba', 'Listed on the staff page.', 4),
    (5, 'HabboX', 'Listed on the staff page.', 3)
)
WHERE (SELECT fresh FROM seed_ranks);

INSERT INTO access_group_attributes (access_group_id, attribute)
SELECT column1, column2
FROM (VALUES
    (1, 'housekeeping.access'),
    (1, 'housekeeping.settings'),
    (1, 'housekeeping.accessGroups'),
    (1, 'housekeeping.news'),
    (1, 'housekeeping.banners'),
    (1, 'housekeeping.homeStore'),
    (1, 'housekeeping.users'),
    (1, 'housekeeping.usersPrivate'),
    (1, 'housekeeping.usersEdit'),
    (1, 'housekeeping.credits'),
    (1, 'housekeeping.vouchers'),
    (1, 'housekeeping.bans'),
    (1, 'housekeeping.alerts'),
    (1, 'housekeeping.alertsBroadcast'),
    (1, 'housekeeping.help'),
    (1, 'housekeeping.logs'),
    (1, 'site.maintenanceBypass'),
    (1, 'forum.edit'),
    (1, 'homes.staffItems'),
    (2, 'housekeeping.access'),
    (2, 'housekeeping.users'),
    (2, 'housekeeping.credits'),
    (2, 'housekeeping.vouchers'),
    (2, 'housekeeping.bans'),
    (2, 'housekeeping.alerts'),
    (2, 'housekeeping.alertsBroadcast'),
    (2, 'housekeeping.help'),
    (2, 'housekeeping.banners'),
    (2, 'housekeeping.homeStore'),
    (2, 'forum.edit'),
    (2, 'homes.staffItems'),
    (2, 'site.maintenanceBypass')
)
WHERE (SELECT fresh FROM seed_ranks);

DROP TABLE seed_ranks;
