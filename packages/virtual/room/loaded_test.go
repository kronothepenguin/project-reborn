package room

import (
	"database/sql"
	"errors"
	"path/filepath"
	"slices"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/model"
)

type session struct{ name string }

func (*session) Notify(any) {}

func openHotel(t *testing.T) *sql.DB {
	t.Helper()
	db, err := store.Open(filepath.Join(t.TempDir(), "hotel.db"))
	if err != nil {
		t.Fatalf("store.Open: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	if err := Load(t.Context(), db); err != nil {
		t.Fatal(err)
	}
	if err := model.Load(t.Context(), db); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		mu.Lock()
		defer mu.Unlock()
		if len(rooms) != 0 || len(in) != 0 || len(headings) != 0 {
			t.Errorf("%d rooms, %d habbos and %d headings left", len(rooms), len(in), len(headings))
		}
		clear(rooms)
		clear(in)
		clear(headings)
	})
	return db
}

func must[T any](t *testing.T) func(T, error) T {
	return func(v T, err error) T {
		t.Helper()
		if err != nil {
			t.Fatal(err)
		}
		return v
	}
}

func newHabbo(t *testing.T, q *store.Queries, name string) int64 {
	t.Helper()
	now := time.Now().UTC()
	u := must[store.User](t)(q.CreateUser(t.Context(), store.CreateUserParams{Email: name + "@example.com", BornOn: now, CreatedIP: "127.0.0.1", CreatedAt: now, UpdatedAt: now}))
	return must[store.Avatar](t)(q.CreateAvatar(t.Context(), store.CreateAvatarParams{UserID: u.ID, Name: name, Figure: "hd-180-1", Gender: "M", CreatedAt: now, UpdatedAt: now})).ID
}

func enter(t *testing.T, ref Ref, avatarID int64, s *session) (*Room, Occupant, bool) {
	t.Helper()
	r, o, loaded, err := Enter(t.Context(), nil, ref, avatarID, s, 0)
	if err != nil {
		t.Fatalf("Enter %+v as %d: %v", ref, avatarID, err)
	}
	return r, o, loaded
}

func leave(t *testing.T, avatarID int64, s *session) Left {
	t.Helper()
	left, ok := Leave(avatarID, s)
	if !ok {
		t.Fatalf("Leave %d: not in a room", avatarID)
	}
	return left
}

// A room loads with its first habbo and unloads with its last; each habbo takes the smallest free index, at the door.
func TestARoomLoadsWithItsFirstHabboAndUnloadsWithItsLast(t *testing.T) {
	openHotel(t)
	lounge := Ref{Public: true, ID: 101}
	ann, bob, cid := &session{"Ann"}, &session{"Bob"}, &session{"Cid"}

	r, o, loaded := enter(t, lounge, 1, ann)
	if !loaded || o.Index != 0 || o.X != 2 || o.Y != 11 || o.Height != 0 || o.HeadDirection != 2 || o.BodyDirection != 2 {
		t.Errorf("Ann entered %+v, loaded %t; want index 0 at the Welcome Lounge's door, 2,11 facing 2, loading it", o, loaded)
	}
	if r.Model().Name != "newbie_lobby" {
		t.Errorf("the lounge's model is %s, want newbie_lobby", r.Model().Name)
	}
	again, o, loaded := enter(t, lounge, 2, bob)
	if loaded || again != r || o.Index != 1 || Visitors(lounge) != 2 {
		t.Errorf("Bob entered %+v, loaded %t, the same room %t, %d visitors; want index 1 in the loaded room of 2", o, loaded, again == r, Visitors(lounge))
	}
	if left := leave(t, 1, ann); left.Unloaded || left.Occupant.Index != 0 {
		t.Errorf("Ann left %+v, want her place, the room still loaded", left)
	}
	if _, o, _ = enter(t, lounge, 3, cid); o.Index != 0 {
		t.Errorf("Cid took the index %d, want Ann's 0, the smallest free", o.Index)
	}
	if got := r.Occupants(); len(got) != 2 || got[0].AvatarID != 3 || got[1].AvatarID != 2 {
		t.Errorf("occupants %+v, want Cid then Bob, by index", got)
	}
	leave(t, 2, bob)
	if left := leave(t, 3, cid); !left.Unloaded || left.Room != r {
		t.Errorf("Cid left %+v, want the room unloaded with its last habbo", left)
	}
	select {
	case <-r.Done():
	default:
		t.Error("Done is open after the room unloaded")
	}
	if _, ok := Loaded(lounge); ok || Visitors(lounge) != 0 {
		t.Errorf("the lounge is still loaded, with %d visitors", Visitors(lounge))
	}
	if next, _, loaded := enter(t, lounge, 1, ann); !loaded || next == r {
		t.Error("entering the unloaded lounge did not load it again")
	}
	leave(t, 1, ann)
}

