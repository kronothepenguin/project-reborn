package room

import (
	"path/filepath"
	"slices"
	"sync"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

func TestThePublicRoomsLoadByIDAndCategory(t *testing.T) {
	db, err := store.Open(filepath.Join(t.TempDir(), "hotel.db"))
	if err != nil {
		t.Fatalf("store.Open: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	if err := Load(t.Context(), db); err != nil {
		t.Fatalf("Load: %v", err)
	}

	if lounge, ok := Public(101); !ok || lounge.Name != "Welcome Lounge" || lounge.Casts != "hh_room_nlobby" {
		t.Errorf("Public(101) = %+v, %t; want the Welcome Lounge", lounge, ok)
	}
	var got []int64
	for _, r := range PublicIn(5) {
		got = append(got, r.ID)
	}
	if want := []int64{102, 107, 108, 109, 110}; !slices.Equal(got, want) {
		t.Errorf("PublicIn(5) = %v, want %v", got, want)
	}
	if rooms := PublicIn(4); len(rooms) != 0 {
		t.Errorf("Guestrooms holds the public rooms %v", rooms)
	}
}

func TestVisitorsAreCountedPerRoom(t *testing.T) {
	lounge, den := Ref{Public: true, ID: 101}, Ref{ID: 101}
	t.Cleanup(func() {
		mu.Lock()
		clear(visitors)
		mu.Unlock()
	})
	Enter(lounge)
	Enter(lounge)
	Enter(den)
	if Visitors(lounge) != 2 || Visitors(den) != 1 {
		t.Errorf("visitors = %d and %d, want 2 in the public room and 1 in the habbo room of the same id", Visitors(lounge), Visitors(den))
	}
	Leave(den)
	Leave(den)
	if Visitors(den) != 0 {
		t.Errorf("visitors = %d after two leaves of one habbo, want 0", Visitors(den))
	}

	var wg sync.WaitGroup
	for range 8 {
		wg.Go(func() {
			for range 100 {
				Enter(den)
				Leave(den)
			}
		})
	}
	wg.Wait()
	if Visitors(den) != 0 {
		t.Errorf("visitors = %d after as many leaves as entries", Visitors(den))
	}
}
