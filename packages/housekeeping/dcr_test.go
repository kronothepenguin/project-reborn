package housekeeping

import (
	"database/sql"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"slices"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// clientFolder writes files into dcr/ of the assets folder that config.json
// names, relative to the tests' working directory, and removes it afterwards.
func clientFolder(t *testing.T, files map[string]string) {
	t.Helper()
	dir := filepath.Join("assets", "dcr")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { os.RemoveAll("assets") })
	for name, content := range files {
		if err := os.WriteFile(filepath.Join(dir, name), []byte(content), 0o644); err != nil {
			t.Fatal(err)
		}
	}
}

// oldClientRows stands for what an earlier import left in the database.
func oldClientRows(t *testing.T, db *sql.DB) {
	t.Helper()
	q := store.New(db)
	if err := q.PutDCRVariable(t.Context(), store.PutDCRVariableParams{Key: "old.variable", Value: "1"}); err != nil {
		t.Fatal(err)
	}
	if err := q.PutDCRText(t.Context(), store.PutDCRTextParams{Key: "old_text", Value: "Old"}); err != nil {
		t.Fatal(err)
	}
}

func clientRows(t *testing.T, db *sql.DB) (variables, texts []string) {
	t.Helper()
	q := store.New(db)
	vs, err := q.ListDCRVariables(t.Context())
	if err != nil {
		t.Fatal(err)
	}
	for _, v := range vs {
		variables = append(variables, v.Key+"="+v.Value)
	}
	ts, err := q.ListDCRTexts(t.Context())
	if err != nil {
		t.Fatal(err)
	}
	for _, text := range ts {
		texts = append(texts, text.Key+"="+text.Value)
	}
	return variables, texts
}

func TestImportingClientFilesCopiesBothFiles(t *testing.T) {
	db, mux := newSite(t)
	adminID, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingDCR)
	oldClientRows(t, db)
	clientFolder(t, map[string]string{
		"external_variables.txt": "client.version.id=401\r\nsite.url=http://www.habbo.co.uk",
		"external_texts.txt":     "\xef\xbb\xbflogin_name=Name of your Habbo\r\nlogin_password=Password\r\nlogin_ok=OK\r\n",
	})

	rec := serve(mux, "POST", "/housekeeping/dcr/import", cookie, url.Values{})
	wantRedirect(t, rec, "/housekeeping/dcr?imported=1")

	variables, texts := clientRows(t, db)
	if want := []string{"client.version.id=401", "site.url=http://www.habbo.co.uk"}; !slices.Equal(variables, want) {
		t.Errorf("the variables = %q, want %q", variables, want)
	}
	if want := []string{"login_name=Name of your Habbo", "login_password=Password", "login_ok=OK"}; !slices.Equal(texts, want) {
		t.Errorf("the texts = %q, want %q", texts, want)
	}

	logs := staffLogs(t, db)
	if len(logs) != 1 {
		t.Fatalf("got %d staff log rows, want one for the import: %+v", len(logs), logs)
	}
	if got := logs[0]; got.Action != "dcr.import" || got.Detail != "2 variables, 3 texts" || got.UserID.Int64 != adminID {
		t.Errorf("the staff log row = %+v", got)
	}

	wantPage(t, serve(mux, "GET", rec.Header().Get("Location"), cookie, nil), http.StatusOK,
		"dcr.html", "The client files were imported.", "Variables:2 Texts:3")
}

func TestAMissingClientFileIsNamedAndChangesNothing(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingDCR)
	oldClientRows(t, db)
	clientFolder(t, map[string]string{"external_variables.txt": "client.version.id=401"})

	wantPage(t, serve(mux, "POST", "/housekeeping/dcr/import", cookie, url.Values{}), http.StatusUnprocessableEntity,
		"dcr.html", "external_texts.txt is missing from assets/dcr.", "Variables:1 Texts:1")

	variables, texts := clientRows(t, db)
	if !slices.Equal(variables, []string{"old.variable=1"}) || !slices.Equal(texts, []string{"old_text=Old"}) {
		t.Errorf("the database holds %q and %q, want the rows from before", variables, texts)
	}
	if got := len(staffLogs(t, db)); got != 0 {
		t.Errorf("got %d staff log rows, want none", got)
	}
}

func TestClientFilesTakeTheirAttribute(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Helper", auth.HousekeepingAccess, auth.HousekeepingSettings)
	oldClientRows(t, db)
	clientFolder(t, map[string]string{"external_variables.txt": "a=1", "external_texts.txt": "b=2"})

	wantPage(t, serve(mux, "GET", "/housekeeping/dcr", cookie, nil), http.StatusForbidden, "access-denied.html")
	wantPage(t, serve(mux, "POST", "/housekeeping/dcr/import", cookie, url.Values{}), http.StatusForbidden, "access-denied.html")

	variables, texts := clientRows(t, db)
	if !slices.Equal(variables, []string{"old.variable=1"}) || !slices.Equal(texts, []string{"old_text=Old"}) {
		t.Errorf("the database holds %q and %q, want the rows from before", variables, texts)
	}
	if got := len(staffLogs(t, db)); got != 0 {
		t.Errorf("got %d staff log rows, want none", got)
	}
}
