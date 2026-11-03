-- The hotel's tables as they were before updates existed.
-- Every statement says IF NOT EXISTS, so a database created before updates passes through unchanged.

-- access.schema.sql

CREATE TABLE IF NOT EXISTS access_groups (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL COLLATE NOCASE,
    description TEXT NOT NULL DEFAULT '',
    staff_listed BOOLEAN NOT NULL DEFAULT FALSE,
    level INTEGER NOT NULL DEFAULT 0 CHECK (level >= 0),
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_access_groups_name ON access_groups(name);

CREATE TABLE IF NOT EXISTS access_group_attributes (
    access_group_id INTEGER NOT NULL REFERENCES access_groups(id) ON DELETE CASCADE,
    attribute TEXT NOT NULL,
    PRIMARY KEY (access_group_id, attribute)
);

-- display_avatar_id must be one of the member's own habbos; the application
-- enforces it because a composite foreign key cannot SET NULL one column only.
CREATE TABLE IF NOT EXISTS access_group_members (
    access_group_id INTEGER NOT NULL REFERENCES access_groups(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    display_avatar_id INTEGER REFERENCES avatars(id) ON DELETE SET NULL,
    granted_at DATETIME NOT NULL,
    granted_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    PRIMARY KEY (access_group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_access_group_members_user_id ON access_group_members(user_id);

-- Attributes given to a user directly, on top of those of their access groups.
CREATE TABLE IF NOT EXISTS user_attributes (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attribute TEXT NOT NULL,
    granted_at DATETIME NOT NULL,
    granted_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    PRIMARY KEY (user_id, attribute)
);

CREATE INDEX IF NOT EXISTS idx_user_attributes_attribute ON user_attributes(attribute);

-- auth.schema.sql

CREATE TABLE IF NOT EXISTS credentials (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL,
    updated_at DATETIME NOT NULL
);

-- id is the SHA-256 digest of the cookie token; the token itself is never stored.
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    remember BOOLEAN NOT NULL DEFAULT FALSE,
    ip TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    last_seen_at DATETIME NOT NULL,
    expires_at DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_sessions_avatar_id ON sessions(avatar_id);

CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS login_attempts (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    avatar_id INTEGER REFERENCES avatars(id) ON DELETE SET NULL,
    ip TEXT NOT NULL,
    succeeded BOOLEAN NOT NULL,
    created_at DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_created_at ON login_attempts(ip, created_at);

CREATE INDEX IF NOT EXISTS idx_login_attempts_user_id_created_at ON login_attempts(user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_login_attempts_avatar_id_created_at ON login_attempts(avatar_id, created_at);

-- id is the SHA-256 digest of the emailed token.
CREATE TABLE IF NOT EXISTS password_resets (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at DATETIME NOT NULL,
    expires_at DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_password_resets_user_id ON password_resets(user_id);

-- id is the SHA-256 digest of the ticket handed to the game client.
CREATE TABLE IF NOT EXISTS sso_tickets (
    id TEXT PRIMARY KEY,
    avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    ip TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    expires_at DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sso_tickets_avatar_id ON sso_tickets(avatar_id);

-- avatars.schema.sql

CREATE TABLE IF NOT EXISTS avatars (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL COLLATE NOCASE,
    figure TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('M', 'F')),
    motto TEXT NOT NULL DEFAULT '',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    archived_at DATETIME
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_avatars_name ON avatars(name);

CREATE INDEX IF NOT EXISTS idx_avatars_user_id ON avatars(user_id);

CREATE TABLE IF NOT EXISTS avatar_badges (
    avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    worn BOOLEAN NOT NULL DEFAULT FALSE,
    granted_at DATETIME NOT NULL,
    PRIMARY KEY (avatar_id, code)
);

-- A habbo wears at most one badge.
CREATE UNIQUE INDEX IF NOT EXISTS idx_avatar_badges_avatar_id_worn ON avatar_badges(avatar_id) WHERE worn;

CREATE TABLE IF NOT EXISTS wardrobe_outfits (
    avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    slot INTEGER NOT NULL CHECK (slot >= 1),
    figure TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('M', 'F')),
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (avatar_id, slot)
);

-- club.schema.sql

-- A user is a club member while any period covers the current time.
CREATE TABLE IF NOT EXISTS club_subscriptions (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    starts_at DATETIME NOT NULL,
    ends_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL,
    CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS idx_club_subscriptions_user_id_ends_at ON club_subscriptions(user_id, ends_at);

-- economy.schema.sql

CREATE TABLE IF NOT EXISTS wallets (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    credits INTEGER NOT NULL DEFAULT 0 CHECK (credits >= 0),
    tickets INTEGER NOT NULL DEFAULT 0 CHECK (tickets >= 0),
    film INTEGER NOT NULL DEFAULT 0 CHECK (film >= 0),
    updated_at DATETIME NOT NULL
);

-- Every change of wallets.credits writes one row here in the same transaction.
-- avatar_id is the habbo that acted, and NULL when none did.
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    avatar_id INTEGER REFERENCES avatars(id) ON DELETE SET NULL,
    credits INTEGER NOT NULL,
    reason TEXT NOT NULL,
    detail TEXT NOT NULL DEFAULT '',
    created_at DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id_created_at ON wallet_transactions(user_id, created_at);

CREATE TABLE IF NOT EXISTS vouchers (
    code TEXT NOT NULL COLLATE NOCASE PRIMARY KEY,
    credits INTEGER NOT NULL CHECK (credits > 0),
    created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at DATETIME NOT NULL,
    redeemed_by_avatar_id INTEGER REFERENCES avatars(id) ON DELETE SET NULL,
    redeemed_at DATETIME
);

-- forums.schema.sql

CREATE TABLE IF NOT EXISTS forum_threads (
    id INTEGER PRIMARY KEY,
    avatar_id INTEGER REFERENCES avatars(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    sticky BOOLEAN NOT NULL DEFAULT FALSE,
    locked BOOLEAN NOT NULL DEFAULT FALSE,
    views INTEGER NOT NULL DEFAULT 0 CHECK (views >= 0),
    created_at DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_forum_threads_created_at ON forum_threads(created_at);

CREATE TABLE IF NOT EXISTS forum_posts (
    id INTEGER PRIMARY KEY,
    forum_thread_id INTEGER NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
    avatar_id INTEGER REFERENCES avatars(id) ON DELETE SET NULL,
    body TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    edited_at DATETIME,
    edited_by_avatar_id INTEGER REFERENCES avatars(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_forum_posts_forum_thread_id_created_at ON forum_posts(forum_thread_id, created_at);

CREATE INDEX IF NOT EXISTS idx_forum_posts_avatar_id ON forum_posts(avatar_id);

-- groups.schema.sql

-- The owner (avatar_id) also has an admin row in group_members, written in the
-- same transaction as the group.
CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY,
    avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    name TEXT NOT NULL COLLATE NOCASE,
    description TEXT NOT NULL DEFAULT '',
    badge TEXT NOT NULL,
    access TEXT NOT NULL DEFAULT 'open',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_groups_name ON groups(name);

CREATE INDEX IF NOT EXISTS idx_groups_avatar_id ON groups(avatar_id);

-- joined_at is NULL while a membership request is pending.
CREATE TABLE IF NOT EXISTS group_members (
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member',
    favourite BOOLEAN NOT NULL DEFAULT FALSE,
    requested_at DATETIME NOT NULL,
    joined_at DATETIME,
    PRIMARY KEY (group_id, avatar_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_avatar_id ON group_members(avatar_id);

-- A habbo has at most one favourite group.
CREATE UNIQUE INDEX IF NOT EXISTS idx_group_members_avatar_id_favourite ON group_members(avatar_id) WHERE favourite;

-- home-store.schema.sql

CREATE TABLE IF NOT EXISTS home_store_categories (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    staff_only BOOLEAN NOT NULL DEFAULT FALSE,
    position INTEGER NOT NULL DEFAULT 0
);

-- Items in use by homes or inventories cannot be deleted: disable them instead.
CREATE TABLE IF NOT EXISTS home_store_items (
    id INTEGER PRIMARY KEY,
    home_store_category_id INTEGER NOT NULL REFERENCES home_store_categories(id),
    kind TEXT NOT NULL,
    asset TEXT NOT NULL,
    name TEXT NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 0),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
    enabled BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_home_store_items_home_store_category_id ON home_store_items(home_store_category_id);

CREATE TABLE IF NOT EXISTS home_inventory (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    home_store_item_id INTEGER NOT NULL REFERENCES home_store_items(id),
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    PRIMARY KEY (user_id, home_store_item_id)
);

-- homes.schema.sql

-- A home belongs to exactly one profile or one group.
CREATE TABLE IF NOT EXISTS homes (
    id INTEGER PRIMARY KEY,
    profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
    group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
    background_home_store_item_id INTEGER REFERENCES home_store_items(id),
    updated_at DATETIME NOT NULL,
    CHECK ((profile_id IS NULL) <> (group_id IS NULL))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_homes_profile_id ON homes(profile_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_homes_group_id ON homes(group_id);

CREATE TABLE IF NOT EXISTS home_items (
    id INTEGER PRIMARY KEY,
    home_id INTEGER NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    home_store_item_id INTEGER REFERENCES home_store_items(id),
    widget TEXT,
    skin TEXT NOT NULL DEFAULT '',
    body TEXT NOT NULL DEFAULT '',
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    z INTEGER NOT NULL,
    created_by_avatar_id INTEGER REFERENCES avatars(id) ON DELETE SET NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_home_items_home_id ON home_items(home_id);

-- moderation.schema.sql

-- A ban covers the user (all of their habbos), an IP, or both; a NULL expires_at
-- is permanent. Deleting the user deletes their bans, since SET NULL could
-- leave a row with neither target.
CREATE TABLE IF NOT EXISTS bans (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ip TEXT,
    reason TEXT NOT NULL,
    issued_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at DATETIME NOT NULL,
    expires_at DATETIME,
    lifted_at DATETIME,
    lifted_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    CHECK (user_id IS NOT NULL OR ip IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_bans_user_id ON bans(user_id);

CREATE INDEX IF NOT EXISTS idx_bans_ip ON bans(ip);

CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY,
    avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    sender_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    dismissed_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_alerts_avatar_id_dismissed_at ON alerts(avatar_id, dismissed_at);

CREATE TABLE IF NOT EXISTS help_tickets (
    id INTEGER PRIMARY KEY,
    avatar_id INTEGER REFERENCES avatars(id) ON DELETE SET NULL,
    forum_post_id INTEGER REFERENCES forum_posts(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    ip TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    picked_up_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    picked_up_at DATETIME,
    closed_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_help_tickets_closed_at ON help_tickets(closed_at);

CREATE TABLE IF NOT EXISTS staff_logs (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    target_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    target_avatar_id INTEGER REFERENCES avatars(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    detail TEXT NOT NULL DEFAULT '',
    ip TEXT NOT NULL,
    created_at DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_staff_logs_created_at ON staff_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_staff_logs_target_user_id ON staff_logs(target_user_id);

CREATE INDEX IF NOT EXISTS idx_staff_logs_target_avatar_id ON staff_logs(target_avatar_id);

-- news.schema.sql

CREATE TABLE IF NOT EXISTS news_articles (
    id INTEGER PRIMARY KEY,
    avatar_id INTEGER REFERENCES avatars(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT NOT NULL DEFAULT '',
    summary TEXT NOT NULL,
    body TEXT NOT NULL,
    published_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON news_articles(published_at);

-- profiles.schema.sql

CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY,
    avatar_id INTEGER NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_avatar_id ON profiles(avatar_id);

CREATE TABLE IF NOT EXISTS profile_tags (
    profile_id INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    PRIMARY KEY (profile_id, tag)
);

CREATE INDEX IF NOT EXISTS idx_profile_tags_tag ON profile_tags(tag);

-- referrals.schema.sql

CREATE TABLE IF NOT EXISTS referrals (
    referred_user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    referrer_avatar_id INTEGER REFERENCES avatars(id) ON DELETE SET NULL,
    created_at DATETIME NOT NULL,
    rewarded_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_avatar_id ON referrals(referrer_avatar_id);

-- settings.schema.sql

-- key is a setting key path declared in packages/virtual (site.name); value is a
-- JSON literal of the setting's type ("Habbo", true, 20).
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME NOT NULL,
    updated_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- site.schema.sql

CREATE TABLE IF NOT EXISTS banners (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    position INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

-- users.schema.sql

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL COLLATE NOCASE,
    born_on DATE NOT NULL,
    newsletter BOOLEAN NOT NULL DEFAULT FALSE,
    created_ip TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE INDEX IF NOT EXISTS idx_users_created_ip_created_at ON users(created_ip, created_at);
