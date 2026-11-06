package cms

import (
	"database/sql"
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

const (
	askReport     = "Result:Is the post you have selected offensive or breaking the rules? Are you sure you want to report this post? Ask:true"
	reportedPost  = "Result:Thank you for reporting this post. Ask:false"
	waitingReport = "Result:Unable to report post: you still have a pending support request. Please try again later. Note that post reports also count as support requests. Ask:false"
	invalidPost   = "Result:Invalid post specified Ask:false"
)

func reportWindow(mux *http.ServeMux, cookie *http.Cookie, post any, query string) *httptest.ResponseRecorder {
	return serve(mux, "GET", fmt.Sprintf("/forum/posts/%v/report%s", post, query), cookie, nil)
}

func reportPost(mux *http.ServeMux, cookie *http.Cookie, post any, page string) *httptest.ResponseRecorder {
	return serve(mux, "POST", fmt.Sprintf("/forum/posts/%v/report", post), cookie, url.Values{"page": {page}})
}

func TestTheReportFlagShowsOnPostsThatAreNotTheActiveHabbos(t *testing.T) {
	db, mux, _, _ := board(t)
	flags := func(cookie *http.Cookie) string {
		var got []string
		for _, part := range strings.Split(serve(mux, "GET", "/forum/threads/1", cookie, nil).Body.String(), " CanReport:")[1:] {
			got = append(got, part[:strings.Index(part, " ")])
		}
		return strings.Join(got, ",")
	}
	// Frank's post comes first, then Dora's reply; FrankToo is Frank's other habbo.
	for who, want := range map[string]string{"Frank": "false,true", "Dora": "true,false", "Eve": "true,true", "FrankToo": "true,true"} {
		if got := flags(login(t, db, who)); got != want {
			t.Errorf("%s sees CanReport %s, want %s", who, got, want)
		}
	}
	if got := flags(nil); got != "false,false" {
		t.Errorf("a guest sees CanReport %s", got)
	}

	long := thread(t, db, avatarID(t, db, "Dora"), "Long", testNow, 10)
	path := fmt.Sprintf("/forum/threads/%d", long.ID)
	wantPage(t, serve(mux, "GET", path+"?page=2", nil, nil), http.StatusOK, "{Number:2 Current:true}] Page:2 Posts:")
	wantPage(t, serve(mux, "GET", path+"?page=9", nil, nil), http.StatusOK, "{Number:2 Current:false}] Page:1 Posts:")
}

func TestTheReportWindowAsksBeforeItReports(t *testing.T) {
	db, mux, frankPost, _ := board(t)
	dora := login(t, db, "Dora")
	for query, page := range map[string]int{"": 1, "?page=3": 3, "?page=x": 1, "?page=-3": 1, "?page=2.5": 1} {
		wantPage(t, reportWindow(mux, dora, frankPost, query), http.StatusOK, "forum/posts/id/report.html", fmt.Sprintf("{ShortName:Holo ID:%d Page:%d %s}", frankPost, page, askReport))
	}
	if n := countRows(t, db, `SELECT COUNT(*) FROM help_tickets`); n != 0 {
		t.Errorf("asking wrote %d tickets", n)
	}

	// go.php never asked whether the board was on.
	setSetting(t, db, "features.forum", false)
	wantPage(t, reportWindow(mux, dora, frankPost, ""), http.StatusOK, askReport)
	wantPage(t, reportPost(mux, dora, frankPost, "1"), http.StatusOK, reportedPost)
}

func TestAReportWritesHolosTicketForTheActiveHabbo(t *testing.T) {
	db, mux, frankPost, _ := board(t)
	setSetting(t, db, "site.url", "https://hotel.example.com")
	wantPage(t, reportPost(mux, login(t, db, "Dora"), frankPost, "2"), http.StatusOK, "forum/posts/id/report.html", fmt.Sprintf("{ShortName:Holo ID:%d Page:2 %s}", frankPost, reportedPost))

	var avatar, post sql.NullInt64
	var subject, message, ip string
	var waiting bool
	row := db.QueryRowContext(t.Context(), `SELECT avatar_id, forum_post_id, subject, message, ip, picked_up_at IS NULL FROM help_tickets`)
	if err := row.Scan(&avatar, &post, &subject, &message, &ip, &waiting); err != nil {
		t.Fatal(err)
	}
	want := "This user has reported a post on the Discussion Board. The Post ID is 1, in thread 1.\n\n" +
		"Original Message\n-----------------------------------\nPost 0 of Hello\n\n" +
		"URL:\n-----------------------------------\nhttps://hotel.example.com/forum/threads/1?page=2#post-1"
	if avatar.Int64 != avatarID(t, db, "Dora") || post.Int64 != frankPost || subject != "DISCUSSION BOARD - REPORTED POST" || message != want || ip != "192.0.2.1" || !waiting {
		t.Errorf("the ticket = %v %v %q %q %q waiting %t", avatar, post, subject, message, ip, waiting)
	}
}

func TestAHabboWithAWaitingRequestCannotReport(t *testing.T) {
	db, mux, frankPost, doraPost := board(t)
	dora := login(t, db, "Dora")
	wantPage(t, reportPost(mux, dora, frankPost, "1"), http.StatusOK, reportedPost)
	wantPage(t, reportWindow(mux, dora, frankPost, ""), http.StatusOK, waitingReport)
	wantPage(t, reportPost(mux, dora, frankPost, "1"), http.StatusUnprocessableEntity, waitingReport)
	// As in go.php, the waiting request answers before a post that does not exist.
	wantPage(t, reportWindow(mux, dora, 9999, ""), http.StatusOK, waitingReport)
	wantPage(t, reportPost(mux, dora, 9999, "1"), http.StatusUnprocessableEntity, waitingReport)

	// The rule counts habbos, where Holo counted addresses: every request here
	// comes from one address.
	wantPage(t, reportPost(mux, login(t, db, "Frank"), doraPost, "1"), http.StatusOK, reportedPost)
	wantPage(t, reportPost(mux, login(t, db, "FrankToo"), doraPost, "1"), http.StatusOK, reportedPost)

	// A help request waits as a report does.
	err := store.New(db).CreateHelpTicket(t.Context(), store.CreateHelpTicketParams{AvatarID: avatarID(t, db, "Eve"), Subject: "Lost", Message: "Help", IP: "10.0.0.1", CreatedAt: testNow})
	if err != nil {
		t.Fatal(err)
	}
	wantPage(t, reportPost(mux, login(t, db, "Eve"), doraPost, "1"), http.StatusUnprocessableEntity, waitingReport)
	if n := countRows(t, db, `SELECT COUNT(*) FROM help_tickets`); n != 4 {
		t.Errorf("%d tickets, want Dora's, Frank's, FrankToo's and Eve's request", n)
	}

	// Once staff pick up her report, Dora reports again.
	if _, err := db.ExecContext(t.Context(), `UPDATE help_tickets SET picked_up_at = ? WHERE avatar_id = ?`, testNow, avatarID(t, db, "Dora")); err != nil {
		t.Fatal(err)
	}
	wantPage(t, reportWindow(mux, dora, frankPost, ""), http.StatusOK, askReport)
	wantPage(t, reportPost(mux, dora, frankPost, "1"), http.StatusOK, reportedPost)
}

func TestReportsOfMissingPostsAndByGuestsWriteNothing(t *testing.T) {
	db, mux, frankPost, _ := board(t)
	dora := login(t, db, "Dora")
	for _, id := range []string{"9999", "x"} {
		wantPage(t, reportWindow(mux, dora, id, ""), http.StatusNotFound, invalidPost)
		wantPage(t, reportPost(mux, dora, id, "1"), http.StatusNotFound, invalidPost)
	}
	wantRedirect(t, reportWindow(mux, nil, frankPost, ""), "/")
	wantRedirect(t, reportPost(mux, nil, frankPost, "1"), "/")

	r := httptest.NewRequest("POST", fmt.Sprintf("/forum/posts/%d/report", frankPost), strings.NewReader("page=1"))
	r.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	r.Header.Set("Sec-Fetch-Site", "cross-site")
	r.AddCookie(dora)
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, r)
	if rec.Code != http.StatusForbidden {
		t.Errorf("a cross-site report = %d, want 403", rec.Code)
	}
	if n := countRows(t, db, `SELECT COUNT(*) FROM help_tickets`); n != 0 {
		t.Errorf("%d tickets were written", n)
	}
}
