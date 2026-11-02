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

// ranked is staff whose group has level, signed in, because staff act only on the
// users below them.
func ranked(t *testing.T, db *sql.DB, name string, level int64, attributes ...auth.Attribute) (int64, *http.Cookie) {
	t.Helper()
	userID := habbo(t, db, strings.ToLower(name)+"@example.com", name)
	group := grant(t, db, userID, attributes...)
	if _, err := db.ExecContext(t.Context(), `UPDATE access_groups SET level = ? WHERE id = ?`, level, group); err != nil {
		t.Fatalf("set level: %v", err)
	}
	return userID, login(t, db, name)
}

func editor(t *testing.T, db *sql.DB) (int64, *http.Cookie) {
	t.Helper()
	return ranked(t, db, "Editor", 4, auth.HousekeepingAccess, auth.HousekeepingUsers, auth.HousekeepingUsersEdit)
}

func logsOf(t *testing.T, db *sql.DB, action string) []store.ListStaffLogsRow {
	t.Helper()
	var rows []store.ListStaffLogsRow
	for _, row := range staffLogs(t, db) {
		if row.Action == action {
			rows = append(rows, row)
		}
	}
	return rows
}

func wantOneLog(t *testing.T, db *sql.DB, action, detail string, targetUser, targetAvatar int64) {
	t.Helper()
	rows, err := db.QueryContext(t.Context(),
		`SELECT detail, target_user_id, target_avatar_id, user_id FROM staff_logs WHERE action = ?`, action)
	if err != nil {
		t.Fatalf("read log: %v", err)
	}
	defer rows.Close()
	found := 0
	for rows.Next() {
		var got string
		var user, avatar, actor sql.NullInt64
		if err := rows.Scan(&got, &user, &avatar, &actor); err != nil {
			t.Fatalf("scan log: %v", err)
		}
		found++
		if got != detail || user.Int64 != targetUser || avatar.Int64 != targetAvatar || !actor.Valid {
			t.Errorf("log %s = %q user %d habbo %d actor %v, want %q user %d habbo %d", action, got, user.Int64, avatar.Int64, actor, detail, targetUser, targetAvatar)
		}
	}
	if found != 1 {
		t.Errorf("%d rows of %s, want 1", found, action)
	}
}

func TestEditingTakesTheAttribute(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := ranked(t, db, "Reader", 4, auth.HousekeepingAccess, auth.HousekeepingUsers)
	userID := habbo(t, db, "frank@example.com", "Frank")
	id := habboOf(t, db, "Frank").ID

	rec := serve(mux, "POST", habboURL(id), cookie, url.Values{"motto": {"Changed"}})
	wantPage(t, rec, http.StatusForbidden, "access-denied.html")
	rec = serve(mux, "POST", fmt.Sprintf("/housekeeping/users/%d", userID), cookie, url.Values{"habbo": {fmt.Sprint(id)}})
	wantPage(t, rec, http.StatusForbidden, "access-denied.html")
	if got := habboOf(t, db, "Frank").Motto; got == "Changed" {
		t.Error("the motto changed without the attribute")
	}
}

func TestEditingAHabbo(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := editor(t, db)
	userID := habbo(t, db, "frank@example.com", "Frank")
	id := habboOf(t, db, "Frank").ID

	rec := serve(mux, "POST", habboURL(id), cookie, url.Values{
		"motto":  {"Hello"},
		"figure": {"hd-190-2.ch-215-82"},
		"gender": {"F"},
	})
	wantRedirect(t, rec, habboURL(id)+"?saved=1")

	got := habboOf(t, db, "Frank")
	if got.Motto != "Hello" || got.Figure != "hd-190-2.ch-215-82" || got.Gender != "F" {
		t.Errorf("habbo = %+v", got)
	}
	wantOneLog(t, db, "habbos.update", "motto, figure, gender", userID, id)
	wantPage(t, serve(mux, "GET", habboURL(id)+"?saved=1", cookie, nil), http.StatusOK, "User updated successfully.")
}

func TestABlankFieldKeepsItsValue(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := editor(t, db)
	habbo(t, db, "frank@example.com", "Frank")
	id := habboOf(t, db, "Frank").ID

	serve(mux, "POST", habboURL(id), cookie, url.Values{"motto": {"Hello"}})
	rec := serve(mux, "POST", habboURL(id), cookie, url.Values{"motto": {""}, "figure": {""}, "gender": {""}})
	wantRedirect(t, rec, habboURL(id)+"?saved=1")
	if got := habboOf(t, db, "Frank"); got.Motto != "Hello" || got.Figure != "hd-180-1" || got.Gender != "M" {
		t.Errorf("habbo = %+v", got)
	}
}

