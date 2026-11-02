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

func helper(t *testing.T, db *sql.DB) (int64, *http.Cookie) {
	t.Helper()
	return staff(t, db, "Helper", auth.HousekeepingAccess, auth.HousekeepingHelp, auth.HousekeepingAlerts)
}

func ticket(t *testing.T, db *sql.DB, avatarID int64, subject string) int64 {
	t.Helper()
	result, err := db.ExecContext(t.Context(),
		`INSERT INTO help_tickets (avatar_id, subject, message, ip, created_at) VALUES (?, ?, 'My credits are gone', '10.0.0.7', ?)`,
		avatarID, subject, testNow)
	if err != nil {
		t.Fatalf("insert ticket: %v", err)
	}
	id, err := result.LastInsertId()
	if err != nil {
		t.Fatalf("LastInsertId: %v", err)
	}
	return id
}

func ticketRow(t *testing.T, db *sql.DB, id int64) store.GetHelpTicketRow {
	t.Helper()
	row, err := store.New(db).GetHelpTicket(t.Context(), id)
	if err != nil {
		t.Fatalf("GetHelpTicket: %v", err)
	}
	return row
}

func pickPath(id int64) string {
	return fmt.Sprintf("/housekeeping/help/%d/pick", id)
}

func closePath(id int64) string {
	return fmt.Sprintf("/housekeeping/help/%d/close", id)
}

var button = url.Values{"x": {"1"}}

func TestHelpTakesTheAttribute(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Reader", auth.HousekeepingAccess, auth.HousekeepingUsers)
	habbo(t, db, "frank@example.com", "Frank")
	id := ticket(t, db, habboOf(t, db, "Frank").ID, "Lost")

	wantPage(t, serve(mux, "GET", "/housekeeping/help", cookie, nil), http.StatusForbidden, "access-denied.html")
	wantPage(t, serve(mux, "GET", fmt.Sprintf("/housekeeping/help/%d", id), cookie, nil), http.StatusForbidden, "access-denied.html")
	wantPage(t, serve(mux, "POST", pickPath(id), cookie, button), http.StatusForbidden, "access-denied.html")
	wantPage(t, serve(mux, "POST", closePath(id), cookie, button), http.StatusForbidden, "access-denied.html")
	if ticketRow(t, db, id).PickedUpAt.Valid {
		t.Error("the ticket was picked up")
	}
}

func TestTheQueueShowsWhatIsNotClosed(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := helper(t, db)
	habbo(t, db, "frank@example.com", "Frank")
	avatar := habboOf(t, db, "Frank").ID
	ticket(t, db, avatar, "Subject one")
	closed := ticket(t, db, avatar, "Subject two")
	if _, err := db.ExecContext(t.Context(), `UPDATE help_tickets SET picked_up_at = ?, closed_at = ? WHERE id = ?`, testNow, testNow, closed); err != nil {
		t.Fatalf("close: %v", err)
	}

	rec := serve(mux, "GET", "/housekeeping/help", cookie, nil)
	wantPage(t, rec, http.StatusOK, "help.html", "Subject:Subject one", "Habbo:Frank", "PickedUp:false")
	if strings.Contains(rec.Body.String(), "Subject two") {
		t.Error("the queue shows a closed ticket")
	}
}

func TestTheQueueShowsANewerTicketFirstInPages(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := helper(t, db)
	habbo(t, db, "frank@example.com", "Frank")
	avatar := habboOf(t, db, "Frank").ID
	for i := range 101 {
		ticket(t, db, avatar, fmt.Sprintf("Number %d;", i))
	}

	wantPage(t, serve(mux, "GET", "/housekeeping/help", cookie, nil), http.StatusOK, "Older:2 Newer:0", "Subject:Number 100;")
	wantPage(t, serve(mux, "GET", "/housekeeping/help?page=2", cookie, nil), http.StatusOK, "Older:0 Newer:1", "Subject:Number 0;")
}

