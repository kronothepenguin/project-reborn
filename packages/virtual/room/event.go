package room

import "time"

// Event is a room event a habbo hosts in the room, which lives only in memory and ends when its host leaves
// (plans/server decisions 0011 and 0081).
type Event struct {
	HostID      int64
	Type        int
	Name        string
	Description string
	Started     time.Time
}

// Event returns the room's event.
func (r *Room) Event() (Event, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()
	if r.event == nil {
		return Event{}, false
	}
	return *r.event, true
}

// SetEvent puts e in place of the room's event, and reports whether the room is still loaded.
func (r *Room) SetEvent(e Event) bool {
	r.mu.Lock()
	defer r.mu.Unlock()
	if r.unloaded {
		return false
	}
	r.event = &e
	return true
}

// EndEvent ends the room's event, and returns it.
func (r *Room) EndEvent() (Event, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()
	if r.event == nil {
		return Event{}, false
	}
	e := *r.event
	r.event = nil
	return e, true
}

// All returns the loaded rooms.
func All() []*Room {
	mu.Lock()
	defer mu.Unlock()
	all := make([]*Room, 0, len(rooms))
	for _, r := range rooms {
		all = append(all, r)
	}
	return all
}
