package housekeeping

import (
	"database/sql"
	"fmt"
	"net/http"
	"regexp"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

func say(t *testing.T, db *sql.DB, avatarID int64, publicRoom, room sql.NullInt64, text string, at time.Time) {
	t.Helper()
	line := store.AddChatMessageParams{PublicRoomID: publicRoom, RoomID: room, AvatarID: avatarID, Kind: "chat", Text: text, SaidAt: at}
	if err := store.New(db).AddChatMessage(t.Context(), line); err != nil {
		t.Fatalf("AddChatMessage: %v", err)
	}
}

func TestChatLogsNeedTheirAttribute(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Helper", auth.HousekeepingAccess)
	wantPage(t, serve(mux, "GET", "/housekeeping/chatlogs", cookie, nil), http.StatusForbidden, "access-denied.html")
}

// The viewer searches by a room's id, public or habbo room, or a habbo's name, as HoloCMS's did, newest first; the
// Room ID column marks public rooms, and a deleted room's lines show - (plans/server decisions 0085 and 0086).
func TestChatLogsFindARoomOrAHabbo(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Moderator", auth.HousekeepingAccess, auth.HousekeepingChatLogs)
	habbo(t, db, "talker@example.com", "Talker")
	q := store.New(db)
	talker, err := q.GetAvatarByName(t.Context(), "Talker")
	if err != nil {
		t.Fatal(err)
	}
	say(t, db, talker.ID, id(101), sql.NullInt64{}, "hello lounge", testNow)
	say(t, db, talker.ID, sql.NullInt64{}, sql.NullInt64{}, "in a deleted room", testNow.Add(time.Minute))

	wantPage(t, serve(mux, "GET", "/housekeeping/chatlogs", cookie, nil), http.StatusOK, "chatlogs.html", "Message: ", "Lines:[]")
	wantPage(t, serve(mux, "GET", "/housekeeping/chatlogs?query=101", cookie, nil), http.StatusOK,
		"Message:Now showing chat logs..", "Lines:[{Username:Talker Room:Public 101 Time:27-10-2026 21:00:00 Text:hello lounge}]")
	wantPage(t, serve(mux, "GET", "/housekeeping/chatlogs?query=talker", cookie, nil), http.StatusOK,
		"Lines:[{Username:Talker Room:- Time:27-10-2026 21:01:00 Text:in a deleted room} {Username:Talker Room:Public 101")
	wantPage(t, serve(mux, "GET", "/housekeeping/chatlogs?query=nobody", cookie, nil), http.StatusOK, "Message:Nothing found.", "Lines:[]")
	wantPage(t, serve(mux, "GET", "/housekeeping/chatlogs?query=", cookie, nil), http.StatusOK, "Message:Nothing found.")
}

func TestChatLogsComeInPagesOfAHundred(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Moderator", auth.HousekeepingAccess, auth.HousekeepingChatLogs)
	habbo(t, db, "chatty@example.com", "Chatty")
	chatty, err := store.New(db).GetAvatarByName(t.Context(), "Chatty")
	if err != nil {
		t.Fatal(err)
	}
	for i := range 101 {
		say(t, db, chatty.ID, id(101), sql.NullInt64{}, fmt.Sprintf("line %d", i), testNow.Add(time.Duration(i)*time.Second))
	}
	lines := func(path string) int {
		return len(regexp.MustCompile(`Username:Chatty`).FindAllString(serve(mux, "GET", path, cookie, nil).Body.String(), -1))
	}
	if got := lines("/housekeeping/chatlogs?query=Chatty"); got != 100 {
		t.Errorf("the first page holds %d lines, want 100", got)
	}
	wantPage(t, serve(mux, "GET", "/housekeeping/chatlogs?query=Chatty", cookie, nil), http.StatusOK, "Text:line 100}", "Older:2 Newer:0")
	if got := lines("/housekeeping/chatlogs?query=Chatty&page=2"); got != 1 {
		t.Errorf("the second page holds %d lines, want 1", got)
	}
	wantPage(t, serve(mux, "GET", "/housekeeping/chatlogs?query=Chatty&page=2", cookie, nil), http.StatusOK, "Text:line 0}", "Older:0 Newer:1")
}
