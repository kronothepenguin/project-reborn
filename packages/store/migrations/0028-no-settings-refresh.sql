-- The setting cms.refresh goes: every program reads the settings from the database when it uses them.

DELETE FROM settings WHERE key = 'cms.refresh';
