package server

import (
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// recycle sends START_FURNI_RECYCLING with floor furni and reads its result, 306, past the hand's 101.
func recycle(t *testing.T, c *client, ids []int64) string {
	t.Helper()
	body := vl64String(t, int32(len(ids)))
	for _, id := range ids {
		body += vl64String(t, int32(id))
	}
	c.send(t, 225, body+vl64String(t, 0))
	id, result := c.nextSkipping(t, 34, 101)
	if id != 306 {
		t.Fatalf("START_FURNI_RECYCLING answered %d %q, want its result, 306", id, result)
	}
	return result
}

// recycling asks for the recycler's status, 304.
func recycling(t *testing.T, c *client) string {
	t.Helper()
	c.send(t, 223, "")
	id, status := c.nextSkipping(t, 34, 101)
	if id != 304 {
		t.Fatalf("GET_FURNI_RECYCLER_STATUS answered %d %q, want 304", id, status)
	}
	return status
}

// confirm takes the reward, 1, or refuses it, 0, and reads the result, 307.
func confirm(t *testing.T, c *client, take int32) string {
	t.Helper()
	c.send(t, 226, vl64String(t, take))
	id, result := c.nextSkipping(t, 34, 101)
	if id != 307 {
		t.Fatalf("CONFIRM_FURNI_RECYCLING answered %d %q, want its result, 307", id, result)
	}
	return result
}

// A habbo in a room gives the recycler as many old, recyclable furni of its hand as a reward takes. The furni wait in
// the store, the time counts from the saved start, and the habbo takes the reward once it is ready, or its furni back
// once it waited too long (plans/server decisions 0093, 0116, 0117 and 0118).
func TestRecycling(t *testing.T) {
	me := habboWithTickets(t, "Ecologist", "ecologist")
	flat := newRoom(t, me, 2, "Compost", true)
	var lamps []int64
	for range 42 {
		lamps = append(lamps, giveFurni(t, me, 1279, ""))
	}
	ctx := t.Context()
	if _, err := testDB.ExecContext(ctx, `UPDATE furni SET created_at = ? WHERE avatar_id = ?`, time.Now().UTC().AddDate(0, 0, -60), me); err != nil {
		t.Fatal(err)
	}
	fresh := giveFurni(t, me, 1279, "")
	box := giveFurni(t, me, 1372, "")
	if _, err := testDB.ExecContext(ctx, `UPDATE furni SET created_at = ? WHERE id = ?`, time.Now().UTC().AddDate(0, 0, -60), box); err != nil {
		t.Fatal(err)
	}
	q := store.New(testDB)
	startedAgo := func(d time.Duration) {
		t.Helper()
		if _, err := testDB.ExecContext(ctx, `UPDATE recyclings SET started_at = ? WHERE avatar_id = ?`, time.Now().UTC().Add(-d), me); err != nil {
			t.Fatal(err)
		}
	}
	waiting := func() int {
		t.Helper()
		var n int
		if err := testDB.QueryRowContext(ctx, `SELECT COUNT(*) FROM furni WHERE recycler_avatar_id = ? AND avatar_id IS NULL`, me).Scan(&n); err != nil {
			t.Fatal(err)
		}
		return n
	}

	c, _ := login(t, "ecologist")
	c.send(t, 222, "")
	want := vl64String(t, 1, 43200, 60, 10080, 4) +
		vl64String(t, 20, 0) + "rclr_chair\x02" + vl64String(t, 0, 1, 1) + "0,0,0\x02" +
		vl64String(t, 30, 0) + "rclr_garden\x02" + vl64String(t, 0, 1, 3) + "0,0,0\x02" +
		vl64String(t, 40, 0) + "rclr_sofa\x02" + vl64String(t, 0, 2, 1) + "0,0,0\x02" +
		vl64String(t, 50, 0) + "rclr_lamp\x02" + vl64String(t, 0, 1, 1) + "0,0,0\x02"
	c.expectMessage(t, 303, want)
	if status := recycling(t, c); status != vl64String(t, 0) {
		t.Errorf("with no recycling the status is %q, want 0", status)
	}
	if result := recycle(t, c, lamps[:20]); result != vl64String(t, 0) {
		t.Errorf("outside a room a recycling started: %q", result)
	}

	c.enterFlat(t, flat, 47, 42)
	// No reward for 19; a furni made today; a furni twice; and one that is not recyclable.
	for name, ids := range map[string][]int64{
		"19 furni":            lamps[:19],
		"a furni made today":  append(append([]int64{}, lamps[:19]...), fresh),
		"a furni twice":       append(append([]int64{}, lamps[:19]...), lamps[0]),
		"a present box":       append(append([]int64{}, lamps[:19]...), box),
		"another habbo's one": append(append([]int64{}, lamps[:19]...), 999999),
	} {
		if result := recycle(t, c, ids); result != vl64String(t, 0) {
			t.Errorf("a recycling started with %s: %q", name, result)
		}
	}
	if n := waiting(); n != 0 {
		t.Fatalf("%d furni wait in the recycler after refused recyclings", n)
	}

	if result := recycle(t, c, lamps[:20]); result != vl64String(t, 1) {
		t.Fatalf("20 old lamps started no recycling: %q", result)
	}
	if n, hand := waiting(), handOf(t, me); n != 20 || len(hand) != 24 {
		t.Fatalf("%d furni wait in the recycler and %d are in the hand, want 20 and 24", n, len(hand))
	}
	if status := recycling(t, c); status != vl64String(t, 1, 0)+"rclr_chair\x02"+vl64String(t, 60) {
		t.Errorf("the running recycling's status is %q, want a Palm Chair in 60 minutes", status)
	}
	if result := recycle(t, c, lamps[20:40]); result != vl64String(t, 0) {
		t.Errorf("a second recycling started: %q", result)
	}
	if result := confirm(t, c, 1); result != vl64String(t, 0) || waiting() != 20 {
		t.Errorf("the reward was taken before the recycling ended: %q, %d furni waiting", result, waiting())
	}

	// The time counts from the saved start, whatever happened to the server since.
	startedAgo(2 * time.Hour)
	if status := recycling(t, c); status != vl64String(t, 2, 0)+"rclr_chair\x02" {
		t.Errorf("after its hour the recycling's status is %q, want the Palm Chair ready", status)
	}
	if result := confirm(t, c, 1); result != vl64String(t, 1) {
		t.Fatalf("the ready reward was not taken: %q", result)
	}
	hand := handOf(t, me)
	if n := waiting(); n != 0 || len(hand) != 25 || hand[24].FurniDefinitionID != 463 || hand[24].UserID != userOf(t, me) {
		t.Errorf("after the reward %d furni wait and the hand ends with %+v of %d; want the 20 lamps gone and a Palm Chair", n, hand[len(hand)-1], len(hand))
	}
	if _, err := q.GetFurni(ctx, lamps[0]); !store.IsNotFound(err) {
		t.Errorf("a recycled lamp is still stored (%v)", err)
	}

	// A reward that waited too long is lost, and the furni come back.
	if result := recycle(t, c, lamps[20:40]); result != vl64String(t, 1) {
		t.Fatalf("a second recycling did not start: %q", result)
	}
	startedAgo(8 * 24 * time.Hour)
	if status := recycling(t, c); status != vl64String(t, 3) {
		t.Errorf("after 8 days the recycling's status is %q, want it timed out", status)
	}
	if result := confirm(t, c, 1); result != vl64String(t, 0) || waiting() != 20 {
		t.Errorf("a reward was taken after the time-out: %q, %d furni waiting", result, waiting())
	}
	if result := confirm(t, c, 0); result != vl64String(t, 1) {
		t.Fatalf("the timed-out recycling was not cancelled: %q", result)
	}
	if n, hand := waiting(), handOf(t, me); n != 0 || len(hand) != 25 {
		t.Errorf("after the cancel %d furni wait and %d are in the hand, want 0 and 25", n, len(hand))
	}
	if row := furniRow(t, lamps[20]); row.AvatarID.Int64 != me || row.RecyclerAvatarID.Valid {
		t.Errorf("a lamp that came back is stored as %+v, want it in the hand", row)
	}
	if _, err := q.GetRecycling(ctx, me); !store.IsNotFound(err) {
		t.Errorf("the ended recycling is still stored (%v)", err)
	}
	if status := recycling(t, c); !strings.HasPrefix(status, vl64String(t, 0)) {
		t.Errorf("after the cancel the status is %q, want the recycler open", status)
	}
}
