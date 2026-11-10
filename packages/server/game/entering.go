package game

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"slices"
	"strings"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
	"github.com/kronothepenguin/project-reborn/packages/virtual/model"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
)

// Admission is what a room's door answers a habbo.
type Admission int

const (
	// Admitted lets the habbo in.
	Admitted Admission = iota
	// Chosen is a habbo room the habbo heads for, whose door answers TryFlat.
	Chosen
	// Ringing keeps the habbo waiting at the doorbell.
	Ringing
	// WrongPassword is a password that does not match the room's.
	WrongPassword
	// Banned is a habbo banned from the room.
	Banned
	// Full is a room that holds as many habbos as it takes.
	Full
	// NoAnswer is a doorbell that nobody in the room can answer.
	NoAnswer
	// NoRoom is a room that does not exist, or one the habbo is not on its way into.
	NoRoom
)

// Visitor is a habbo in a room: who it is, and where it stands.
type Visitor struct {
	Habbo    habbo.Habbo
	Occupant room.Occupant
}

// RoomEntered tells the habbos in a room that a habbo came in.
type RoomEntered struct{ Visitor Visitor }

// RoomLeft tells the habbos in a room that the habbo of that index left.
type RoomLeft struct{ Index int }

// DoorbellRang tells the habbos with rights in a room that a habbo rings its doorbell.
type DoorbellRang struct{ Name string }

// DoorbellAnswered tells the habbos with rights in a room that the ringer name was let in or turned away, or went
// away, so that their doorbells drop it.
type DoorbellAnswered struct {
	Name  string
	LetIn bool
}

// LetIn tells a ringer that the doorbell let it in.
type LetIn struct{}

// TurnedAway tells a ringer that nobody let it in.
type TurnedAway struct{}

// Kicked tells a habbo that it was sent out of its room.
type Kicked struct{}

// FlatEntry is what a habbo learns as it goes into a habbo room: the room's model, and whether it controls the room
// as its owner or with rights.
type FlatEntry struct {
	Model  string
	Owner  bool
	Rights bool
}

// ChooseRoom heads the habbo for ref, out of the room it is in or rings (#room_directory). A public room's door is
// open: the habbo is admitted, and gets the room's model, unless the room is full and the habbo holds no
// fuse_enter_full_rooms. A habbo room is Chosen, and its door answers TryFlat.
func ChooseRoom(ctx context.Context, db *sql.DB, viewer habbo.Habbo, ref room.Ref) (Admission, store.RoomModel, error) {
	LeaveRoom(viewer.ID, viewer.Session)
	if !ref.Public {
		if _, err := store.New(db).GetRoom(ctx, ref.ID); store.IsNotFound(err) {
			return NoRoom, store.RoomModel{}, nil
		} else if err != nil {
			return 0, store.RoomModel{}, fmt.Errorf("game: choose room: %w", err)
		}
		room.Head(viewer.ID, ref)
		return Chosen, store.RoomModel{}, nil
	}
	p, ok := room.Public(ref.ID)
	if !ok {
		return NoRoom, store.RoomModel{}, nil
	}
	m, ok := model.ByID(p.RoomModelID)
	if !ok {
		return 0, store.RoomModel{}, fmt.Errorf("game: choose room: the public room %d is on the model %d, which is not loaded", p.ID, p.RoomModelID)
	}
	if full(viewer, ref, int(p.MaxVisitors)) {
		return Full, store.RoomModel{}, nil
	}
	room.Head(viewer.ID, ref)
	room.Admit(viewer.ID, ref)
	return Admitted, m, nil
}

// TryFlat answers the habbo at the door of the habbo room flatID, which it chose (TRYFLAT). A full room turns it away
// unless it holds fuse_enter_full_rooms. Its owner and the holders of fuse_enter_locked_rooms pass any door and any
// ban, as Holo had it; anyone else banned is turned away, a password door compares the password with the room's hash
// (plans/server decision 0062), and a closed door rings the doorbell of the habbos with rights in the room. A room
// that is not loaded, or holds nobody who may answer, turns the ringer away at once, as Holo did when nobody was in.
func TryFlat(ctx context.Context, db *sql.DB, viewer habbo.Habbo, flatID int64, password string) (Admission, error) {
	ref := room.Ref{ID: flatID}
	if h, ok := room.HeadingOf(viewer.ID); !ok || h.Ref != ref {
		return NoRoom, nil
	} else if h.Admitted {
		return Admitted, nil
	}
	r, err := store.New(db).GetRoom(ctx, flatID)
	if store.IsNotFound(err) {
		room.ClearHeading(viewer.ID)
		return NoRoom, nil
	}
	if err != nil {
		return 0, fmt.Errorf("game: try flat: %w", err)
	}
	a, err := door(ctx, db, viewer, ref, r, password)
	if err != nil {
		return 0, fmt.Errorf("game: try flat: %w", err)
	}
	switch a {
	case Admitted:
		room.Admit(viewer.ID, ref)
	case Ringing:
	default:
		room.ClearHeading(viewer.ID)
	}
	return a, nil
}

