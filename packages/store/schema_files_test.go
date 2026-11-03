package store

import (
	"database/sql"
	"embed"
	"io/fs"
	"path"
	"path/filepath"
	"regexp"
	"slices"
	"strings"
	"testing"
)

//go:embed schema/*.schema.sql
var schemaFS embed.FS

// applySchemaFiles builds db from the schema files, as Open built every
// database before updates existed, leaving out the files named in skip.
func applySchemaFiles(t *testing.T, db *sql.DB, skip ...string) {
	t.Helper()
	names, err := fs.Glob(schemaFS, "schema/*.schema.sql")
	if err != nil {
		t.Fatal(err)
	}
	slices.Sort(names)
	for _, name := range names {
		if slices.Contains(skip, path.Base(name)) {
			continue
		}
		content, err := fs.ReadFile(schemaFS, name)
		if err != nil {
			t.Fatal(err)
		}
		if _, err := db.ExecContext(t.Context(), string(content)); err != nil {
			t.Fatalf("apply %s: %v", name, err)
		}
	}
}

// describeSchema lists every table's columns by name, its table constraints and
// options, and every index, from the text SQLite keeps. ALTER TABLE ADD COLUMN
// appends a column to that text, so columns are matched by name, not position.
func describeSchema(t *testing.T, db *sql.DB) []string {
	t.Helper()
	rows, err := db.QueryContext(t.Context(), `SELECT type, name, tbl_name, sql FROM sqlite_schema WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite\_%' ESCAPE '\'`)
	if err != nil {
		t.Fatal(err)
	}
	defer rows.Close()
	var lines []string
	for rows.Next() {
		var kind, name, table, text string
		if err := rows.Scan(&kind, &name, &table, &text); err != nil {
			t.Fatal(err)
		}
		if kind != "table" {
			lines = append(lines, kind+" "+name+" on "+table+": "+normalizeSQL(stripComments(text)))
			continue
		}
		open, end := strings.Index(text, "("), strings.LastIndex(text, ")")
		lines = append(lines, "table "+name+" options: "+normalizeSQL(text[end+1:]))
		for _, part := range splitTopLevel(stripComments(text[open+1 : end])) {
			part = normalizeSQL(part)
			if part == "" {
				continue
			}
			first, _, _ := strings.Cut(part, " ")
			switch strings.ToUpper(first) {
			case "CONSTRAINT", "PRIMARY", "UNIQUE", "CHECK", "FOREIGN":
				lines = append(lines, "table "+name+" constraint: "+part)
			default:
				lines = append(lines, "table "+name+" column "+strings.Trim(first, "\"`[]")+": "+part)
			}
		}
	}
	if err := rows.Err(); err != nil {
		t.Fatal(err)
	}
	slices.Sort(lines)
	return lines
}

func stripComments(s string) string {
	var b strings.Builder
	for i := 0; i < len(s); i++ {
		switch {
		case s[i] == '\'':
			j := i + 1
			for j < len(s) && (s[j] != '\'' || j+1 < len(s) && s[j+1] == '\'') {
				if s[j] == '\'' {
					j++
				}
				j++
			}
			b.WriteString(s[i:min(j+1, len(s))])
			i = j
		case strings.HasPrefix(s[i:], "--"):
			for i < len(s) && s[i] != '\n' {
				i++
			}
			b.WriteByte('\n')
		case strings.HasPrefix(s[i:], "/*"):
			end := strings.Index(s[i+2:], "*/")
			if end < 0 {
				i = len(s)
			} else {
				i += end + 3
			}
			b.WriteByte(' ')
		default:
			b.WriteByte(s[i])
		}
	}
	return b.String()
}

func splitTopLevel(s string) []string {
	var parts []string
	depth, start, quoted := 0, 0, false
	for i := 0; i < len(s); i++ {
		switch c := s[i]; {
		case c == '\'':
			quoted = !quoted
		case quoted:
		case c == '(':
			depth++
		case c == ')':
			depth--
		case c == ',' && depth == 0:
			parts = append(parts, s[start:i])
			start = i + 1
		}
	}
	return append(parts, s[start:])
}

var (
	spaces      = regexp.MustCompile(`\s+`)
	spacedMarks = regexp.MustCompile(`\s*([(),])\s*`)
)

func normalizeSQL(s string) string {
	s = spaces.ReplaceAllString(strings.TrimSpace(s), " ")
	s = spacedMarks.ReplaceAllString(s, "$1")
	return strings.TrimSuffix(s, ";")
}

func TestTheUpdatesBuildTheDatabaseTheSchemaFilesDescribe(t *testing.T) {
	fromFiles := emptyTestDB(t)
	applySchemaFiles(t, fromFiles)
	fromUpdates := openTestDB(t)

	files, updates := describeSchema(t, fromFiles), describeSchema(t, fromUpdates)
	for _, line := range files {
		if !slices.Contains(updates, line) {
			t.Errorf("the updates lack %s", line)
		}
	}
	for _, line := range updates {
		if !slices.Contains(files, line) {
			t.Errorf("the schema files lack %s", line)
		}
	}
	if len(files) < 100 {
		t.Errorf("the description has %d lines, too few to cover the schema", len(files))
	}
}

func describeDDL(t *testing.T, statements ...string) []string {
	t.Helper()
	db := emptyTestDB(t)
	for _, statement := range statements {
		if _, err := db.ExecContext(t.Context(), statement); err != nil {
			t.Fatalf("%s: %v", statement, err)
		}
	}
	return describeSchema(t, db)
}

