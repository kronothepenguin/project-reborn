package room

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"slices"
	"sync"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
	"github.com/kronothepenguin/project-reborn/packages/virtual/model"
)

var (
	// ErrNoRoom is a room that does not exist.
	ErrNoRoom = errors.New("room: no such room")
	// ErrInRoom is a habbo who is in a room already.
	ErrInRoom = errors.New("room: the habbo is in a room already")
	// ErrFull is a room that holds as many habbos as it takes.
	ErrFull = errors.New("room: the room is full")
)

// Status is one of a habbo's actions in a room, such as sit or dance, as 34 sends it. A status with an end, such as
// talk or wave, lasts until the room's clock reaches it.
type Status struct {
	Action     string
	Parameters string
	Until      time.Time
}

// Occupant is a habbo in a loaded room.
type Occupant struct {
	AvatarID int64
	Session  habbo.Session
	// Index names the habbo to the room's clients: the smallest number nobody else in the room holds, from 0, as Holo
	// gave it.
	Index         int
	X, Y          int
	Height        float64
	HeadDirection int
	BodyDirection int
	// Statuses are the habbo's actions, in the order they were set.
	Statuses []Status
	// Walking reports whether the habbo walks to GoalX, GoalY, a step on each tick of the room's clock (plans/server
	// decisions 0065 and 0072).
	Walking      bool
	GoalX, GoalY int
	// Changed asks the room's clock to send the habbo's status on its next tick.
	Changed bool
	// Typing reports whether the habbo types a line.
	Typing bool
	// Leaving reports whether the habbo walks out of the room, kicked or banned, and may walk nowhere else
	// (plans/server decision 0079).
	Leaving bool
}

func (o Occupant) clone() Occupant {
	o.Statuses = slices.Clone(o.Statuses)
	return o
}

// Waiting is a habbo at a room's doorbell, in its queues or among its spectators. Club tells a club member, who comes
// first in a queue (plans/server decision 0088).
type Waiting struct {
	AvatarID int64
	Session  habbo.Session
	Club     bool
}

// Line is one of the ways a habbo waits on a room.
type Line int

// The lines: at the doorbell, in the queue of a full room, among the spectators, and in the spectators' queue.
const (
	Doorbell Line = iota
	Queue
	Spectators
	SpectatorQueue
	lines
)

// Room is a loaded room (plans/server decisions 0009, 0060 and 0069). Its methods may be called from several
// goroutines at once and return copies. Once the room unloads, its methods change nothing and report false.
type Room struct {
	ref   Ref
	owner int64
	model store.RoomModel
	// bare is the model's floor, without the room's furni.
	bare Floor
	done chan struct{}
	// furnishing lets one change to the room's furni run at a time.
	furnishing sync.Mutex

	mu       sync.Mutex
	unloaded bool
	// furni is what stands in the room, by id, and floor the model's floor with it on.
	furni     map[int64]Furni
	floor     Floor
	max       int
	occupants map[int64]Occupant
	rights    map[int64]bool
	bans      map[int64]time.Time
	waiting   [lines][]Waiting
	event     *Event
	// reserved are the habbos a queue let in, on their way: their places count as taken until they come in or go.
	reserved map[int64]bool
}

var (
	mu    sync.Mutex
	rooms = make(map[Ref]*Room)
	in    = make(map[int64]*Room)
)

// Enter puts the habbo avatarID, whom s plays, in the room at its door, and returns the room and the habbo's place in
// it. A room that is not loaded loads first, its floor from its model and a habbo room's rights and bans from db, and
// loaded reports whether this entry loaded it. A habbo is in one room at most, so Enter refuses a habbo who is in a
// room (ErrInRoom), and a room that holds limit habbos or more (ErrFull), unless limit is 0.
func Enter(ctx context.Context, db *sql.DB, ref Ref, avatarID int64, s habbo.Session, limit int) (r *Room, o Occupant, loaded bool, err error) {
	var fresh *Room
	for {
		mu.Lock()
		if _, ok := in[avatarID]; ok {
			mu.Unlock()
			return nil, Occupant{}, false, ErrInRoom
		}
		var ok bool
		if r, ok = rooms[ref]; !ok {
			r = fresh
		}
		if r != nil {
			if o, err = r.add(avatarID, s, limit); err != nil {
				mu.Unlock()
				return nil, Occupant{}, false, err
			}
			if !ok {
				rooms[ref], loaded = r, true
			}
			in[avatarID] = r
			mu.Unlock()
			return r, o, loaded, nil
		}
		mu.Unlock()
		if fresh, err = load(ctx, db, ref); err != nil {
			return nil, Occupant{}, false, err
		}
	}
}