func door(ctx context.Context, db *sql.DB, viewer habbo.Habbo, ref room.Ref, r store.GetRoomRow, password string) (Admission, error) {
	if full(viewer, ref, int(r.MaxVisitors)) {
		return Full, nil
	}
	if r.OwnerAvatarID == viewer.ID || hasFuse(viewer, auth.FuseEnterLockedRooms) {
		return Admitted, nil
	}
	banned, err := isBanned(ctx, db, ref, viewer.ID)
	if err != nil {
		return 0, err
	}
	if banned {
		return Banned, nil
	}
	switch r.Door {
	case "password":
		if !r.PasswordHash.Valid {
			return WrongPassword, nil
		}
		ok, err := auth.VerifyPassword(r.PasswordHash.String, password)
		if err != nil {
			return 0, err
		}
		if !ok {
			return WrongPassword, nil
		}
	case "closed":
		return ring(viewer, ref), nil
	}
	return Admitted, nil
}

func isBanned(ctx context.Context, db *sql.DB, ref room.Ref, avatarID int64) (bool, error) {
	now := time.Now().UTC()
	if r, ok := room.Loaded(ref); ok {
		_, banned := r.BanEnd(avatarID, now)
		return banned, nil
	}
	_, err := store.New(db).GetRoomBanEnd(ctx, store.GetRoomBanEndParams{RoomID: ref.ID, AvatarID: avatarID, Now: now})
	if store.IsNotFound(err) {
		return false, nil
	}
	return err == nil, err
}

func ring(viewer habbo.Habbo, ref room.Ref) Admission {
	r, ok := room.Loaded(ref)
	if !ok {
		return NoAnswer
	}
	controllers := controllersIn(r)
	if len(controllers) == 0 {
		return NoAnswer
	}
	if !r.Join(room.Doorbell, room.Waiting{AvatarID: viewer.ID, Session: viewer.Session}) {
		// The habbo rings already, or the room unloaded meanwhile.
		if slices.ContainsFunc(r.Waiting(room.Doorbell), func(w room.Waiting) bool { return w.AvatarID == viewer.ID }) {
			return Ringing
		}
		return NoAnswer
	}
	notify(controllers, DoorbellRang{Name: viewer.Name})
	return Ringing
}

// AnswerDoorbell lets in or turns away the habbo name, who rings the doorbell of the room the viewer is in, when the
// viewer may answer it (LETUSERIN). The habbos with rights in the room learn the answer.
func AnswerDoorbell(viewer habbo.Habbo, name string, letIn bool) {
	r, ok := room.In(viewer.ID)
	if !ok || !controls(r, viewer) {
		return
	}
	for _, w := range r.Waiting(room.Doorbell) {
		ringer, ok := habbo.Get(w.AvatarID)
		if !ok || !strings.EqualFold(ringer.Name, name) {
			continue
		}
		if _, ok := r.Remove(room.Doorbell, w.AvatarID); !ok {
			return
		}
		if letIn && room.Admit(w.AvatarID, r.Ref()) {
			w.Session.Notify(LetIn{})
		} else {
			letIn = false
			clearHeadingFor(w.AvatarID, r.Ref())
			w.Session.Notify(TurnedAway{})
		}
		notify(controllersIn(r), DoorbellAnswered{Name: ringer.Name, LetIn: letIn})
		return
	}
}

// GoToFlat takes the habbo into the habbo room flatID, whose door let it through (GOTOFLAT), and reports false
// otherwise. The holders of fuse_any_room_controller control every room as its owner, as Holo had it.
func GoToFlat(ctx context.Context, db *sql.DB, viewer habbo.Habbo, flatID int64) (FlatEntry, bool, error) {
	ref := room.Ref{ID: flatID}
	if h, ok := room.HeadingOf(viewer.ID); !ok || h.Ref != ref || !h.Admitted {
		return FlatEntry{}, false, nil
	}
	q := store.New(db)
	r, err := q.GetRoom(ctx, flatID)
	if store.IsNotFound(err) {
		return FlatEntry{}, false, nil
	}
	if err != nil {
		return FlatEntry{}, false, fmt.Errorf("game: go to flat: %w", err)
	}
	m, ok := model.ByID(r.RoomModelID)
	if !ok {
		return FlatEntry{}, false, fmt.Errorf("game: go to flat: the room %d is on the model %d, which is not loaded", r.ID, r.RoomModelID)
	}
	e := FlatEntry{Model: m.Name, Owner: r.OwnerAvatarID == viewer.ID || hasFuse(viewer, auth.FuseAnyRoomController)}
	switch loaded, ok := room.Loaded(ref); {
	case e.Owner:
		e.Rights = true
	case ok:
		e.Rights = loaded.HasRights(viewer.ID)
	default:
		if e.Rights, err = q.HasRoomRights(ctx, store.HasRoomRightsParams{RoomID: flatID, AvatarID: viewer.ID}); err != nil {
			return FlatEntry{}, false, fmt.Errorf("game: go to flat: %w", err)
		}
	}
	return e, true, nil
}

