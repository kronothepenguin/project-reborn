package game

import (
	"context"
	"database/sql"
	"slices"

	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
)

// The targets of a full room's two lines, as 259 and ROOM_QUEUE_CHANGE name them (decision server/0090).
const (
	targetRoom       = 1
	targetSpectators = 2
)

// QueueSet is one of a full room's lines as 259 shows it to a habbo: its name and target, and how many club members
// and others would come in before the habbo (decisions server/0088 and server/0090).
type QueueSet struct {
	Name   string
	Target int
	Club   int
	Others int
}

// QueueChanged tells a habbo waiting in a full room's line its place: its own line first, then the other.
type QueueChanged struct{ Sets []QueueSet }

// QueueAdmitted tells a habbo whose turn came to go on into the room it waited for: as a spectator when Spectator.
// Model is a public room's, which 69 names.
type QueueAdmitted struct {
	Ref       room.Ref
	Model     string
	Spectator bool
}

// SpectatorsRemoved tells a spectator that the room it watches lets its spectators go, as it empties.
type SpectatorsRemoved struct{}

// joinQueue puts the habbo, heading for the full room r, at the end of its queue, club members' lines kept apart
// (decisions server/0087 and server/0088), and tells everyone waiting their places.
func joinQueue(ctx context.Context, db *sql.DB, viewer habbo.Habbo, r *room.Room) error {
	club, err := ClubStatus(ctx, db, viewer.UserID)
	if err != nil {
		return err
	}
	room.Head(viewer.ID, r.Ref())
	if !r.Join(room.Queue, room.Waiting{AvatarID: viewer.ID, Session: viewer.Session, Club: club.DaysLeft > 0}) {
		room.ClearHeading(viewer.ID)
		return nil
	}
	serveLines(ctx, db, r)
	return nil
}

// serveLines lets the queue's next habbos in while the room has places, keeping their places on their way, and the
// spectators' queue's while fewer than game.maxSpectators watch, club members first; then everyone still waiting
// learns its place (decisions server/0088 and server/0089).
func serveLines(ctx context.Context, db *sql.DB, r *room.Room) {
	ref := r.Ref()
	model := ""
	if ref.Public {
		model = r.Model().Name
	}
	for r.Max() == 0 || r.Taken() < r.Max() {
		w, ok := nextIn(r, room.Queue)
		if !ok || !r.Reserve(w.AvatarID) {
			break
		}
		r.Remove(room.Queue, w.AvatarID)
		if room.Admit(w.AvatarID, ref) {
			w.Session.Notify(QueueAdmitted{Ref: ref, Model: model})
		} else {
			r.Unreserve(w.AvatarID)
		}
	}
	for most := settings.Int(ctx, store.New(db), "game.maxSpectators"); len(r.Waiting(room.Spectators)) < most; {
		w, ok := nextIn(r, room.SpectatorQueue)
		if !ok {
			break
		}
		r.Remove(room.SpectatorQueue, w.AvatarID)
		if room.Admit(w.AvatarID, ref) && r.Join(room.Spectators, w) {
			w.Session.Notify(QueueAdmitted{Ref: ref, Model: model, Spectator: true})
		}
	}
	for _, l := range []room.Line{room.Queue, room.SpectatorQueue} {
		for _, w := range r.Waiting(l) {
			w.Session.Notify(QueueChanged{Sets: queueSets(r, w, l)})
		}
	}
}

// nextIn returns the habbo whose turn comes next in the line l: its first club member, or else its first habbo.
func nextIn(r *room.Room, l room.Line) (room.Waiting, bool) {
	line := r.Waiting(l)
	if len(line) == 0 {
		return room.Waiting{}, false
	}
	if i := slices.IndexFunc(line, func(w room.Waiting) bool { return w.Club }); i >= 0 {
		return line[i], true
	}
	return line[0], true
}

// queueSets returns the habbo's own line first, then the other, each with how many club members and others would come
// in before it: everyone ahead of it, and in the other line everyone, as if it joined its end. Club members come in
// first, so a club member has no others ahead.
func queueSets(r *room.Room, w room.Waiting, own room.Line) []QueueSet {
	set := func(l room.Line, name string, target int) QueueSet {
		s := QueueSet{Name: name, Target: target}
		for _, x := range r.Waiting(l) {
			if x.AvatarID == w.AvatarID {
				break
			}
			switch {
			case x.Club:
				s.Club++
			case !w.Club:
				s.Others++
			}
		}
		return s
	}
	roomSet, spectatorSet := set(room.Queue, "room", targetRoom), set(room.SpectatorQueue, "spectators", targetSpectators)
	if own == room.SpectatorQueue {
		return []QueueSet{spectatorSet, roomSet}
	}
	return []QueueSet{roomSet, spectatorSet}
}

// ChangeQueue moves the habbo to the line target names, the room's or the spectators' (ROOM_QUEUE_CHANGE), at its end
// (decision server/0089).
func ChangeQueue(ctx context.Context, db *sql.DB, viewer habbo.Habbo, target int) {
	to, ok := map[int]room.Line{targetRoom: room.Queue, targetSpectators: room.SpectatorQueue}[target]
	h, heading := room.HeadingOf(viewer.ID)
	if !ok || !heading {
		return
	}
	r, ok := room.Loaded(h.Ref)
	if !ok {
		return
	}
	from, ok := r.LineOf(viewer.ID)
	if !ok || from == to || (from != room.Queue && from != room.SpectatorQueue) {
		return
	}
	w, _ := r.Remove(from, viewer.ID)
	r.Join(to, w)
	serveLines(ctx, db, r)
}

// SpectatorCount returns how many watch the room the viewer watches, and how many may (GET_SPECTATOR_AMOUNT), or -1
// when it watches none, which hides the client's count.
func SpectatorCount(ctx context.Context, db *sql.DB, viewer habbo.Habbo) (count, most int) {
	most = settings.Int(ctx, store.New(db), "game.maxSpectators")
	if r, ok := watching(viewer.ID); ok {
		return len(r.Waiting(room.Spectators)), most
	}
	return -1, most
}

// watching returns the room the habbo watches as a spectator.
func watching(avatarID int64) (*room.Room, bool) {
	h, ok := room.HeadingOf(avatarID)
	if !ok {
		return nil, false
	}
	r, ok := room.Loaded(h.Ref)
	if !ok {
		return nil, false
	}
	if l, ok := r.LineOf(avatarID); ok && l == room.Spectators {
		return r, true
	}
	return nil, false
}

// audience returns the sessions of everyone who sees what happens in the room: its habbos and its spectators
// (decision server/0089).
func audience(r *room.Room) []habbo.Session {
	var all []habbo.Session
	for _, o := range r.Occupants() {
		all = append(all, o.Session)
	}
	for _, w := range r.Waiting(room.Spectators) {
		all = append(all, w.Session)
	}
	return all
}

func broadcast(r *room.Room, event any) {
	for _, s := range audience(r) {
		s.Notify(event)
	}
}
