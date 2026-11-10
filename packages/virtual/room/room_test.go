package room

import (
	"path/filepath"
	"slices"
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
