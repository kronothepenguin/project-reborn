package housekeeping

import (
	"database/sql"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

func addLog(t *testing.T, db *sql.DB, params store.CreateStaffLogParams) {
	t.Helper()
	params.CreatedAt = testNow
	if err := store.New(db).CreateStaffLog(t.Context(), params); err != nil {
		t.Fatalf("CreateStaffLog: %v", err)
	}
}

func id(value int64) sql.NullInt64 {
	return sql.NullInt64{Int64: value, Valid: true}
}

func TestStaffWithoutTheAttributeSeeAccessDenied(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Helper", auth.HousekeepingAccess)
	wantPage(t, serve(mux, "GET", "/housekeeping/logs", cookie, nil), http.StatusForbidden, "access-denied.html", "Habbo:Helper")
}

func TestLogsShowWhoDidWhatToWhom(t *testing.T) {
	db, mux := newSite(t)
	adminID, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingLogs)
	targetID := habbo(t, db, "target@example.com", "Target")
	addLog(t, db, store.CreateStaffLogParams{UserID: id(adminID), Action: "settings.update", Detail: "site.name", IP: "10.0.0.1"})
	addLog(t, db, store.CreateStaffLogParams{UserID: id(adminID), TargetUserID: id(targetID), Action: "accessGroups.addMember", Detail: "Staff", IP: "10.0.0.2"})

	rec := serve(mux, "GET", "/housekeeping/logs", cookie, nil)
	wantPage(t, rec, http.StatusOK, "logs.html",
		fmt.Sprintf("{Action:settings.update User:Admin (ID: %d) Target:N/A Detail:site.name IP:10.0.0.1 Date:27-10-2026 21:00:00}", adminID),
		fmt.Sprintf("{Action:accessGroups.addMember User:Admin (ID: %d) Target:Target (ID: %d) Detail:Staff IP:10.0.0.2", adminID, targetID))
	if body := rec.Body.String(); strings.Index(body, "accessGroups.addMember") > strings.Index(body, "settings.update") {
		t.Errorf("the newest row does not come first: %s", body)
	}
}

// A log outlives the accounts it names.
func TestLogsKeepTheirRowsWhenTheAccountsGo(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingLogs)
	goneID := habbo(t, db, "gone@example.com", "Gone")
	addLog(t, db, store.CreateStaffLogParams{UserID: id(goneID), TargetUserID: id(goneID), Action: "settings.update", IP: "10.0.0.1"})
	if _, err := db.ExecContext(t.Context(), `DELETE FROM users WHERE id = ?`, goneID); err != nil {
		t.Fatalf("delete the user: %v", err)
	}
	wantPage(t, serve(mux, "GET", "/housekeeping/logs", cookie, nil), http.StatusOK, "User:N/A Target:N/A")
}

func TestLogsComeInPages(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingLogs)
	for i := range 101 {
		addLog(t, db, store.CreateStaffLogParams{Action: fmt.Sprintf("row.%d", i), IP: "10.0.0.1"})
	}
	shown := regexp.MustCompile(`Action:row\.\d+ `)
	rows := func(path string) int {
		t.Helper()
		return len(shown.FindAllString(serve(mux, "GET", path, cookie, nil).Body.String(), -1))
	}

	first := serve(mux, "GET", "/housekeeping/logs", cookie, nil)
	wantPage(t, first, http.StatusOK, "Action:row.100 ", "Older:2 Newer:0")
	if got := rows("/housekeeping/logs"); got != 100 {
		t.Errorf("the first page has %d rows, want 100", got)
	}

	second := serve(mux, "GET", "/housekeeping/logs?page=2", cookie, nil)
	wantPage(t, second, http.StatusOK, "Action:row.0 ", "Older:0 Newer:1")
	if got := rows("/housekeeping/logs?page=2"); got != 1 {
		t.Errorf("the second page has %d rows, want 1", got)
	}

	for _, path := range []string{"/housekeeping/logs?page=0", "/housekeeping/logs?page=x", "/housekeeping/logs?page=-1"} {
		if got := rows(path); got != 100 {
			t.Errorf("%s has %d rows, want the first page", path, got)
		}
		wantPage(t, serve(mux, "GET", path, cookie, nil), http.StatusOK, "Older:2 Newer:0")
	}
	for _, path := range []string{"/housekeeping/logs?page=3", "/housekeeping/logs?page=9223372036854775807"} {
		if got := rows(path); got != 1 {
			t.Errorf("%s has %d rows, want the last page", path, got)
		}
		wantPage(t, serve(mux, "GET", path, cookie, nil), http.StatusOK, "Older:0 Newer:1")
	}
}

func TestAnEmptyLogHasOnePage(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingLogs)
	wantPage(t, serve(mux, "GET", "/housekeeping/logs", cookie, nil), http.StatusOK, "Logs:[] Older:0 Newer:0")
}

func TestThereIsNoWayToPruneTheLog(t *testing.T) {
	db, mux := newSite(t)
	adminID, cookie := staff(t, db, "Admin", auth.HousekeepingAccess, auth.HousekeepingLogs)
	addLog(t, db, store.CreateStaffLogParams{UserID: id(adminID), Action: "settings.update", IP: "10.0.0.1"})

	for _, request := range []struct{ method, path string }{
		{"GET", "/housekeeping/logs?do=prune"},
		{"POST", "/housekeeping/logs"},
		{"POST", "/housekeeping/logs/prune"},
	} {
		serve(mux, request.method, request.path, cookie, nil)
		count, err := store.New(db).CountStaffLogs(t.Context())
		if err != nil {
			t.Fatalf("CountStaffLogs: %v", err)
		}
		if count != 1 {
			t.Fatalf("%s %s left %d rows", request.method, request.path, count)
		}
	}
}
