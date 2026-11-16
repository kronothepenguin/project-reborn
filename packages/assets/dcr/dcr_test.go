package dcr

import (
	"database/sql"
	"errors"
	"io/fs"
	"path/filepath"
	"strings"
	"testing"
	"testing/fstest"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

var hotel = Hotel{URL: "http://hotel.test/", ShortName: "Reborn", Version: 26}

func openDB(t *testing.T) (*sql.DB, *store.Queries) {
	t.Helper()
	db, err := store.Open(filepath.Join(t.TempDir(), "habbo.db"))
	if err != nil {
		t.Fatalf("store.Open: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	return db, store.New(db)
}

func clientFiles(variables, texts string) fstest.MapFS {
	return fstest.MapFS{
		"external_variables.txt": {Data: []byte(variables)},
		"external_texts.txt":     {Data: []byte(texts)},
	}
}

func crlf(lines ...string) string {
	return strings.Join(lines, "\r\n")
}

func importFiles(t *testing.T, db *sql.DB, q *store.Queries, files fs.FS) error {
	t.Helper()
	tx, err := db.BeginTx(t.Context(), nil)
	if err != nil {
		t.Fatalf("begin: %v", err)
	}
	defer tx.Rollback()
	if err := Import(t.Context(), q.WithTx(tx), files); err != nil {
		return err
	}
	if err := tx.Commit(); err != nil {
		t.Fatalf("commit: %v", err)
	}
	return nil
}

func variables(t *testing.T, q *store.Queries) string {
	t.Helper()
	data, err := Variables(t.Context(), q, hotel)
	if err != nil {
		t.Fatalf("Variables: %v", err)
	}
	return string(data)
}

func texts(t *testing.T, q *store.Queries) string {
	t.Helper()
	data, err := Texts(t.Context(), q, hotel)
	if err != nil {
		t.Fatalf("Texts: %v", err)
	}
	return string(data)
}

func TestTheClientGetsTheImportedVariablesWithTheHotelsAddressesAndVersion(t *testing.T) {
	db, q := openDB(t)
	files := clientFiles(crlf(
		"cast.entry.1=hh_entry_uk",
		"external.figurepartlist.txt=http://www.habbohotel.co.uk/gamedata/figuredata",
		"image.library.url=http://images.habbohotel.co.uk/c_images/",
		"client.version.id=401",
		"client.window.title=Habbo Hotel",
	), "\xef\xbb\xbfa=b\r\n")
	if err := importFiles(t, db, q, files); err != nil {
		t.Fatalf("Import: %v", err)
	}

	got := variables(t, q)

	want := crlf(
		"cast.entry.1=hh_entry_uk",
		"external.figurepartlist.txt=http://hotel.test/dcr/figuredata.txt",
		"image.library.url=http://hotel.test/c_images/",
		"client.version.id=26",
		"client.window.title=Habbo Hotel",
		"external.figurepartlist.txt.secure=http://hotel.test/dcr/figuredata.txt",
		"figure.draworder.xml=http://hotel.test/dcr/draworder.xml",
		"figure.draworder.xml.secure=http://hotel.test/dcr/draworder.xml",
		"figure.animation.xml=http://hotel.test/dcr/animation.xml",
		"figure.partsets.xml=http://hotel.test/dcr/partsets.xml",
		"dynamic.download.url=http://hotel.test/dcr/hof_furni/",
		"private.image.library.url=http://hotel.test/c_images/",
	)
	if got != want {
		t.Errorf("Variables =\n%q\nwant\n%q", got, want)
	}
}

func TestTheClientGetsTheImportedTextsWithEveryHabboAsTheShortName(t *testing.T) {
	db, q := openDB(t)
	files := clientFiles("a=b", "\xef\xbb\xbf"+crlf(
		"welcome=Welcome to Habbo Hotel!",
		"friends=Habbos you know, a Habbo's room",
		"# comment=Habbo",
		"Habbo_key=habbo stays",
		"",
	))
	if err := importFiles(t, db, q, files); err != nil {
		t.Fatalf("Import: %v", err)
	}

	got := texts(t, q)

	want := "\xef\xbb\xbf" + crlf(
		"welcome=Welcome to Reborn Hotel!",
		"friends=Reborns you know, a Reborn's room",
		"# comment=Reborn",
		"Habbo_key=habbo stays",
		"",
	)
	if got != want {
		t.Errorf("Texts =\n%q\nwant\n%q", got, want)
	}
}

func TestFilesWithNothingToReplaceComeBackAsTheyWereImported(t *testing.T) {
	db, q := openDB(t)
	variablesFile := crlf(
		"external.figurepartlist.txt=http://hotel.test/dcr/figuredata.txt",
		"external.figurepartlist.txt.secure=http://hotel.test/dcr/figuredata.txt",
		"figure.draworder.xml=http://hotel.test/dcr/draworder.xml",
		"figure.draworder.xml.secure=http://hotel.test/dcr/draworder.xml",
		"figure.animation.xml=http://hotel.test/dcr/animation.xml",
		"figure.partsets.xml=http://hotel.test/dcr/partsets.xml",
		"dynamic.download.url=http://hotel.test/dcr/hof_furni/",
		"image.library.url=http://hotel.test/c_images/",
		"private.image.library.url=http://hotel.test/c_images/",
		"client.version.id=26",
		"struct.font.plain=[#font:\"v\", #fontSize:9]",
	)
	textsFile := "\xef\xbb\xbf" + crlf("b=Café crème", "a=x=y", "")
	if err := importFiles(t, db, q, clientFiles(variablesFile, textsFile)); err != nil {
		t.Fatalf("Import: %v", err)
	}

	if got := variables(t, q); got != variablesFile {
		t.Errorf("Variables =\n%q\nwant\n%q", got, variablesFile)
	}
	if got := texts(t, q); got != textsFile {
		t.Errorf("Texts =\n%q\nwant\n%q", got, textsFile)
	}
}

func TestAnImportReplacesTheRowsOfTheLastOne(t *testing.T) {
	db, q := openDB(t)
	older := clientFiles(crlf("old=1", "kept=1"), "\xef\xbb\xbf"+crlf("old=1", "kept=1", ""))
	if err := importFiles(t, db, q, older); err != nil {
		t.Fatalf("first Import: %v", err)
	}
	newer := clientFiles(crlf("kept=2", "new=2"), "\xef\xbb\xbf"+crlf("kept=2", "new=2", ""))

	if err := importFiles(t, db, q, newer); err != nil {
		t.Fatalf("second Import: %v", err)
	}

	if got := texts(t, q); got != "\xef\xbb\xbf"+crlf("kept=2", "new=2", "") {
		t.Errorf("Texts = %q, want only the newer file", got)
	}
	got := variables(t, q)
	if !strings.HasPrefix(got, crlf("kept=2", "new=2", "external.")) || strings.Contains(got, "old=") {
		t.Errorf("Variables = %q, want only the newer file and the generated lines", got)
	}
}

func TestAnImportWithAMissingFileIsRefusedAndKeepsTheRows(t *testing.T) {
	for _, missing := range []string{"external_variables.txt", "external_texts.txt"} {
		t.Run(missing, func(t *testing.T) {
			db, q := openDB(t)
			if err := importFiles(t, db, q, clientFiles("kept=1", "\xef\xbb\xbfkept=1\r\n")); err != nil {
				t.Fatalf("first Import: %v", err)
			}
			before := variables(t, q) + texts(t, q)
			files := clientFiles("new=2", "\xef\xbb\xbfnew=2\r\n")
			delete(files, missing)

			err := importFiles(t, db, q, files)

			if err == nil {
				t.Fatal("Import succeeded, want refused")
			}
			if !errors.Is(err, fs.ErrNotExist) || !strings.Contains(err.Error(), missing) {
				t.Errorf("error = %v, want one naming %s as missing", err, missing)
			}
			if after := variables(t, q) + texts(t, q); after != before {
				t.Errorf("rows changed:\n%q\nwant\n%q", after, before)
			}
		})
	}
}
