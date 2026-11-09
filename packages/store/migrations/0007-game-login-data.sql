-- Each habbo's last time online, the machine id of its last game login, and its sound setting, which the game server saves.

CREATE TABLE IF NOT EXISTS avatar_game_data (
    avatar_id INTEGER PRIMARY KEY REFERENCES avatars(id) ON DELETE CASCADE,
    last_online_at DATETIME,
    machine_id TEXT,
    sound_enabled BOOLEAN NOT NULL DEFAULT TRUE
);