func load(ctx context.Context, db *sql.DB, ref Ref) (*Room, error) {
	r := &Room{
		ref:       ref,
		done:      make(chan struct{}),
		occupants: make(map[int64]Occupant),
		furni:     make(map[int64]Furni),
		rights:    make(map[int64]bool),
		bans:      make(map[int64]time.Time),
		reserved:  make(map[int64]bool),
	}
	var modelID int64
	if ref.Public {
		p, ok := Public(ref.ID)
		if !ok {
			return nil, ErrNoRoom
		}
		modelID, r.max = p.RoomModelID, int(p.MaxVisitors)
	} else {
		q := store.New(db)
		row, err := q.GetRoom(ctx, ref.ID)
		if store.IsNotFound(err) {
			return nil, ErrNoRoom
		}
		if err != nil {
			return nil, fmt.Errorf("room: %w", err)
		}
		modelID, r.owner, r.max = row.RoomModelID, row.OwnerAvatarID, int(row.MaxVisitors)
		rights, err := q.ListRoomRights(ctx, ref.ID)
		if err != nil {
			return nil, fmt.Errorf("room: %w", err)
		}
		for _, id := range rights {
			r.rights[id] = true
		}
		bans, err := q.ListRoomBans(ctx, store.ListRoomBansParams{RoomID: ref.ID, Now: time.Now().UTC()})
		if err != nil {
			return nil, fmt.Errorf("room: %w", err)
		}
		for _, b := range bans {
			r.bans[b.AvatarID] = b.ExpiresAt
		}
		rows, err := q.ListRoomFurni(ctx, ref.ID)
		if err != nil {
			return nil, fmt.Errorf("room: %w", err)
		}
		for _, item := range WithDefinitions(rows) {
			r.furni[item.ID] = item
		}
	}
	m, ok := model.ByID(modelID)
	if !ok {
		return nil, fmt.Errorf("room: %+v is on the model %d, which is not loaded", ref, modelID)
	}
	floor, err := ParseFloor(m)
	if err != nil {
		return nil, fmt.Errorf("room: %w", err)
	}
	r.model, r.bare = m, floor
	r.floor = floor.with(sortedFurni(r.furni))
	return r, nil
}

func (r *Room) add(avatarID int64, s habbo.Session, limit int) (Occupant, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	if limit > 0 && len(r.occupants) >= limit {
		return Occupant{}, ErrFull
	}
	used := make(map[int]bool, len(r.occupants))
	for _, o := range r.occupants {
		used[o.Index] = true
	}
	index := 0
	for used[index] {
		index++
	}
	direction := int(r.model.DoorDirection)
	o := Occupant{
		AvatarID:      avatarID,
		Session:       s,
		Index:         index,
		X:             int(r.model.DoorX),
		Y:             int(r.model.DoorY),
		Height:        float64(r.model.DoorHeight),
		HeadDirection: direction,
		BodyDirection: direction,
	}
	r.occupants[avatarID] = o
	delete(r.reserved, avatarID)
	return o.clone(), nil
}

// Left is what Leave did: the room the habbo left and its place there. When the habbo was the last one in the room,
// the room unloaded, and Waiting holds those who waited on it, by line, to be told.
type Left struct {
	Room     *Room
	Occupant Occupant
	Unloaded bool
	Waiting  [lines][]Waiting
}

