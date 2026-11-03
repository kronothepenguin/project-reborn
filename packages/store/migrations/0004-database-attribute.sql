-- Applying database updates and config.json changes, for every group and user that manages access.

INSERT OR IGNORE INTO access_group_attributes (access_group_id, attribute)
SELECT access_group_id, 'housekeeping.database'
FROM access_group_attributes
WHERE attribute = 'housekeeping.accessGroups';

INSERT OR IGNORE INTO user_attributes (user_id, attribute, granted_at, granted_by_user_id)
SELECT user_id, 'housekeeping.database', strftime('%Y-%m-%d %H:%M:%f+00:00', 'now'), NULL
FROM user_attributes
WHERE attribute = 'housekeeping.accessGroups';
