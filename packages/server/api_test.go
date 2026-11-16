package server

import (
	"net/http"
	"strconv"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/server/api"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

func apiURL() string {
	return "http://127.0.0.1:" + strconv.Itoa(apiPort)
}

func apiSecret(t *testing.T) string {
	t.Helper()
	secret, err := store.New(testDB).GetAPISecret(t.Context())
	if err != nil {
		t.Fatal(err)
	}
	return secret
}

// saveLook saves a new look and motto for the habbo id, as the site or housekeeping saves them, and tells the game
// nothing.
func saveLook(t *testing.T, id int64, figure, gender, motto string) {
	t.Helper()
	q := store.New(testDB)
	now := time.Now().UTC()
	if err := q.UpdateAvatarLook(t.Context(), store.UpdateAvatarLookParams{ID: id, Figure: figure, Gender: gender, UpdatedAt: now}); err != nil {
		t.Fatal(err)
	}
	if err := q.UpdateAvatarMotto(t.Context(), store.UpdateAvatarMottoParams{ID: id, Motto: motto, UpdatedAt: now}); err != nil {
		t.Fatal(err)
	}
}

func TestALookSavedApartReachesTheRoomThroughTheAPI(t *testing.T) {
	stylistID := habboWithTickets(t, "Apistylist", "apistylist")
	habboWithTickets(t, "Apiadmirer", "apiadmirer")
	flat := newRoom(t, stylistID, 2, "Remote Boutique", true)
	stylist, _ := login(t, "apistylist")
	admirer, _ := login(t, "apiadmirer")
	stylist.enterFlat(t, flat, 47, 42)
	admirer.enterFlat(t, flat)
	saveLook(t, stylistID, "hd-620-1.hr-515-33", "F", "Sent from afar")

	if err := api.New(apiURL(), apiSecret(t)).SendLook(t.Context(), stylistID); err != nil {
		t.Fatalf("SendLook through the api: %v", err)
	}

	want := vl64String(t, 0) + "hd-620-1.hr-515-33\x02F\x02Sent from afar\x02"
	for _, c := range []*client{stylist, admirer} {
		if id, body := c.nextSkipping(t, 34, 28, 5); id != 266 || body != want {
			t.Errorf("received %d %q, want 266 %q", id, body, want)
		}
	}
}

func TestTheAPIAnswers404WithoutTheSecret(t *testing.T) {
	look := apiURL() + "/api/habbos/1/look"
	for _, c := range []struct {
		name, method, url, secret string
	}{
		{"no secret", http.MethodPost, look, ""},
		{"a wrong secret", http.MethodPost, look, "not-the-secret"},
		{"the secret on another path", http.MethodPost, apiURL() + "/api/habbos/1/credits", apiSecret(t)},
		{"the secret with another method", http.MethodGet, look, apiSecret(t)},
	} {
		req, err := http.NewRequestWithContext(t.Context(), c.method, c.url, nil)
		if err != nil {
			t.Fatal(err)
		}
		if c.secret != "" {
			req.Header.Set("X-Reborn-Secret", c.secret)
		}
		res, err := http.DefaultClient.Do(req)
		if err != nil {
			t.Fatalf("%s: %v", c.name, err)
		}
		res.Body.Close()
		if res.StatusCode != http.StatusNotFound {
			t.Errorf("%s: answered %s, want 404 Not Found", c.name, res.Status)
		}
	}
	if err := api.New(apiURL(), "not-the-secret").SendLook(t.Context(), 1); err == nil {
		t.Error("SendLook with a wrong secret = nil, want an error")
	}
}