// Leave takes the habbo avatarID out of its room while s plays it, and unloads the room when the habbo was the last
// one in it (plans/server decision 0071). It reports false when the habbo is in no room, or another session plays it.
func Leave(avatarID int64, s habbo.Session) (Left, bool) {
	mu.Lock()
	defer mu.Unlock()
	r, ok := in[avatarID]
	if !ok {
		return Left{}, false
	}
	r.mu.Lock()
	o := r.occupants[avatarID]
	if o.Session != s {
		r.mu.Unlock()
		return Left{}, false
	}
	delete(r.occupants, avatarID)
	delete(in, avatarID)
	left := Left{Room: r, Occupant: o.clone()}
	if len(r.occupants) == 0 {
		// Under both locks, so that nobody joins a line the room no longer has, and nobody enters the room it was.
		left.Unloaded, left.Waiting = true, r.waiting
		r.waiting = [lines][]Waiting{}
		r.unloaded = true
		close(r.done)
		delete(rooms, r.ref)
	}
	r.mu.Unlock()
	return left, true
}

// Loaded returns the room ref while it is loaded.
func Loaded(ref Ref) (*Room, bool) {
	mu.Lock()
	defer mu.Unlock()
	r, ok := rooms[ref]
	return r, ok
}

// In returns the room the habbo avatarID is in.
func In(avatarID int64) (*Room, bool) {
	mu.Lock()
	defer mu.Unlock()
	r, ok := in[avatarID]
	return r, ok
}

// Visitors returns how many habbos are in the room: none when it is not loaded.
func Visitors(ref Ref) int {
	r, ok := Loaded(ref)
	if !ok {
		return 0
	}
	r.mu.Lock()
	defer r.mu.Unlock()
	return len(r.occupants)
}

// Ref names the room.
func (r *Room) Ref() Ref { return r.ref }

// Owner returns the avatar id of a habbo room's owner, as the room loaded, and 0 for a public room.
func (r *Room) Owner() int64 { return r.owner }

// Model returns the room's model.
func (r *Room) Model() store.RoomModel { return r.model }

// Floor returns the room's floor as it is now, with its furni on.
func (r *Room) Floor() Floor {
	r.mu.Lock()
	defer r.mu.Unlock()
	return r.floor
}

// Done is closed when the room unloads.
func (r *Room) Done() <-chan struct{} { return r.done }

// Occupants returns the habbos in the room, by index.
func (r *Room) Occupants() []Occupant {
	r.mu.Lock()
	defer r.mu.Unlock()
	all := make([]Occupant, 0, len(r.occupants))
	for _, o := range r.occupants {
		all = append(all, o.clone())
	}
	slices.SortFunc(all, func(a, b Occupant) int { return a.Index - b.Index })
	return all
}

// Occupant returns the habbo avatarID's place in the room.
func (r *Room) Occupant(avatarID int64) (Occupant, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()
	o, ok := r.occupants[avatarID]
	return o.clone(), ok
}

// Update runs change on the habbo avatarID's place in the room, and reports whether it did. change runs under the
// room's lock, so it must not call a session or the database. The habbo's id, session and index stay as they are.
func (r *Room) Update(avatarID int64, change func(o *Occupant)) bool {
	r.mu.Lock()
	defer r.mu.Unlock()
	o, ok := r.occupants[avatarID]
	if !ok || r.unloaded {
		return false
	}
	changed := o.clone()
	change(&changed)
	changed.AvatarID, changed.Session, changed.Index = o.AvatarID, o.Session, o.Index
	r.occupants[avatarID] = changed
	return true
}

// Tick runs step on every habbo in the room at once, by index, under the room's lock, as the room's clock does, and
// returns what step returns: the statuses to send. step must not call a session or the database; its changes to a
// habbo's id, session or index are undone. An unloaded room runs nothing.
func (r *Room) Tick(step func(all []*Occupant) []Occupant) []Occupant {
	r.mu.Lock()
	defer r.mu.Unlock()
	if r.unloaded {
		return nil
	}
	all := make([]*Occupant, 0, len(r.occupants))
	for _, o := range r.occupants {
		c := o.clone()
		all = append(all, &c)
	}
	slices.SortFunc(all, func(a, b *Occupant) int { return a.Index - b.Index })
	held := make([]Occupant, len(all))
	for i, o := range all {
		held[i] = *o
	}
	sent := step(all)
	for i, o := range all {
		o.AvatarID, o.Session, o.Index = held[i].AvatarID, held[i].Session, held[i].Index
		r.occupants[o.AvatarID] = *o
	}
	for i := range sent {
		sent[i] = sent[i].clone()
	}
	return sent
}

