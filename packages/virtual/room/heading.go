package room

// Heading is the room a habbo is on its way into, from choosing it until it comes in, and whether the room's door let
// it through. It lives only in memory, as the doorbell does (decision server/0069).
type Heading struct {
	Ref      Ref
	Admitted bool
	// Teleport is the teleport the habbo comes out of, and 0 for a habbo that comes in by the door.
	Teleport int64
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

// Passage is the way a habbo opened by standing in a teleport: the teleport it comes out of, and the room that one
// stands in. It lives only in memory, as a heading does.
type Passage struct {
	Teleport int64
	Ref      Ref
}

var passages = make(map[int64]Passage)

// OpenPassage records the passage the habbo avatarID opened, in place of one it had.
func OpenPassage(avatarID int64, p Passage) {
	mu.Lock()
	defer mu.Unlock()
	passages[avatarID] = p
}

// ClosePassage forgets the passage the habbo avatarID opened, and returns it.
func ClosePassage(avatarID int64) (Passage, bool) {
	mu.Lock()
	defer mu.Unlock()
	p, ok := passages[avatarID]
	delete(passages, avatarID)
	return p, ok
}

// AdmitThrough lets the habbo avatarID into ref out of the teleport teleportID, past the room's door, and reports
// whether it did: only while the habbo is on its way into ref.
func AdmitThrough(avatarID int64, ref Ref, teleportID int64) bool {
	mu.Lock()
	defer mu.Unlock()
	h, ok := headings[avatarID]
	if !ok || h.Ref != ref {
		return false
	}
	headings[avatarID] = Heading{Ref: ref, Admitted: true, Teleport: teleportID}
	return true
}