func TestPickingUpATicket(t *testing.T) {
	db, mux := newSite(t)
	actor, cookie := helper(t, db)
	userID := habbo(t, db, "frank@example.com", "Frank")
	avatar := habboOf(t, db, "Frank").ID
	id := ticket(t, db, avatar, "Lost")

	wantRedirect(t, serve(mux, "POST", pickPath(id), cookie, button), "/housekeeping/help?picked=1")
	wantPage(t, serve(mux, "GET", "/housekeeping/help?picked=1", cookie, nil), http.StatusOK, "Help query picked up successfully.", "PickedUp:true")

	row := ticketRow(t, db, id)
	if !row.PickedUpAt.Valid || row.PickedUpByUserID.Int64 != actor {
		t.Errorf("ticket = %+v", row)
	}
	wantOneLog(t, db, "help.pick", fmt.Sprint(id), userID, avatar)

	rec := serve(mux, "POST", pickPath(id), cookie, button)
	wantPage(t, rec, http.StatusUnprocessableEntity, "help.html", "Invalid ID specified or already picked up.")
	if rows := logsOf(t, db, "help.pick"); len(rows) != 1 {
		t.Errorf("%d log rows, want 1", len(rows))
	}
	wantPage(t, serve(mux, "POST", pickPath(999), cookie, button), http.StatusUnprocessableEntity, "Invalid ID specified or already picked up.")
}

func TestClosingATicket(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := helper(t, db)
	userID := habbo(t, db, "frank@example.com", "Frank")
	avatar := habboOf(t, db, "Frank").ID
	id := ticket(t, db, avatar, "Lost")

	rec := serve(mux, "POST", closePath(id), cookie, button)
	wantPage(t, rec, http.StatusUnprocessableEntity, "help.html", "must be picked up before they can be closed")
	if ticketRow(t, db, id).ClosedAt.Valid {
		t.Error("a ticket nobody picked up was closed")
	}

	serve(mux, "POST", pickPath(id), cookie, button)
	wantRedirect(t, serve(mux, "POST", closePath(id), cookie, button), "/housekeeping/help?closed=1")
	wantPage(t, serve(mux, "GET", "/housekeeping/help?closed=1", cookie, nil), http.StatusOK, "Help query closed successfully.")
	if !ticketRow(t, db, id).ClosedAt.Valid {
		t.Error("the ticket stayed open")
	}
	wantOneLog(t, db, "help.close", fmt.Sprint(id), userID, avatar)

	wantPage(t, serve(mux, "POST", closePath(id), cookie, button), http.StatusUnprocessableEntity, "must be picked up")
	wantPage(t, serve(mux, "POST", closePath(999), cookie, button), http.StatusUnprocessableEntity, "must be picked up")
	if rows := logsOf(t, db, "help.close"); len(rows) != 1 {
		t.Errorf("%d log rows, want 1", len(rows))
	}
}

func TestAClosedTicketCannotBePickedUp(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := helper(t, db)
	habbo(t, db, "frank@example.com", "Frank")
	id := ticket(t, db, habboOf(t, db, "Frank").ID, "Lost")
	if _, err := db.ExecContext(t.Context(), `UPDATE help_tickets SET closed_at = ? WHERE id = ?`, testNow, id); err != nil {
		t.Fatalf("close: %v", err)
	}

	wantPage(t, serve(mux, "POST", pickPath(id), cookie, button), http.StatusUnprocessableEntity, "already picked up")
	wantPage(t, serve(mux, "POST", pickPath(id), cookie, url.Values{"reply": {"1"}}), http.StatusUnprocessableEntity, "already picked up")
	if ticketRow(t, db, id).PickedUpAt.Valid {
		t.Error("a closed ticket was picked up")
	}
}

