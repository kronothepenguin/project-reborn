package housekeeping

import (
	"database/sql"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

func herald(t *testing.T, db *sql.DB) (int64, *http.Cookie) {
	t.Helper()
	return staff(t, db, "Herald", auth.HousekeepingAccess, auth.HousekeepingAlerts)
}

func TestAlertsTakeTheAttribute(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Reader", auth.HousekeepingAccess, auth.HousekeepingUsers)
	habbo(t, db, "frank@example.com", "Frank")

	wantPage(t, serve(mux, "GET", "/housekeeping/alerts", cookie, nil), http.StatusForbidden, "access-denied.html")
	rec := serve(mux, "POST", "/housekeeping/alerts", cookie, url.Values{"username": {"Frank"}, "alert": {"Hello"}})
	wantPage(t, rec, http.StatusForbidden, "access-denied.html")
	if got := count(t, db, `SELECT COUNT(*) FROM alerts`); got != 0 {
		t.Errorf("%d alerts", got)
	}
}

func TestAlertingAHabbo(t *testing.T) {
	db, mux := newSite(t)
	actor, cookie := herald(t, db)
	userID := habbo(t, db, "frank@example.com", "Frank")
	id := habboOf(t, db, "Frank").ID

	rec := serve(mux, "POST", "/housekeeping/alerts", cookie, url.Values{"username": {"frank"}, "alert": {"Hello there"}})
	wantRedirect(t, rec, "/housekeeping/alerts?sent=1")

	alert, err := store.New(db).GetOldestAlert(t.Context(), id)
	if err != nil {
		t.Fatalf("GetOldestAlert: %v", err)
	}
	if alert.Message != "Hello there" || alert.SenderUserID.Int64 != actor {
		t.Errorf("alert = %+v", alert)
	}
	wantOneLog(t, db, "alerts.send", "", userID, id)
	wantPage(t, serve(mux, "GET", "/housekeeping/alerts?sent=1", cookie, nil), http.StatusOK,
		"alerts.html", "Gave alert to user.", "Habbo:Frank", "Alert:Hello there", "Type:Staff Message")
}

func TestAnAlertToNobodyIsRefused(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := herald(t, db)
	userID := habbo(t, db, "frank@example.com", "Frank")
	archived := secondHabbo(t, db, userID, "Retired")
	if _, err := db.ExecContext(t.Context(), `UPDATE avatars SET archived_at = ? WHERE id = ?`, testNow, archived.ID); err != nil {
		t.Fatalf("archive: %v", err)
	}

	for _, c := range []struct {
		name  string
		form  url.Values
		wants string
	}{
		{"an unknown habbo", url.Values{"username": {"Nobody"}, "alert": {"Hello"}}, "This user does not exist."},
		{"an archived habbo", url.Values{"username": {"Retired"}, "alert": {"Hello"}}, "This user does not exist."},
		{"a blank alert", url.Values{"username": {"Frank"}, "alert": {"   "}}, "Please do not leave the alert field blank."},
	} {
		t.Run(c.name, func(t *testing.T) {
			rec := serve(mux, "POST", "/housekeeping/alerts", cookie, c.form)
			wantPage(t, rec, http.StatusUnprocessableEntity, "alerts.html", c.wants, "Username:"+c.form.Get("username"))
		})
	}
	if got := count(t, db, `SELECT COUNT(*) FROM alerts`); got != 0 {
		t.Errorf("%d alerts", got)
	}
}

func TestStaffCanAlertUsersAboveThem(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := herald(t, db)
	ranked(t, db, "Above", 7)

	rec := serve(mux, "POST", "/housekeeping/alerts", cookie, url.Values{"username": {"Above"}, "alert": {"Hello"}})
	wantRedirect(t, rec, "/housekeeping/alerts?sent=1")
}

func TestAlertingEveryoneTakesItsOwnAttribute(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := herald(t, db)
	habbo(t, db, "frank@example.com", "Frank")

	wantPage(t, serve(mux, "GET", "/housekeeping/alerts", cookie, nil), http.StatusOK, "CanBroadcast:false")
	wantPage(t, serve(mux, "POST", "/housekeeping/alerts", cookie, url.Values{"everyone": {"Hello"}}), http.StatusForbidden, "access-denied.html")
	if got := count(t, db, `SELECT COUNT(*) FROM alerts`); got != 0 {
		t.Errorf("%d alerts", got)
	}
}

func TestAlertingEveryone(t *testing.T) {
	db, mux := newSite(t)
	actor, cookie := staff(t, db, "Herald", auth.HousekeepingAccess, auth.HousekeepingAlerts, auth.HousekeepingAlertsBroadcast)
	userID := habbo(t, db, "frank@example.com", "Frank")
	secondHabbo(t, db, userID, "FrankToo")
	archived := secondHabbo(t, db, userID, "Retired")
	if _, err := db.ExecContext(t.Context(), `UPDATE avatars SET archived_at = ? WHERE id = ?`, testNow, archived.ID); err != nil {
		t.Fatalf("archive: %v", err)
	}

	wantPage(t, serve(mux, "GET", "/housekeeping/alerts", cookie, nil), http.StatusOK, "CanBroadcast:true")
	rec := serve(mux, "POST", "/housekeeping/alerts", cookie, url.Values{"everyone": {"The hotel closes at nine"}})
	wantRedirect(t, rec, "/housekeeping/alerts?everyone=3")
	wantPage(t, serve(mux, "GET", "/housekeeping/alerts?everyone=3", cookie, nil), http.StatusOK, "Gave mass alert. Users processed: 3")

	if got := count(t, db, fmt.Sprintf(`SELECT COUNT(*) FROM alerts WHERE sender_user_id = %d`, actor)); got != 3 {
		t.Errorf("%d alerts, want 3", got)
	}
	if got := count(t, db, fmt.Sprintf(`SELECT COUNT(*) FROM alerts WHERE avatar_id = %d`, archived.ID)); got != 0 {
		t.Errorf("the archived habbo got %d alerts", got)
	}
	wantOneLog(t, db, "alerts.broadcast", "3", 0, 0)
}

func TestABlankMassAlertIsRefused(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Herald", auth.HousekeepingAccess, auth.HousekeepingAlerts, auth.HousekeepingAlertsBroadcast)

	rec := serve(mux, "POST", "/housekeeping/alerts", cookie, url.Values{"everyone": {""}})
	wantPage(t, rec, http.StatusUnprocessableEntity, "Please do not leave the alert field blank.")
	if got := count(t, db, `SELECT COUNT(*) FROM alerts`); got != 0 {
		t.Errorf("%d alerts", got)
	}
}

func TestTheListShowsAlertsNotDismissed(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := herald(t, db)
	habbo(t, db, "frank@example.com", "Frank")
	id := habboOf(t, db, "Frank").ID
	q := store.New(db)
	for _, message := range []string{"Message one", "Message two"} {
		err := q.CreateAlert(t.Context(), store.CreateAlertParams{AvatarID: id, Message: message, CreatedAt: testNow})
		if err != nil {
			t.Fatalf("CreateAlert: %v", err)
		}
	}
	first, err := q.GetOldestAlert(t.Context(), id)
	if err != nil {
		t.Fatalf("GetOldestAlert: %v", err)
	}
	if _, err := q.DismissAlert(t.Context(), store.DismissAlertParams{ID: first.ID, AvatarID: id, DismissedAt: sql.NullTime{Time: testNow, Valid: true}}); err != nil {
		t.Fatalf("DismissAlert: %v", err)
	}

	rec := serve(mux, "GET", "/housekeeping/alerts", cookie, nil)
	wantPage(t, rec, http.StatusOK, "Alert:Message two", "Type:System Message")
	if strings.Contains(rec.Body.String(), "Message one") {
		t.Error("the list shows a dismissed alert")
	}
}

func TestTheListComesInPagesOfAlerts(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := herald(t, db)
	habbo(t, db, "frank@example.com", "Frank")
	id := habboOf(t, db, "Frank").ID
	q := store.New(db)
	for i := range 101 {
		err := q.CreateAlert(t.Context(), store.CreateAlertParams{AvatarID: id, Message: fmt.Sprintf("Number %d;", i), CreatedAt: testNow})
		if err != nil {
			t.Fatalf("CreateAlert: %v", err)
		}
	}

	wantPage(t, serve(mux, "GET", "/housekeeping/alerts", cookie, nil), http.StatusOK, "Older:2 Newer:0", "Alert:Number 100;")
	rec := serve(mux, "GET", "/housekeeping/alerts?page=2", cookie, nil)
	wantPage(t, rec, http.StatusOK, "Older:0 Newer:1", "Alert:Number 0;")
	if strings.Contains(rec.Body.String(), "Number 100;") {
		t.Error("the second page repeats the first")
	}
}
