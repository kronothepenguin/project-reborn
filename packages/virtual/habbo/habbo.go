// Package habbo holds the habbos online in the game, each with the session that
// plays it: added at login and dropped at logout. Nothing here reads or writes
// the database (plans/server decisions 0009, 0047 and 0048).
package habbo

import (
	"slices"
	"sync"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// Session is how the rules reach a habbo's client: each protocol's session
// implements it and turns every event into its own messages. Sessions are
// compared by identity, so a session is a pointer.
type Session interface {
	Notify(event any)
}

// Habbo is an online habbo: what the login read of it, and its session (plans/server decision 0053). A change writes
// the store first, then Update changes the copy.
type Habbo struct {
	store.Avatar
	// Badges are the codes of the habbo's badges, and Worn the one it wears, empty when none.
	Badges       []string
	Worn         string
	SoundEnabled bool
	Fuses        []string
	// Ignored are the avatar ids of the habbos whose chat it does not see, oldest first.
	Ignored []int64
	// Group is the habbo's favourite group, which it shows in rooms (plans/server decision 0068); its ID is 0 when it
	// has none.
	Group   Group
	Session Session
}

// Group is a habbo's favourite group as rooms show it: its badge, and the habbo's status in it, 1 owner, 2 admin or 3
// member, as the client's Group Info class reads it.
type Group struct {
	ID     int64
	Badge  string
	Status int
}

var (
	mu     sync.Mutex
	online = make(map[int64]Habbo)
)

// Get returns a copy of the online habbo avatarID.
func Get(avatarID int64) (Habbo, bool) {
	mu.Lock()
	defer mu.Unlock()
	h, ok := online[avatarID]
	return h.clone(), ok
}

// Update runs change on the online habbo avatarID while s plays it, and reports whether it did. change runs under the
// package's lock, so it must not call a session or the database.
func Update(avatarID int64, s Session, change func(h *Habbo)) bool {
	mu.Lock()
	defer mu.Unlock()
	h, ok := online[avatarID]
	if !ok || h.Session != s {
		return false
	}
	h = h.clone()
	change(&h)
	online[avatarID] = h
	return true
}

func (h Habbo) clone() Habbo {
	h.Badges = slices.Clone(h.Badges)
	h.Fuses = slices.Clone(h.Fuses)
	h.Ignored = slices.Clone(h.Ignored)
	return h
}

// Add puts h online, and returns the habbo it replaces when h was online
// already, on its old session.
func Add(h Habbo) (replaced Habbo, ok bool) {
	mu.Lock()
	defer mu.Unlock()
	replaced, ok = online[h.ID]
	online[h.ID] = h.clone()
	return replaced, ok
}

// Drop takes avatarID offline while s plays it, and reports whether it did: a
// session that a second login replaced drops nothing.
func Drop(avatarID int64, s Session) bool {
	mu.Lock()
	defer mu.Unlock()
	if h, ok := online[avatarID]; !ok || h.Session != s {
		return false
	}
	delete(online, avatarID)
	return true
}