func TestOnlyListedFieldsAreEdited(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := editor(t, db)
	userID := habbo(t, db, "frank@example.com", "Frank")
	id := habboOf(t, db, "Frank").ID
	wallet, err := store.New(db).GetWallet(t.Context(), userID)
	if err != nil {
		t.Fatalf("GetWallet: %v", err)
	}

	serve(mux, "POST", habboURL(id), cookie, url.Values{"name": {"Renamed"}, "user_id": {"1"}, "id": {"1"}})
	serve(mux, "POST", fmt.Sprintf("/housekeeping/users/%d", userID), cookie, url.Values{
		"habbo":   {fmt.Sprint(id)},
		"credits": {"999999"},
		"level":   {"9"},
	})

	if got := habboOf(t, db, "Frank"); got.ID != id || got.UserID != userID {
		t.Errorf("habbo = %+v", got)
	}
	after, err := store.New(db).GetWallet(t.Context(), userID)
	if err != nil {
		t.Fatalf("GetWallet: %v", err)
	}
	if after.Credits != wallet.Credits {
		t.Errorf("credits = %d, want %d", after.Credits, wallet.Credits)
	}
}

func TestABadHabboIsRefused(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := editor(t, db)
	habbo(t, db, "frank@example.com", "Frank")
	id := habboOf(t, db, "Frank").ID

	for _, c := range []struct {
		name string
		form url.Values
		want string
	}{
		{"a long motto", url.Values{"motto": {strings.Repeat("é", 39)}}, "too long"},
		{"a bad figure", url.Values{"figure": {`"><script>`}}, "not valid"},
		{"a bad gender", url.Values{"gender": {"X"}}, "not valid"},
	} {
		t.Run(c.name, func(t *testing.T) {
			wantPage(t, serve(mux, "POST", habboURL(id), cookie, c.form), http.StatusUnprocessableEntity, "habbos/id.html", c.want)
			if got := habboOf(t, db, "Frank"); got.Motto != "" || got.Figure != "hd-180-1" || got.Gender != "M" {
				t.Errorf("habbo = %+v", got)
			}
		})
	}
	if rows := logsOf(t, db, "habbos.update"); len(rows) != 0 {
		t.Errorf("%d log rows for refused changes", len(rows))
	}
	wantRedirect(t, serve(mux, "POST", habboURL(id), cookie, url.Values{"motto": {strings.Repeat("é", 38)}}), habboURL(id)+"?saved=1")
}

func TestEditingAUser(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := ranked(t, db, "Editor", 4, auth.HousekeepingAccess, auth.HousekeepingUsers, auth.HousekeepingUsersEdit, auth.HousekeepingUsersPrivate)
	userID := habbo(t, db, "frank@example.com", "Frank")
	id := habboOf(t, db, "Frank").ID

	rec := serve(mux, "POST", fmt.Sprintf("/housekeeping/users/%d", userID), cookie, url.Values{
		"habbo":      {fmt.Sprint(id)},
		"email":      {"new@example.com"},
		"bornOn":     {"1991-06-02"},
		"newsletter": {"1"},
		"tickets":    {"7"},
		"film":       {"3"},
	})
	wantRedirect(t, rec, habboURL(id)+"?saved=1")

	q := store.New(db)
	user, err := q.GetUser(t.Context(), userID)
	if err != nil {
		t.Fatalf("GetUser: %v", err)
	}
	if user.Email != "new@example.com" || user.BornOn.Format("2006-01-02") != "1991-06-02" || !user.Newsletter {
		t.Errorf("user = %+v", user)
	}
	wallet, err := q.GetWallet(t.Context(), userID)
	if err != nil {
		t.Fatalf("GetWallet: %v", err)
	}
	if wallet.Tickets != 7 || wallet.Film != 3 {
		t.Errorf("wallet = %+v", wallet)
	}
	wantOneLog(t, db, "users.update", "email, birth date, newsletter, tickets, film", userID, id)
}

func TestEmailsTakeThePrivateAttribute(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := editor(t, db)
	userID := habbo(t, db, "frank@example.com", "Frank")
	id := habboOf(t, db, "Frank").ID

	rec := serve(mux, "POST", fmt.Sprintf("/housekeeping/users/%d", userID), cookie, url.Values{
		"habbo":  {fmt.Sprint(id)},
		"email":  {"mine@example.com"},
		"bornOn": {"1991-06-02"},
	})
	wantRedirect(t, rec, habboURL(id)+"?saved=1")

	user, err := store.New(db).GetUser(t.Context(), userID)
	if err != nil {
		t.Fatalf("GetUser: %v", err)
	}
	if user.Email != "frank@example.com" || user.BornOn.Format("2006-01-02") != "1990-05-01" {
		t.Errorf("user = %+v", user)
	}
}

