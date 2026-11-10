package room

// Heading is the room a habbo is on its way into, from choosing it until it comes in, and whether the room's door let
// it through. It lives only in memory, as the doorbell does (plans/server decision 0069).
type Heading struct {
	Ref      Ref
	Admitted bool
}

var headings = make(map[int64]Heading)

// Head records that the habbo avatarID is on its way into ref, which has not let it through yet.
func Head(avatarID int64, ref Ref) {
	mu.Lock()
	defer mu.Unlock()
	headings[avatarID] = Heading{Ref: ref}
}

// Admit lets the habbo avatarID through the door of ref, and reports whether it did: only while the habbo is on its
// way into ref, so that an answer that comes late never lets it into a room it no longer heads for.
func Admit(avatarID int64, ref Ref) bool {
	mu.Lock()
	defer mu.Unlock()
	h, ok := headings[avatarID]
	if !ok || h.Ref != ref {
		return false
	}
	headings[avatarID] = Heading{Ref: ref, Admitted: true}
	return true
}

// HeadingOf returns the room the habbo avatarID is on its way into.
func HeadingOf(avatarID int64) (Heading, bool) {
	mu.Lock()
	defer mu.Unlock()
	h, ok := headings[avatarID]
	return h, ok
}

// ClearHeading forgets where the habbo avatarID was heading, and returns it.
func ClearHeading(avatarID int64) (Heading, bool) {
	mu.Lock()
	defer mu.Unlock()
	h, ok := headings[avatarID]
	delete(headings, avatarID)
	return h, ok
}
