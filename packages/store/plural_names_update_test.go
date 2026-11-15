package store

import (
	"path/filepath"
	"slices"
	"testing"
)

// A hotel made before the plural names keeps its furni, home inventories and
// catalogue items' furni, and every row that points at them, under the new names.
func TestThePluralNamesUpdateKeepsTheRowsAndTheirForeignKeys(t *testing.T) {
	db := connectTestDB(t, filepath.Join(t.TempDir(), "hotel.db"))
	updates := must(Updates())
	at := slices.IndexFunc(updates, func(u Update) bool { return u.Name == "plural-table-names" })
	if at < 0 {
		t.Fatalf("no plural-table-names update among %v", versions(updates))
	}
	must(ApplyUpdates(t.Context(), db, updates[:at]))

	userID, avatarID := insertHabbo(t, db, "krono@example.com", "Krono")
	definition := countRows(t, db, "SELECT MIN(id) FROM furni_definitions")
	storeItem := countRows(t, db, "SELECT MIN(id) FROM home_store_items")
	catalogueRows := countRows(t, db, "SELECT COUNT(*) FROM catalogue_item_furni")
	for _, statement := range []string{
		`INSERT INTO furni (id, furni_definition_id, user_id, avatar_id, state, created_at) VALUES (1, ?1, ?2, ?3, 'box', ?4), (2, ?1, ?2, ?3, '', ?4), (3, ?1, ?2, ?3, '', ?4)`,
		`UPDATE furni SET box_furni_id = 1 WHERE id = 2`,
		`UPDATE furni SET partner_furni_id = 3 WHERE id = 1`,
		`INSERT INTO furni_notes (furni_id, text) VALUES (3, 'hello')`,
		`INSERT INTO home_inventory (user_id, home_store_item_id, quantity) VALUES (?2, ?5, 4)`,
	} {
		if _, err := db.ExecContext(t.Context(), statement, definition, userID, avatarID, testNow, storeItem); err != nil {
			t.Fatalf("%s: %v", statement, err)
		}
	}

	must(ApplyUpdates(t.Context(), db, updates[at:at+1]))

	for _, old := range []string{"furni", "home_inventory", "catalogue_item_furni"} {
		if hasTable(t, db, old) {
			t.Errorf("table %s is still there", old)
		}
	}
	if n := countRows(t, db, "SELECT COUNT(*) FROM furnis WHERE user_id = ? AND avatar_id = ?", userID, avatarID); n != 3 {
		t.Errorf("furnis of the habbo = %d, want 3", n)
	}
	if n := countRows(t, db, "SELECT COUNT(*) FROM furnis WHERE (id = 2 AND box_furni_id = 1) OR (id = 1 AND partner_furni_id = 3)"); n != 2 {
		t.Errorf("furnis in their box and with their partner = %d, want 2", n)
	}
	if n := countRows(t, db, "SELECT COUNT(*) FROM furni_notes JOIN furnis ON furnis.id = furni_notes.furni_id WHERE text = 'hello'"); n != 1 {
		t.Errorf("notes on their furni = %d, want 1", n)
	}
	if n := countRows(t, db, "SELECT quantity FROM home_inventories WHERE user_id = ? AND home_store_item_id = ?", userID, storeItem); n != 4 {
		t.Errorf("home inventory quantity = %d, want 4", n)
	}
	if n := countRows(t, db, "SELECT COUNT(*) FROM catalogue_item_furnis"); n != catalogueRows || n == 0 {
		t.Errorf("catalogue item furnis = %d, want the %d seeded", n, catalogueRows)
	}

	if _, err := db.ExecContext(t.Context(), "INSERT INTO furni_notes (furni_id, text) VALUES (99, 'lost')"); !IsForeignKey(err) {
		t.Errorf("a note on no furni: %v, want a foreign-key violation", err)
	}
	if _, err := db.ExecContext(t.Context(), "UPDATE furnis SET box_furni_id = 99 WHERE id = 3"); !IsForeignKey(err) {
		t.Errorf("a furni in no box: %v, want a foreign-key violation", err)
	}
	if _, err := db.ExecContext(t.Context(), "DELETE FROM furnis WHERE id = 1"); err != nil {
		t.Fatalf("delete the box: %v", err)
	}
	if n := countRows(t, db, "SELECT COUNT(*) FROM furnis WHERE box_furni_id IS NULL AND partner_furni_id IS NULL"); n != 2 {
		t.Errorf("furnis freed of the deleted box = %d, want 2", n)
	}
	if _, err := db.ExecContext(t.Context(), "DELETE FROM furnis WHERE id = 3"); err != nil {
		t.Fatalf("delete the post-it: %v", err)
	}
	if n := countRows(t, db, "SELECT COUNT(*) FROM furni_notes"); n != 0 {
		t.Errorf("notes after their furni went = %d, want 0", n)
	}
}