func TestReadingOneTicket(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := helper(t, db)
	habbo(t, db, "frank@example.com", "Frank")
	id := ticket(t, db, habboOf(t, db, "Frank").ID, "Lost")
	path := fmt.Sprintf("/housekeeping/help/%d", id)

	rec := serve(mux, "GET", path, cookie, nil)
	wantPage(t, rec, http.StatusOK, "help/id.html", "Subject:Lost", "Habbo:Frank", "Text:My credits are gone")
	if strings.Contains(rec.Body.String(), "10.0.0.7") {
		t.Error("the page shows the address without housekeeping.usersPrivate")
	}
	wantPage(t, serve(mux, "GET", "/housekeeping/help/999", cookie, nil), http.StatusNotFound)
	wantPage(t, serve(mux, "GET", "/housekeeping/help/nonsense", cookie, nil), http.StatusNotFound)

	_, seer := staff(t, db, "Seer", auth.HousekeepingAccess, auth.HousekeepingHelp, auth.HousekeepingUsersPrivate)
	wantPage(t, serve(mux, "GET", path, seer, nil), http.StatusOK, "IP:10.0.0.7")
}

func TestQuickReply(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := helper(t, db)
	userID := habbo(t, db, "frank@example.com", "Frank")
	avatar := habboOf(t, db, "Frank").ID
	id := ticket(t, db, avatar, "Lost")
	form := url.Values{"reply": {"1"}}

	location := fmt.Sprintf("/housekeeping/alerts?reply=%d", id)
	wantRedirect(t, serve(mux, "POST", pickPath(id), cookie, form), location)
	if !ticketRow(t, db, id).PickedUpAt.Valid {
		t.Error("Quick Reply did not pick the ticket up")
	}
	wantOneLog(t, db, "help.pick", fmt.Sprint(id), userID, avatar)

	date := testNow.UTC().Format("02-01-2006 15:04:05")
	wantPage(t, serve(mux, "GET", location, cookie, nil), http.StatusOK, "Username:Frank",
		"Hello, my name is Helper. I am sending you this message in reply to your help inquiry sent on "+date+", with the subject &#39;Lost&#39;.",
		"Helper\n", "Player Support")

	wantRedirect(t, serve(mux, "POST", pickPath(id), cookie, form), location)
	if rows := logsOf(t, db, "help.pick"); len(rows) != 1 {
		t.Errorf("%d log rows, want 1", len(rows))
	}
}

func TestQuickReplyTakesTheAlertsAttribute(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Helper", auth.HousekeepingAccess, auth.HousekeepingHelp)
	habbo(t, db, "frank@example.com", "Frank")
	id := ticket(t, db, habboOf(t, db, "Frank").ID, "Lost")

	wantPage(t, serve(mux, "GET", "/housekeeping/help", cookie, nil), http.StatusOK, "CanReply:false")
	wantPage(t, serve(mux, "POST", pickPath(id), cookie, url.Values{"reply": {"1"}}), http.StatusForbidden, "access-denied.html")
	if ticketRow(t, db, id).PickedUpAt.Valid {
		t.Error("a refused reply picked the ticket up")
	}
}

func TestTheAlertFormHidesATicketFromThoseWhoCannotReadIt(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Herald", auth.HousekeepingAccess, auth.HousekeepingAlerts)
	habbo(t, db, "frank@example.com", "Frank")
	id := ticket(t, db, habboOf(t, db, "Frank").ID, "Lost")

	rec := serve(mux, "GET", fmt.Sprintf("/housekeeping/alerts?reply=%d", id), cookie, nil)
	wantPage(t, rec, http.StatusOK, "alerts.html")
	if strings.Contains(rec.Body.String(), "Lost") {
		t.Error("the form shows a ticket without housekeeping.help")
	}
}

func TestRefreshingTheOverview(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := helper(t, db)

	wantPage(t, serve(mux, "GET", "/housekeeping/help?refreshed=1", cookie, nil), http.StatusOK, "Overview refreshed.")
}
