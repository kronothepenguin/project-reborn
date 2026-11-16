package store

import (
	"path/filepath"
	"slices"
	"testing"
)

// A hotel of the last release applies the api-secret update and holds one
// secret, which the programs read.
func TestTheAPISecretUpdateGivesTheHotelOneSecret(t *testing.T) {
	db := connectTestDB(t, filepath.Join(t.TempDir(), "hotel.db"))
	updates := must(Updates())
	at := slices.IndexFunc(updates, func(u Update) bool { return u.Name == "api-secret" })
	if at < 0 {
		t.Fatalf("no api-secret update among %v", versions(updates))
	}
	must(ApplyUpdates(t.Context(), db, updates[:at]))

	must(ApplyUpdates(t.Context(), db, []Update{updates[at]}))

	secret, err := New(db).GetAPISecret(t.Context())
	if err != nil {
		t.Fatalf("GetAPISecret: %v", err)
	}
	if len(secret) != 64 {
		t.Errorf("the secret is %q, want 64 hex digits", secret)
	}
	var rows int
	if err := db.QueryRowContext(t.Context(), "SELECT COUNT(*) FROM api_secret").Scan(&rows); err != nil {
		t.Fatal(err)
	}
	if rows != 1 {
		t.Errorf("api_secret holds %d rows, want 1", rows)
	}
}