func TestABadUserIsRefused(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := ranked(t, db, "Editor", 4, auth.HousekeepingAccess, auth.HousekeepingUsers, auth.HousekeepingUsersEdit, auth.HousekeepingUsersPrivate)
	userID := habbo(t, db, "frank@example.com", "Frank")
	habbo(t, db, "other@example.com", "Other")
	id := habboOf(t, db, "Frank").ID
	path := fmt.Sprintf("/housekeeping/users/%d", userID)

	for _, c := range []struct {
		name string
		form url.Values
		want string
	}{
		{"a bad email", url.Values{"email": {"not an email"}}, "Invalid e-mail address"},
		{"a taken email", url.Values{"email": {"OTHER@example.com"}}, "already has an account"},
		{"a bad date", url.Values{"bornOn": {"05/01/1990"}}, "valid date of birth"},
		{"a date to come", url.Values{"bornOn": {"2999-01-01"}}, "valid date of birth"},
		{"negative tickets", url.Values{"tickets": {"-1"}}, "Tickets and film"},
		{"tickets past the limit", url.Values{"tickets": {"2147483648"}}, "Tickets and film"},
		{"film that is no number", url.Values{"film": {"many"}}, "Tickets and film"},
	} {
		t.Run(c.name, func(t *testing.T) {
			c.form.Set("habbo", fmt.Sprint(id))
			wantPage(t, serve(mux, "POST", path, cookie, c.form), http.StatusUnprocessableEntity, "habbos/id.html", c.want)
		})
	}
	if rows := logsOf(t, db, "users.update"); len(rows) != 0 {
		t.Errorf("%d log rows for refused changes", len(rows))
	}
	user, err := store.New(db).GetUser(t.Context(), userID)
	if err != nil {
		t.Fatalf("GetUser: %v", err)
	}
	if user.Email != "frank@example.com" {
		t.Errorf("email = %s", user.Email)
	}
}

func TestTheFormNamesOneOfTheUsersHabbos(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := editor(t, db)
	userID := habbo(t, db, "frank@example.com", "Frank")
	habbo(t, db, "other@example.com", "Other")
	path := fmt.Sprintf("/housekeeping/users/%d", userID)

	wantPage(t, serve(mux, "POST", path, cookie, url.Values{"habbo": {fmt.Sprint(habboOf(t, db, "Other").ID)}}), http.StatusNotFound)
	wantPage(t, serve(mux, "POST", path, cookie, url.Values{"habbo": {"nonsense"}}), http.StatusNotFound)
	wantPage(t, serve(mux, "POST", "/housekeeping/users/999", cookie, url.Values{"habbo": {fmt.Sprint(habboOf(t, db, "Frank").ID)}}), http.StatusNotFound)
}

func TestStaffEditOnlyUsersBelowThem(t *testing.T) {
	db, mux := newSite(t)
	actor, cookie := editor(t, db)
	peer, _ := ranked(t, db, "Peer", 4)
	above, _ := ranked(t, db, "Above", 5)
	lower, _ := ranked(t, db, "Lower", 3)

	for _, c := range []struct {
		name   string
		habbo  string
		userID int64
		saved  bool
	}{
		{"a peer", "Peer", peer, false},
		{"someone above", "Above", above, false},
		{"themselves", "Editor", actor, false},
		{"someone below", "Lower", lower, true},
	} {
		t.Run(c.name, func(t *testing.T) {
			id := habboOf(t, db, c.habbo).ID
			paths := []struct {
				path string
				form url.Values
			}{
				{habboURL(id), url.Values{"motto": {"Touched"}}},
				{fmt.Sprintf("/housekeeping/users/%d", c.userID), url.Values{"habbo": {fmt.Sprint(id)}, "tickets": {"9"}}},
			}
			for _, p := range paths {
				rec := serve(mux, "POST", p.path, cookie, p.form)
				if c.saved {
					wantRedirect(t, rec, habboURL(id)+"?saved=1")
					continue
				}
				wantPage(t, rec, http.StatusUnprocessableEntity, "habbos/id.html", "below your level")
			}
			if touched := habboOf(t, db, c.habbo).Motto == "Touched"; touched != c.saved {
				t.Errorf("the habbo was touched: %t", touched)
			}
		})
	}
	if rows := logsOf(t, db, "users.refused"); len(rows) != 6 {
		t.Errorf("%d refusals logged, want 6", len(rows))
	}
}

func TestDirectAttributesDoNotRaiseAnEditor(t *testing.T) {
	db, mux := newSite(t)
	userID := habbo(t, db, "editor@example.com", "Editor")
	for _, attribute := range []auth.Attribute{auth.HousekeepingAccess, auth.HousekeepingUsers, auth.HousekeepingUsersEdit} {
		err := store.New(db).AddUserAttribute(t.Context(), store.AddUserAttributeParams{UserID: userID, Attribute: string(attribute), GrantedAt: testNow})
		if err != nil {
			t.Fatalf("AddUserAttribute: %v", err)
		}
	}
	cookie := login(t, db, "Editor")
	habbo(t, db, "frank@example.com", "Frank")

	rec := serve(mux, "POST", habboURL(habboOf(t, db, "Frank").ID), cookie, url.Values{"motto": {"Touched"}})
	wantPage(t, rec, http.StatusUnprocessableEntity, "below your level")
}

func TestTheHabboPageShowsFormsToEditorsAlone(t *testing.T) {
	db, mux := newSite(t)
	_, reader := ranked(t, db, "Reader", 4, auth.HousekeepingAccess, auth.HousekeepingUsers)
	_, cookie := editor(t, db)
	habbo(t, db, "frank@example.com", "Frank")
	id := habboOf(t, db, "Frank").ID

	wantPage(t, serve(mux, "GET", habboURL(id), reader, nil), http.StatusOK, "CanEdit:false")
	wantPage(t, serve(mux, "GET", habboURL(id), cookie, nil), http.StatusOK, "CanEdit:true")
}
