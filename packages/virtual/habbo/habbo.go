// Package habbo holds the habbos online in the game, each with the session that
// plays it: added at login and dropped at logout. Nothing here reads or writes
// the database (plans/server decisions 0009, 0047 and 0048).
package habbo

import (
	"sync"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// Session is how the rules reach a habbo's client: each protocol's session
// implements it and turns every event into its own messages. Sessions are
// compared by identity, so a session is a pointer.
type Session interface {
	Notify(event any)
}

// Habbo is an online habbo: its avatar as the login read it, and its session.
type Habbo struct {
	store.Avatar
	Session Session
}

var (
	mu     sync.Mutex
	online = make(map[int64]Habbo)
)

// Get returns the online habbo avatarID.
func Get(avatarID int64) (Habbo, bool) {
	mu.Lock()
	defer mu.Unlock()
	h, ok := online[avatarID]
	return h, ok
}

// Add puts h online, and returns the habbo it replaces when h was online
// already, on its old session.
func Add(h Habbo) (replaced Habbo, ok bool) {
	mu.Lock()
	defer mu.Unlock()
	replaced, ok = online[h.ID]
	online[h.ID] = h
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