// The public room 101 and the habbo room 101 are two rooms.
func TestAHabboIsInOneRoomAtMost(t *testing.T) {
	db := openHotel(t)
	q := store.New(db)
	owner := newHabbo(t, q, "Owner")
	flat := must[store.Room](t)(q.CreateRoom(t.Context(), store.CreateRoomParams{AvatarID: owner, RoomCategoryID: 2, RoomModelID: 1, Name: "Flat", Door: "open", ShowOwner: true, CreatedAt: time.Now().UTC()}))
	ann, other := &session{"Ann"}, &session{"Ann again"}

	lounge, _, _ := enter(t, Ref{Public: true, ID: 101}, 1, ann)
	if _, _, _, err := Enter(t.Context(), db, Ref{ID: flat.ID}, 1, ann, 0); !errors.Is(err, ErrInRoom) {
		t.Errorf("Ann entered a second room: %v", err)
	}
	if r, ok := In(1); !ok || r != lounge {
		t.Error("Ann is not in the lounge")
	}
	if _, ok := Leave(1, other); ok {
		t.Error("another session took Ann out")
	}
	leave(t, 1, ann)
	r, o, _, err := Enter(t.Context(), db, Ref{ID: flat.ID}, 1, ann, 0)
	if err != nil || r.Model().Name != "a" || o.X != 3 || o.Y != 5 {
		t.Errorf("Ann entered the flat at %+v on %s: %v; want model a's door, 3,5", o, r.Model().Name, err)
	}
	leave(t, 1, ann)
	for _, ref := range []Ref{{ID: 999999}, {Public: true, ID: 999999}} {
		if _, _, _, err := Enter(t.Context(), db, ref, 1, ann, 0); !errors.Is(err, ErrNoRoom) {
			t.Errorf("entering %+v: %v, want ErrNoRoom", ref, err)
		}
	}
}

func TestAFullRoomRefusesTheNextHabbo(t *testing.T) {
	openHotel(t)
	lounge := Ref{Public: true, ID: 101}
	s := []*session{{"Ann"}, {"Bob"}, {"Cid"}}
	for i := range 2 {
		if _, _, _, err := Enter(t.Context(), nil, lounge, int64(i+1), s[i], 2); err != nil {
			t.Fatal(err)
		}
	}
	if _, _, _, err := Enter(t.Context(), nil, lounge, 3, s[2], 2); !errors.Is(err, ErrFull) {
		t.Errorf("a third habbo in a room for 2: %v, want ErrFull", err)
	}
	if _, ok := In(3); ok {
		t.Error("the refused habbo is in the room")
	}
	if _, _, _, err := Enter(t.Context(), nil, lounge, 3, s[2], 0); err != nil {
		t.Errorf("a room without a limit refused a habbo: %v", err)
	}
	for i := range 3 {
		leave(t, int64(i+1), s[i])
	}
}

