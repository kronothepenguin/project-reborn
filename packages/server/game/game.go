// Package game holds the rules of the hotel, with no protocol in them: each
// protocol's handlers call them, and they change the state in packages/virtual
// and write the database (plans/server decision 0005).
package game

import "github.com/kronothepenguin/project-reborn/packages/virtual/habbo"

// Session is how a rule reaches a habbo's client. virtual/habbo declares it so
// that an online habbo keeps its session (plans/server decision 0048).
type Session = habbo.Session

// ConcurrentLogin tells a session that its habbo logged in on another session,
// which replaces it (plans/server decision 0029).
type ConcurrentLogin struct{}
