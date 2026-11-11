-- A habbo's room keeps the wallpaper, the floor and the landscape it was decorated with.

ALTER TABLE rooms ADD COLUMN wallpaper TEXT NOT NULL DEFAULT '';
ALTER TABLE rooms ADD COLUMN floor TEXT NOT NULL DEFAULT '';
ALTER TABLE rooms ADD COLUMN landscape TEXT NOT NULL DEFAULT '';