// A habbo room's rights and bans load with it (decision server/0009), and changes reach the copy until it unloads.
func TestAHabboRoomLoadsItsRightsAndBans(t *testing.T) {
	db := openHotel(t)
	q := store.New(db)
	ctx := t.Context()
	owner, helper, pest, former := newHabbo(t, q, "Owner"), newHabbo(t, q, "Helper"), newHabbo(t, q, "Pest"), newHabbo(t, q, "Former")
	now := time.Now().UTC()
	flat := must[store.Room](t)(q.CreateRoom(ctx, store.CreateRoomParams{AvatarID: owner, RoomCategoryID: 2, RoomModelID: 1, Name: "Flat", Door: "open", ShowOwner: true, CreatedAt: now}))
	if err := q.AddRoomRights(ctx, store.AddRoomRightsParams{RoomID: flat.ID, AvatarID: helper, GrantedAt: now}); err != nil {
		t.Fatal(err)
	}
	for avatar, end := range map[int64]time.Time{pest: now.Add(15 * time.Minute), former: now.Add(-time.Minute)} {
		if err := q.BanFromRoom(ctx, store.BanFromRoomParams{RoomID: flat.ID, AvatarID: avatar, ExpiresAt: end}); err != nil {
			t.Fatal(err)
		}
	}
	s := &session{"Owner"}

	r, _, _, err := Enter(ctx, db, Ref{ID: flat.ID}, owner, s, 0)
	if err != nil {
		t.Fatal(err)
	}
	if r.Owner() != owner {
		t.Errorf("the owner is %d, want %d", r.Owner(), owner)
	}
	if !r.HasRights(helper) || r.HasRights(pest) {
		t.Error("the rights did not load: Helper has them and Pest does not")
	}
	if end, ok := r.BanEnd(pest, now); !ok || !end.Equal(now.Add(15*time.Minute)) {
		t.Errorf("Pest's ban ends at %v, %t; want in 15 minutes", end, ok)
	}
	if _, ok := r.BanEnd(former, now); ok {
		t.Error("an ended ban holds")
	}
	if !r.SetRights(pest, true) || !r.HasRights(pest) || !r.SetRights(helper, false) || r.HasRights(helper) {
		t.Error("SetRights did not change the copy")
	}
	if !r.Ban(former, now.Add(time.Hour)) {
		t.Error("Ban did not change the copy")
	}
	if _, ok := r.BanEnd(former, now.Add(30*time.Minute)); !ok {
		t.Error("the new ban does not hold")
	}
	leave(t, owner, s)
	if r.SetRights(helper, true) || r.Ban(pest, now) {
		t.Error("an unloaded room took a change")
	}
}

// Those at the doorbell, in the queue and among the spectators wait in memory until the room unloads (decision
// server/0069), and are handed back then.
func TestTheLinesLastUntilTheRoomUnloads(t *testing.T) {
	openHotel(t)
	ann := &session{"Ann"}
	r, _, _ := enter(t, Ref{Public: true, ID: 101}, 1, ann)
	ringer, other, queued, watcher := Waiting{AvatarID: 2, Session: &session{"Ringer"}}, Waiting{AvatarID: 3, Session: &session{"Other"}}, Waiting{AvatarID: 4, Session: &session{"Queued"}}, Waiting{AvatarID: 5, Session: &session{"Watcher"}}

	if !r.Join(Doorbell, ringer) || !r.Join(Doorbell, other) || r.Join(Doorbell, ringer) {
		t.Error("the doorbell took the ringer twice, or refused a first ring")
	}
	if w, ok := r.Remove(Doorbell, 2); !ok || w != ringer {
		t.Errorf("removed %+v, want the ringer", w)
	}
	if _, ok := r.Remove(Doorbell, 2); ok {
		t.Error("the ringer was removed twice")
	}
	r.Join(Queue, queued)
	r.Join(Spectators, watcher)
	if got := r.Waiting(Doorbell); !slices.Equal(got, []Waiting{other}) {
		t.Errorf("the doorbell holds %+v, want the other ringer", got)
	}
	left := leave(t, 1, ann)
	if !left.Unloaded || !slices.Equal(left.Waiting[Doorbell], []Waiting{other}) || !slices.Equal(left.Waiting[Queue], []Waiting{queued}) || !slices.Equal(left.Waiting[Spectators], []Waiting{watcher}) {
		t.Errorf("left %+v, want the three lines handed back", left.Waiting)
	}
	if r.Join(Doorbell, ringer) || len(r.Waiting(Doorbell)) != 0 {
		t.Error("an unloaded room took a ring")
	}
}

// A door lets a habbo through only into the room it heads for, so that a late answer never lets it in elsewhere.
func TestAHabboIsAdmittedOnlyWhereItHeads(t *testing.T) {
	openHotel(t)
	lounge, library := Ref{Public: true, ID: 101}, Ref{Public: true, ID: 104}
	if Admit(1, lounge) {
		t.Error("a habbo heading nowhere was admitted")
	}
	Head(1, lounge)
	if h, ok := HeadingOf(1); !ok || h != (Heading{Ref: lounge}) {
		t.Errorf("heading %+v, %t; want the lounge, not admitted", h, ok)
	}
	Head(1, library)
	if Admit(1, lounge) {
		t.Error("the lounge's late answer admitted a habbo heading for the library")
	}
	if !Admit(1, library) {
		t.Error("the library did not admit the habbo heading for it")
	}
	if h, ok := ClearHeading(1); !ok || h != (Heading{Ref: library, Admitted: true}) {
		t.Errorf("cleared %+v, %t; want the library, admitted", h, ok)
	}
	if _, ok := HeadingOf(1); ok {
		t.Error("the heading is still there")
	}
}