func TestDescribeSchemaTellsDatabasesApart(t *testing.T) {
	things := func(count, name, parent string) string {
		return "CREATE TABLE things (\n    id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL" + name + ", -- the name\n" +
			"    count INTEGER NOT NULL " + count + ",\n    parent_id INTEGER REFERENCES things(id) " + parent + "\n)"
	}
	base := things("DEFAULT 0 CHECK (count >= 0)", " COLLATE NOCASE", "ON DELETE CASCADE")
	index := "CREATE UNIQUE INDEX idx_things_name ON things(name)"
	addPinned := "ALTER TABLE things ADD COLUMN pinned BOOLEAN NOT NULL DEFAULT FALSE"
	want := describeDDL(t, base, index)

	differ := map[string][]string{
		"an added column":   {base, index, addPinned},
		"an added index":    {base, index, "CREATE INDEX idx_things_count ON things(count)"},
		"a partial index":   {base, "CREATE UNIQUE INDEX idx_things_name ON things(name) WHERE count > 0"},
		"another check":     {things("DEFAULT 0 CHECK (count >= 1)", " COLLATE NOCASE", "ON DELETE CASCADE"), index},
		"another default":   {things("DEFAULT 1 CHECK (count >= 0)", " COLLATE NOCASE", "ON DELETE CASCADE"), index},
		"another collation": {things("DEFAULT 0 CHECK (count >= 0)", "", "ON DELETE CASCADE"), index},
		"another deletion":  {things("DEFAULT 0 CHECK (count >= 0)", " COLLATE NOCASE", "ON DELETE SET NULL"), index},
		"a missing index":   {base},
		"an added table":    {base, index, "CREATE TABLE extra (id INTEGER PRIMARY KEY)"},
	}
	for name, statements := range differ {
		if slices.Equal(describeDDL(t, statements...), want) {
			t.Errorf("%s is described like the base", name)
		}
	}

	pinnedFirst := strings.Replace(base, "    id INTEGER PRIMARY KEY,", "    pinned BOOLEAN NOT NULL DEFAULT FALSE,\n    id INTEGER PRIMARY KEY,", 1)
	if got, added := describeDDL(t, pinnedFirst, index), describeDDL(t, base, index, addPinned); !slices.Equal(got, added) {
		t.Errorf("a column added last and the same column declared first differ:\n%v\n%v", got, added)
	}
	reformatted := strings.NewReplacer("CREATE TABLE", "CREATE TABLE IF NOT EXISTS", ",\n", " ,  ", "(", " ( ", "-- the name", "/* the name */").Replace(base)
	if got := describeDDL(t, reformatted, "CREATE UNIQUE INDEX IF NOT EXISTS idx_things_name ON things (name);"); !slices.Equal(got, want) {
		t.Errorf("spaces and comments changed the description:\n%v\n%v", got, want)
	}
}

func TestOpenGivesANewDatabaseEveryUpdate(t *testing.T) {
	db := openTestDB(t)
	updates, err := Updates()
	if err != nil {
		t.Fatalf("Updates: %v", err)
	}
	if len(updates) == 0 || updates[0].Name != "baseline" {
		t.Fatalf("the program carries %v, want 0001-baseline first", versions(updates))
	}
	applied, err := AppliedUpdates(t.Context(), db)
	if err != nil {
		t.Fatalf("AppliedUpdates: %v", err)
	}
	if len(applied) != len(updates) {
		t.Errorf("a new database has %d updates applied, want %d", len(applied), len(updates))
	}
}

func TestOpenLeavesADatabaseMadeBeforeUpdates(t *testing.T) {
	updates, err := Updates()
	if err != nil {
		t.Fatal(err)
	}
	baseline := updates[0].sql
	for _, made := range []struct {
		name       string
		statements func() []string
	}{
		{"without the migrations table", func() []string { return []string{baseline} }},
		{"with an empty migrations table", func() []string { return []string{baseline, migrationsSchema} }},
	} {
		t.Run(made.name, func(t *testing.T) {
			path := filepath.Join(t.TempDir(), "hotel.db")
			old := connectTestDB(t, path)
			for _, statements := range made.statements() {
				if _, err := old.ExecContext(t.Context(), statements); err != nil {
					t.Fatal(err)
				}
			}
			insertHabbo(t, old, "krono@example.com", "Krono")
			before := describeSchema(t, old)
			old.Close()

			db, err := Open(path)
			if err != nil {
				t.Fatalf("Open: %v", err)
			}
			defer db.Close()
			if after := describeSchema(t, db); !slices.Equal(after, before) {
				t.Error("Open changed the tables of an existing database")
			}
			if n := countRows(t, db, "SELECT COUNT(*) FROM avatars"); n != 1 {
				t.Errorf("habbos = %d, want 1", n)
			}

			waiting, err := WaitingUpdates(t.Context(), db, updates)
			if err != nil || len(waiting) != len(updates) {
				t.Fatalf("waiting = %v, %v, want every update", versions(waiting), err)
			}
			if _, err := ApplyUpdates(t.Context(), db, waiting); err != nil {
				t.Fatalf("ApplyUpdates: %v", err)
			}
			if n := countRows(t, db, "SELECT COUNT(*) FROM avatars WHERE name = 'Krono'"); n != 1 {
				t.Errorf("habbos after the updates = %d, want Krono kept", n)
			}
		})
	}
}