// Arrival returns the room the habbo is in, or is on its way into through a door that let it through, with its
// model: its height map and its public furni. It reports false for a habbo going nowhere.
func Arrival(ctx context.Context, db *sql.DB, viewer habbo.Habbo) (room.Ref, store.RoomModel, bool, error) {
	if r, ok := room.In(viewer.ID); ok {
		return r.Ref(), r.Model(), true, nil
	}
	h, ok := room.HeadingOf(viewer.ID)
	if !ok || !h.Admitted {
		return room.Ref{}, store.RoomModel{}, false, nil
	}
	if r, ok := room.Loaded(h.Ref); ok {
		return h.Ref, r.Model(), true, nil
	}
	var modelID int64
	if h.Ref.Public {
		p, ok := room.Public(h.Ref.ID)
		if !ok {
			return room.Ref{}, store.RoomModel{}, false, nil
		}
		modelID = p.RoomModelID
	} else {
		r, err := store.New(db).GetRoom(ctx, h.Ref.ID)
		if store.IsNotFound(err) {
			return room.Ref{}, store.RoomModel{}, false, nil
		}
		if err != nil {
			return room.Ref{}, store.RoomModel{}, false, fmt.Errorf("game: arrival: %w", err)
		}
		modelID = r.RoomModelID
	}
	m, ok := model.ByID(modelID)
	if !ok {
		return room.Ref{}, store.RoomModel{}, false, fmt.Errorf("game: arrival: the model %d is not loaded", modelID)
	}
	return h.Ref, m, true, nil
}

// Visitors returns who is in the room Arrival names, by index, and reports false for a habbo going nowhere.
func Visitors(ctx context.Context, db *sql.DB, viewer habbo.Habbo) ([]Visitor, bool, error) {
	ref, _, ok, err := Arrival(ctx, db, viewer)
	if err != nil || !ok {
		return nil, false, err
	}
	r, ok := room.Loaded(ref)
	if !ok {
		return nil, true, nil
	}
	return visitorsOf(r), true, nil
}

// PublicRoomVisitors returns the names of the habbos in the public room id, by index, for the navigator's list of
// who is in it (GETSPACENODEUSERS), as Holo listed them.
func PublicRoomVisitors(id int64) []string {
	r, ok := room.Loaded(room.Ref{Public: true, ID: id})
	if !ok {
		return nil
	}
	var names []string
	for _, v := range visitorsOf(r) {
		names = append(names, v.Habbo.Name)
	}
	return names
}

func visitorsOf(r *room.Room) []Visitor {
	var all []Visitor
	for _, o := range r.Occupants() {
		if h, ok := habbo.Get(o.AvatarID); ok {
			all = append(all, Visitor{Habbo: h, Occupant: o})
		}
	}
	return all
}

// EnterRoom brings the habbo into the room whose door let it through, once its client has built the room (G_STAT),
// as Holo did, and returns everyone in it, the habbo too, by index. The habbo that loads the room starts its clock
// (plans/server decision 0072). The others see it come. The room is checked
// again: one that filled meanwhile turns it away, Full, unless it holds fuse_enter_full_rooms. In a habbo room, its
// owner gets the status flatctrl useradmin, and a habbo with rights flatctrl with no level, as flatControl says.
func EnterRoom(ctx context.Context, db *sql.DB, viewer habbo.Habbo) ([]Visitor, Admission, error) {
	h, ok := room.HeadingOf(viewer.ID)
	if !ok || !h.Admitted {
		return nil, NoRoom, nil
	}
	limit, err := limitFor(ctx, db, viewer, h.Ref)
	if err != nil {
		return nil, 0, fmt.Errorf("game: enter room: %w", err)
	}
	r, _, loaded, err := room.Enter(ctx, db, h.Ref, viewer.ID, viewer.Session, limit)
	clearHeadingFor(viewer.ID, h.Ref)
	switch {
	case errors.Is(err, room.ErrFull):
		return nil, Full, nil
	case errors.Is(err, room.ErrNoRoom):
		return nil, NoRoom, nil
	case err != nil:
		return nil, 0, fmt.Errorf("game: enter room: %w", err)
	}
	if loaded {
		startClock(r)
	}
	if control, ok := flatControl(r, viewer); ok {
		r.Update(viewer.ID, func(o *room.Occupant) {
			o.Statuses = setStatus(o.Statuses, room.Status{Action: "flatctrl", Parameters: control})
		})
	}
	visitors := visitorsOf(r)
	i := slices.IndexFunc(visitors, func(v Visitor) bool { return v.Habbo.ID == viewer.ID })
	if i < 0 {
		// The habbo logged out meanwhile.
		return nil, NoRoom, nil
	}
	for _, other := range visitors {
		if other.Habbo.ID != viewer.ID {
			other.Occupant.Session.Notify(RoomEntered{Visitor: visitors[i]})
		}
	}
	return visitors, Admitted, nil
}

