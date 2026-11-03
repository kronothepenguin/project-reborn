package store

import (
	"database/sql"
	"errors"
	"os"
	"path/filepath"
	"regexp"
	"slices"
	"strings"
	"sync"
	"testing"
	"testing/fstest"
	"time"
)

func connectTestDB(t *testing.T, path string) *sql.DB {
	t.Helper()
	db, err := connect(path)
	if err != nil {
		t.Fatalf("connect: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	return db
}

func emptyTestDB(t *testing.T) *sql.DB {
	t.Helper()
	return connectTestDB(t, filepath.Join(t.TempDir(), "hotel.db"))
}

func parseTestUpdates(t *testing.T, files map[string]string) []Update {
	t.Helper()
	fsys := fstest.MapFS{}
	for name, content := range files {
		fsys[name] = &fstest.MapFile{Data: []byte(content)}
	}
	updates, err := ParseUpdates(fsys)
	if err != nil {
		t.Fatalf("ParseUpdates: %v", err)
	}
	return updates
}

func versions(updates []Update) []int64 {
	var out []int64
	for _, update := range updates {
		out = append(out, update.Version)
	}
	return out
}

func hasTable(t *testing.T, db *sql.DB, name string) bool {
	t.Helper()
	return countRows(t, db, `SELECT COUNT(*) FROM sqlite_schema WHERE type = 'table' AND name = ?`, name) == 1
}

func foreignKeysOn(t *testing.T, db *sql.DB) bool {
	t.Helper()
	return countRows(t, db, "PRAGMA foreign_keys") == 1
}

var thingsUpdates = map[string]string{
	"0001-create-things.sql": "-- Create the things.\nCREATE TABLE things (id INTEGER PRIMARY KEY, name TEXT NOT NULL);\n",
	"0002-fill-things.sql":   "-- Fill the things.\n-- automatic\nINSERT INTO things (id, name) VALUES (1, 'lamp'), (2, 'sofa');\n",
	"0003-more-things.sql":   "-- Add a third thing.\nINSERT INTO things (id, name) VALUES (3, 'rug');\n",
}

func TestParseUpdatesReadsNamesTitlesAndMarks(t *testing.T) {
	updates := parseTestUpdates(t, thingsUpdates)

	want := []struct {
		version   int64
		name      string
		title     string
		automatic bool
	}{
		{1, "create-things", "Create the things.", false},
		{2, "fill-things", "Fill the things.", true},
		{3, "more-things", "Add a third thing.", false},
	}
	if len(updates) != len(want) {
		t.Fatalf("got %d updates, want %d", len(updates), len(want))
	}
	for i, w := range want {
		u := updates[i]
		if u.Version != w.version || u.Name != w.name || u.Title != w.title || u.Automatic != w.automatic {
			t.Errorf("update %d = %+v, want %+v", i, u, w)
		}
	}
}

func TestParseUpdatesRefusesWrongFiles(t *testing.T) {
	tests := []struct {
		name  string
		files fstest.MapFS
		want  string
	}{
		{"no number", fstest.MapFS{"create.sql": {Data: []byte("-- x\n")}}, "is not named"},
		{"short number", fstest.MapFS{"001-create.sql": {Data: []byte("-- x\n")}}, "is not named"},
		{"underscore", fstest.MapFS{"0001_create.sql": {Data: []byte("-- x\n")}}, "is not named"},
		{"capitals", fstest.MapFS{"0001-Create.sql": {Data: []byte("-- x\n")}}, "is not named"},
		{"other file", fstest.MapFS{"0001-create.sql": {Data: []byte("-- x\n")}, "notes.txt": {Data: []byte("x")}}, "is not named"},
		{"folder", fstest.MapFS{"0001-create.sql/inner.sql": {Data: []byte("-- x\n")}}, "is not named"},
		{"no title", fstest.MapFS{"0001-create.sql": {Data: []byte("CREATE TABLE x (id INTEGER);\n")}}, "title"},
		{"empty title", fstest.MapFS{"0001-create.sql": {Data: []byte("--\nCREATE TABLE x (id INTEGER);\n")}}, "title"},
		{"repeated", fstest.MapFS{"0001-a.sql": {Data: []byte("-- a\n")}, "0001-b.sql": {Data: []byte("-- b\n")}}, "repeats version 0001"},
		{"gap", fstest.MapFS{"0001-a.sql": {Data: []byte("-- a\n")}, "0003-c.sql": {Data: []byte("-- c\n")}}, "leaves out version 0002"},
		{"no first", fstest.MapFS{"0002-b.sql": {Data: []byte("-- b\n")}}, "leaves out version 0001"},
		{"zero", fstest.MapFS{"0000-a.sql": {Data: []byte("-- a\n")}}, "versions start at 0001"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := ParseUpdates(tt.files)
			if err == nil || !strings.Contains(err.Error(), tt.want) {
				t.Errorf("ParseUpdates() error = %v, want it to say %q", err, tt.want)
			}
		})
	}
}

func TestParseUpdatesTakesTheMarkOnlyFromTheFirstComments(t *testing.T) {
	updates := parseTestUpdates(t, map[string]string{
		"0001-late-mark.sql": "-- A late mark.\nCREATE TABLE x (id INTEGER);\n-- automatic\n",
	})
	if updates[0].Automatic {
		t.Error("a mark after the first statement made the update automatic")
	}
}

func TestWaitingUpdatesReadsWithoutWriting(t *testing.T) {
	db := emptyTestDB(t)
	updates := parseTestUpdates(t, thingsUpdates)

	waiting, err := WaitingUpdates(t.Context(), db, updates)
	if err != nil {
		t.Fatalf("WaitingUpdates: %v", err)
	}
	if got := versions(waiting); !slices.Equal(got, []int64{1, 2, 3}) {
		t.Errorf("waiting = %v, want every update", got)
	}
	if hasTable(t, db, "migrations") {
		t.Error("reading the waiting updates created the migrations table")
	}
	applied, err := AppliedUpdates(t.Context(), db)
	if err != nil || len(applied) != 0 {
		t.Errorf("AppliedUpdates = %v, %v, want none", applied, err)
	}
}

func TestApplyUpdatesAppliesInOrderAndRecordsEach(t *testing.T) {
	db := emptyTestDB(t)
	ctx := t.Context()
	updates := parseTestUpdates(t, thingsUpdates)
	before := time.Now().UTC().Add(-time.Second)

	applied, err := ApplyUpdates(ctx, db, updates)
	if err != nil {
		t.Fatalf("ApplyUpdates: %v", err)
	}
	if got := versions(applied); !slices.Equal(got, []int64{1, 2, 3}) {
		t.Errorf("applied = %v, want 1, 2, 3", got)
	}
	if n := countRows(t, db, "SELECT COUNT(*) FROM things"); n != 3 {
		t.Errorf("things = %d, want 3", n)
	}

	rows, err := AppliedUpdates(ctx, db)
	if err != nil {
		t.Fatalf("AppliedUpdates: %v", err)
	}
	names := []string{"create-things", "fill-things", "more-things"}
	if len(rows) != len(names) {
		t.Fatalf("migrations rows = %d, want %d", len(rows), len(names))
	}
	for i, row := range rows {
		if row.Version != int64(i+1) || row.Name != names[i] {
			t.Errorf("row %d = %d %s, want %d %s", i, row.Version, row.Name, i+1, names[i])
		}
		if row.AppliedAt.Before(before) || row.AppliedAt.After(time.Now().UTC().Add(time.Second)) {
			t.Errorf("row %d applied at %v, not during the run", i, row.AppliedAt)
		}
	}

	waiting, err := WaitingUpdates(ctx, db, updates)
	if err != nil || len(waiting) != 0 {
		t.Errorf("WaitingUpdates after the run = %v, %v, want none", versions(waiting), err)
	}
	again, err := ApplyUpdates(ctx, db, updates)
	if err != nil || len(again) != 0 {
		t.Errorf("a second run applied %v, %v, want nothing", versions(again), err)
	}
	if n := countRows(t, db, "SELECT COUNT(*) FROM things"); n != 3 {
		t.Errorf("things after a second run = %d, want 3", n)
	}
}

func TestAFailingUpdateLeavesNoTraceAndStopsTheRun(t *testing.T) {
	db := emptyTestDB(t)
	ctx := t.Context()
	updates := parseTestUpdates(t, map[string]string{
		"0001-create-things.sql": thingsUpdates["0001-create-things.sql"],
		"0002-half-done.sql":     "-- Half done.\nCREATE TABLE halves (id INTEGER PRIMARY KEY);\nINSERT INTO things (id, name) VALUES (1, 'lamp');\nINSERT INTO nowhere (id) VALUES (1);\n",
		"0003-later.sql":         "-- Later.\nCREATE TABLE later (id INTEGER PRIMARY KEY);\n",
	})

	applied, err := ApplyUpdates(ctx, db, updates)
	var updateErr *UpdateError
	if !errors.As(err, &updateErr) {
		t.Fatalf("ApplyUpdates error = %v, want an *UpdateError", err)
	}
	if updateErr.Update.Version != 2 || !strings.Contains(err.Error(), "0002-half-done") {
		t.Errorf("the error names %d (%v), want update 0002-half-done", updateErr.Update.Version, err)
	}
	if got := versions(applied); !slices.Equal(got, []int64{1}) {
		t.Errorf("applied = %v, want only 1", got)
	}
	if !hasTable(t, db, "things") {
		t.Error("the update before the failure was undone")
	}
	if hasTable(t, db, "halves") || countRows(t, db, "SELECT COUNT(*) FROM things") != 0 {
		t.Error("the failed update left a trace")
	}
	if hasTable(t, db, "later") {
		t.Error("the run went on after the failure")
	}
	if got := versions(must(WaitingUpdates(ctx, db, updates))); !slices.Equal(got, []int64{2, 3}) {
		t.Errorf("waiting after the failure = %v, want 2, 3", got)
	}
	if !foreignKeysOn(t, db) {
		t.Error("foreign keys stayed off after a failed update")
	}
}

func must[T any](v T, err error) T {
	if err != nil {
		panic(err)
	}
	return v
}

var familyUpdate = "-- Create the family.\n" +
	"CREATE TABLE parents (id INTEGER PRIMARY KEY);\n" +
	"CREATE TABLE children (id INTEGER PRIMARY KEY, parent_id INTEGER NOT NULL REFERENCES parents(id) ON DELETE CASCADE);\n" +
	"INSERT INTO parents (id) VALUES (1);\n" +
	"INSERT INTO children (id, parent_id) VALUES (1, 1);\n"

func TestAForeignKeyViolationAbortsTheUpdate(t *testing.T) {
	db := emptyTestDB(t)
	updates := parseTestUpdates(t, map[string]string{
		"0001-create-family.sql": familyUpdate,
		"0002-orphan.sql":        "-- An orphan.\nINSERT INTO children (id, parent_id) VALUES (2, 99);\n",
	})

	_, err := ApplyUpdates(t.Context(), db, updates)
	var updateErr *UpdateError
	if !errors.As(err, &updateErr) || updateErr.Update.Version != 2 {
		t.Fatalf("ApplyUpdates error = %v, want update 2 to fail", err)
	}
	if !strings.Contains(err.Error(), "children") {
		t.Errorf("error %q does not name the table", err)
	}
	if n := countRows(t, db, "SELECT COUNT(*) FROM children"); n != 1 {
		t.Errorf("children = %d, want the orphan rolled back", n)
	}
	if !foreignKeysOn(t, db) {
		t.Error("foreign keys stayed off after the violation")
	}
}

func TestAnUpdateRebuildsATableOthersReferTo(t *testing.T) {
	db := emptyTestDB(t)
	updates := parseTestUpdates(t, map[string]string{
		"0001-create-family.sql": familyUpdate,
		"0002-rebuild-parents.sql": "-- Give parents a name.\n" +
			"CREATE TABLE new_parents (id INTEGER PRIMARY KEY, name TEXT NOT NULL DEFAULT '');\n" +
			"INSERT INTO new_parents (id) SELECT id FROM parents;\n" +
			"DROP TABLE parents;\n" +
			"ALTER TABLE new_parents RENAME TO parents;\n",
	})

	if _, err := ApplyUpdates(t.Context(), db, updates); err != nil {
		t.Fatalf("ApplyUpdates: %v", err)
	}
	if n := countRows(t, db, "SELECT COUNT(*) FROM children JOIN parents ON parents.id = children.parent_id"); n != 1 {
		t.Errorf("children joined to the rebuilt parents = %d, want 1", n)
	}
	if !foreignKeysOn(t, db) {
		t.Error("foreign keys stayed off after the rebuild")
	}
	if _, err := db.ExecContext(t.Context(), "INSERT INTO children (id, parent_id) VALUES (2, 99)"); !IsForeignKey(err) {
		t.Errorf("an orphan after the rebuild: %v, want a foreign-key violation", err)
	}
}

func TestAnUpdateAppliedMeanwhileIsSkipped(t *testing.T) {
	path := filepath.Join(t.TempDir(), "hotel.db")
	first, second := connectTestDB(t, path), connectTestDB(t, path)
	updates := parseTestUpdates(t, thingsUpdates)

	if _, err := ApplyUpdates(t.Context(), first, updates[:1]); err != nil {
		t.Fatalf("first ApplyUpdates: %v", err)
	}
	applied, err := ApplyUpdates(t.Context(), second, updates)
	if err != nil {
		t.Fatalf("second ApplyUpdates: %v", err)
	}
	if got := versions(applied); !slices.Equal(got, []int64{2, 3}) {
		t.Errorf("the second program applied %v, want 2, 3", got)
	}
	if n := countRows(t, first, "SELECT COUNT(*) FROM migrations"); n != 3 {
		t.Errorf("migrations rows = %d, want 3", n)
	}
}

func TestProgramsUpdatingTogetherApplyEachUpdateOnce(t *testing.T) {
	path := filepath.Join(t.TempDir(), "hotel.db")
	updates := parseTestUpdates(t, map[string]string{
		"0001-create-counter.sql": "-- Create the counter.\nCREATE TABLE counter (n INTEGER NOT NULL);\n",
		"0002-count.sql":          "-- Count once.\nINSERT INTO counter (n) VALUES (1);\n",
		"0003-count-again.sql":    "-- Count again.\nINSERT INTO counter (n) VALUES (1);\n",
	})
	programs := []*sql.DB{connectTestDB(t, path), connectTestDB(t, path), connectTestDB(t, path)}

	var wg sync.WaitGroup
	errs := make([]error, len(programs))
	for i, db := range programs {
		wg.Go(func() {
			_, errs[i] = ApplyUpdates(t.Context(), db, updates)
		})
	}
	wg.Wait()
	for i, err := range errs {
		if err != nil {
			t.Errorf("program %d: %v", i, err)
		}
	}
	if n := countRows(t, programs[0], "SELECT COUNT(*) FROM counter"); n != 2 {
		t.Errorf("counter rows = %d, want 2: an update ran twice or not at all", n)
	}
}

func TestBackupCopiesTheDatabaseBesideIt(t *testing.T) {
	path := filepath.Join(t.TempDir(), "hotel.db")
	db := connectTestDB(t, path)
	if _, err := ApplyUpdates(t.Context(), db, parseTestUpdates(t, thingsUpdates)); err != nil {
		t.Fatalf("ApplyUpdates: %v", err)
	}

	copyPath, err := Backup(t.Context(), db)
	if err != nil {
		t.Fatalf("Backup: %v", err)
	}
	name := regexp.MustCompile(`^hotel\.db\.backup-[0-9]{8}-[0-9]{6}$`)
	if filepath.Dir(copyPath) != filepath.Dir(path) || !name.MatchString(filepath.Base(copyPath)) {
		t.Errorf("copy saved as %s, want hotel.db.backup-YYYYMMDD-HHMMSS beside %s", copyPath, path)
	}
	stamp, err := time.Parse("20060102-150405", strings.TrimPrefix(filepath.Base(copyPath), "hotel.db.backup-"))
	if err != nil || time.Since(stamp).Abs() > time.Minute {
		t.Errorf("copy stamped %s, want the current UTC time", filepath.Base(copyPath))
	}

	saved := connectTestDB(t, copyPath)
	if n := countRows(t, saved, "SELECT COUNT(*) FROM things"); n != 3 {
		t.Errorf("the copy holds %d things, want 3", n)
	}
	if n := countRows(t, saved, "SELECT COUNT(*) FROM migrations"); n != 3 {
		t.Errorf("the copy holds %d migrations rows, want 3", n)
	}

}

func TestBackupKeepsACopySavedInTheSameSecond(t *testing.T) {
	path := filepath.Join(t.TempDir(), "hotel.db")
	db := connectTestDB(t, path)
	now := time.Now().UTC()
	for _, stamp := range []time.Time{now, now.Add(time.Second)} {
		taken := path + ".backup-" + stamp.Format("20060102-150405")
		if err := os.WriteFile(taken, []byte("another copy"), 0o644); err != nil {
			t.Fatal(err)
		}
	}

	copyPath, err := Backup(t.Context(), db)
	if err != nil {
		t.Fatalf("Backup: %v", err)
	}
	if !strings.HasSuffix(copyPath, "-2") {
		t.Errorf("copy saved as %s, want the name of that second with -2", copyPath)
	}
	kept, err := os.ReadFile(strings.TrimSuffix(copyPath, "-2"))
	if err != nil || string(kept) != "another copy" {
		t.Errorf("the copy already there became %q, %v", kept, err)
	}
}

func TestAnUpdateWaitsForAnotherProgramsRun(t *testing.T) {
	path := filepath.Join(t.TempDir(), "hotel.db")
	runner, other := connectTestDB(t, path), connectTestDB(t, path)
	ctx := t.Context()
	updates := parseTestUpdates(t, thingsUpdates)
	if _, err := ApplyUpdates(ctx, runner, updates[:1]); err != nil {
		t.Fatalf("ApplyUpdates: %v", err)
	}

	conn, err := other.Conn(ctx)
	if err != nil {
		t.Fatal(err)
	}
	defer conn.Close()
	if _, err := conn.ExecContext(ctx, "BEGIN IMMEDIATE"); err != nil {
		t.Fatal(err)
	}
	type result struct {
		applied []Update
		err     error
	}
	done := make(chan result)
	go func() {
		applied, err := ApplyUpdates(ctx, runner, updates[1:2])
		done <- result{applied, err}
	}()
	time.Sleep(300 * time.Millisecond)
	for _, statement := range []string{
		"INSERT INTO things (id, name) VALUES (1, 'lamp'), (2, 'sofa')",
		"INSERT INTO migrations (version, name, applied_at) VALUES (2, 'fill-things', '2026-11-03 21:00:00+00:00')",
		"COMMIT",
	} {
		if _, err := conn.ExecContext(ctx, statement); err != nil {
			t.Fatalf("%s: %v", statement, err)
		}
	}

	got := <-done
	if got.err != nil || len(got.applied) != 0 {
		t.Errorf("ApplyUpdates while another program applied the update = %v, %v, want it skipped", versions(got.applied), got.err)
	}
	if n := countRows(t, runner, "SELECT COUNT(*) FROM things"); n != 2 {
		t.Errorf("things = %d, want 2", n)
	}
}