// HasRights reports whether the habbo avatarID has rights in the room, as the store had them when the room loaded and
// as SetRights changed them since.
func (r *Room) HasRights(avatarID int64) bool {
	r.mu.Lock()
	defer r.mu.Unlock()
	return r.rights[avatarID]
}

// SetRights gives or takes the habbo avatarID's rights in the room's copy, once the store has the change (plans/server
// decision 0010), and reports whether the room is still loaded.
func (r *Room) SetRights(avatarID int64, on bool) bool {
	r.mu.Lock()
	defer r.mu.Unlock()
	if r.unloaded {
		return false
	}
	if on {
		r.rights[avatarID] = true
	} else {
		delete(r.rights, avatarID)
	}
	return true
}

// BanEnd returns when the habbo avatarID's ban from the room ends, while it holds at the time at.
func (r *Room) BanEnd(avatarID int64, at time.Time) (time.Time, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()
	end, ok := r.bans[avatarID]
	if !ok || !end.After(at) {
		return time.Time{}, false
	}
	return end, true
}

// Ban keeps the habbo avatarID out of the room until end in the room's copy, once the store has the ban, and reports
// whether the room is still loaded.
func (r *Room) Ban(avatarID int64, end time.Time) bool {
	r.mu.Lock()
	defer r.mu.Unlock()
	if r.unloaded {
		return false
	}
	r.bans[avatarID] = end
	return true
}

// Join puts w at the end of the line l, and reports whether it did: not when w's habbo is in that line already, nor
// once the room has unloaded.
func (r *Room) Join(l Line, w Waiting) bool {
	r.mu.Lock()
	defer r.mu.Unlock()
	if r.unloaded || slices.ContainsFunc(r.waiting[l], func(x Waiting) bool { return x.AvatarID == w.AvatarID }) {
		return false
	}
	r.waiting[l] = append(r.waiting[l], w)
	return true
}

// Remove takes the habbo avatarID out of the line l, and returns how it waited.
func (r *Room) Remove(l Line, avatarID int64) (Waiting, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()
	i := slices.IndexFunc(r.waiting[l], func(x Waiting) bool { return x.AvatarID == avatarID })
	if i < 0 {
		return Waiting{}, false
	}
	w := r.waiting[l][i]
	r.waiting[l] = slices.Delete(r.waiting[l], i, i+1)
	return w, true
}

// Waiting returns the line l, first come first.
func (r *Room) Waiting(l Line) []Waiting {
	r.mu.Lock()
	defer r.mu.Unlock()
	return slices.Clone(r.waiting[l])
}

// LineOf returns the line the habbo avatarID waits in.
func (r *Room) LineOf(avatarID int64) (Line, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()
	for l := range lines {
		if slices.ContainsFunc(r.waiting[l], func(w Waiting) bool { return w.AvatarID == avatarID }) {
			return Line(l), true
		}
	}
	return 0, false
}

// Reserve keeps a place for the habbo avatarID, which a queue let in, until it comes in or Unreserve frees it, and
// reports whether the room is still loaded.
func (r *Room) Reserve(avatarID int64) bool {
	r.mu.Lock()
	defer r.mu.Unlock()
	if r.unloaded {
		return false
	}
	r.reserved[avatarID] = true
	return true
}

// Unreserve frees the place kept for the habbo avatarID, and reports whether one was kept.
func (r *Room) Unreserve(avatarID int64) bool {
	r.mu.Lock()
	defer r.mu.Unlock()
	kept := r.reserved[avatarID]
	delete(r.reserved, avatarID)
	return kept
}

// Reserved reports whether a place is kept for the habbo avatarID.
func (r *Room) Reserved(avatarID int64) bool {
	r.mu.Lock()
	defer r.mu.Unlock()
	return r.reserved[avatarID]
}

// Max returns how many habbos the room takes, as it loaded or as SetMax changed it.
func (r *Room) Max() int {
	r.mu.Lock()
	defer r.mu.Unlock()
	return r.max
}

// SetMax changes how many habbos the room's copy takes, once the store has the change.
func (r *Room) SetMax(n int) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.max = n
}

// Taken returns how many places the room's habbos and those on their way from its queue take.
func (r *Room) Taken() int {
	r.mu.Lock()
	defer r.mu.Unlock()
	return len(r.occupants) + len(r.reserved)
}