// flatControl returns the level of the habbo's flatctrl status in a habbo room: useradmin for its owners, and none for a
// habbo with rights, which the client reads as furniture, as its Human class does with an empty level. Holo's
// onlyfurniture is another client's.
func flatControl(r *room.Room, viewer habbo.Habbo) (string, bool) {
	switch {
	case r.Ref().Public:
		return "", false
	case owns(r, viewer):
		return "useradmin", true
	case r.HasRights(viewer.ID):
		return "", true
	}
	return "", false
}

func limitFor(ctx context.Context, db *sql.DB, viewer habbo.Habbo, ref room.Ref) (int, error) {
	if hasFuse(viewer, auth.FuseEnterFullRooms) {
		return 0, nil
	}
	if ref.Public {
		p, _ := room.Public(ref.ID)
		return int(p.MaxVisitors), nil
	}
	r, err := store.New(db).GetRoom(ctx, ref.ID)
	if store.IsNotFound(err) {
		return 0, nil
	}
	return int(r.MaxVisitors), err
}

// LeaveRoom takes the habbo avatarID, whom s plays, out of the room it is in (QUIT), ending the event it hosts there
// (plans/server decision 0081), and away from the doorbell it rings, whose answerers drop it. The others in the room see it go. When it was the last one in, the room unloads
// (plans/server decision 0071), and those still ringing are turned away.
func LeaveRoom(avatarID int64, s Session) {
	if h, ok := room.ClearHeading(avatarID); ok && !h.Admitted {
		if r, ok := room.Loaded(h.Ref); ok {
			if _, ok := r.Remove(room.Doorbell, avatarID); ok {
				if ringer, ok := habbo.Get(avatarID); ok {
					notify(controllersIn(r), DoorbellAnswered{Name: ringer.Name})
				}
			}
		}
	}
	if r, ok := room.In(avatarID); ok {
		endEventOf(r, avatarID)
	}
	left, ok := room.Leave(avatarID, s)
	if !ok {
		return
	}
	for _, o := range left.Room.Occupants() {
		o.Session.Notify(RoomLeft{Index: left.Occupant.Index})
	}
	if left.Unloaded {
		for _, w := range left.Waiting[room.Doorbell] {
			clearHeadingFor(w.AvatarID, left.Room.Ref())
			w.Session.Notify(TurnedAway{})
		}
	}
}

// emptyRoom sends every habbo in a room out of it, as Holo did when its owner deleted it.
func emptyRoom(ref room.Ref) {
	r, ok := room.Loaded(ref)
	if !ok {
		return
	}
	for _, o := range r.Occupants() {
		o.Session.Notify(Kicked{})
		LeaveRoom(o.AvatarID, o.Session)
	}
}

func clearHeadingFor(avatarID int64, ref room.Ref) {
	if h, ok := room.HeadingOf(avatarID); ok && h.Ref == ref {
		room.ClearHeading(avatarID)
	}
}

func full(viewer habbo.Habbo, ref room.Ref, most int) bool {
	return room.Visitors(ref) >= most && !hasFuse(viewer, auth.FuseEnterFullRooms)
}

// owns reports whether the habbo controls the room as its owner: the owner, and the holders of
// fuse_any_room_controller.
func owns(r *room.Room, h habbo.Habbo) bool {
	return r.Owner() == h.ID || hasFuse(h, auth.FuseAnyRoomController)
}

// controls reports whether the habbo may answer the room's doorbell: its owners and the habbos with rights in it.
func controls(r *room.Room, h habbo.Habbo) bool {
	return !r.Ref().Public && (owns(r, h) || r.HasRights(h.ID))
}

func controllersIn(r *room.Room) []room.Occupant {
	var all []room.Occupant
	for _, o := range r.Occupants() {
		if h, ok := habbo.Get(o.AvatarID); ok && controls(r, h) {
			all = append(all, o)
		}
	}
	return all
}

func notify(occupants []room.Occupant, event any) {
	for _, o := range occupants {
		o.Session.Notify(event)
	}
}

func hasFuse(h habbo.Habbo, f auth.Fuse) bool {
	return slices.Contains(h.Fuses, string(f))
}
