package cms

import (
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

func TestTheEditPageIsTheOwners(t *testing.T) {
	db, mux := storeSite(t)
	userID, _ := owner(t, db, "frank@example.com", "Frank", 0)
	if _, err := auth.CreateHabbo(t.Context(), store.New(db), userID, auth.Habbo{Name: "FrankToo", Figure: "hd-180-1", Gender: "M"}); err != nil {
		t.Fatal(err)
	}
	owner(t, db, "other@example.com", "Other", 0)
	cookie := login(t, db, "Frank")

	wantPage(t, serve(mux, "GET", "/home/Frank/edit", cookie, nil), http.StatusOK, "home/name/edit.html", "Owner:Frank", "NoteMax:500")
	wantPage(t, serve(mux, "GET", "/home/FrankToo/edit", cookie, nil), http.StatusOK, "home/name/edit.html", "Owner:FrankToo")
	wantRedirect(t, serve(mux, "GET", "/home/Other/edit", cookie, nil), "/home/Other")
	wantPage(t, serve(mux, "GET", "/home/Nobody/edit", cookie, nil), http.StatusNotFound, "home/not-found.html")
	wantRedirect(t, serve(mux, "GET", "/home/Frank/edit", nil, nil), "/")
}

func TestTheEditMenuOffersTheSkinsTheUserMayUse(t *testing.T) {
	db, mux := storeSite(t)
	userID, _ := owner(t, db, "frank@example.com", "Frank", 0)
	cookie := login(t, db, "Frank")

	rec := serve(mux, "GET", "/home/Frank/edit", cookie, nil)
	wantPage(t, rec, http.StatusOK, "Value:defaultskin Label:Default", "Value:noteitskin Label:Stickie Note")
	for _, kept := range []string{"hc_pillowskin", "hc_machineskin", "nakedskin"} {
		if strings.Contains(rec.Body.String(), kept) {
			t.Errorf("the menu offers %s to a user without club or staff items", kept)
		}
	}

	if _, err := db.ExecContext(t.Context(), `INSERT INTO club_subscriptions (user_id, starts_at, ends_at, created_at) VALUES (?, ?, ?, ?)`,
		userID, time.Now().UTC().Add(-time.Hour), time.Now().UTC().Add(24*time.Hour), testNow); err != nil {
		t.Fatal(err)
	}
	grant(t, db, userID, auth.HomesStaffItems)
	wantPage(t, serve(mux, "GET", "/home/Frank/edit", cookie, nil), http.StatusOK,
		"Value:hc_pillowskin Label:HC Bling", "Value:hc_machineskin Label:HC Scifi", "Value:nakedskin Label:Staff - Naked Skin")
}

func TestThePreviewShowsBBCode(t *testing.T) {
	db, mux := storeSite(t)
	owner(t, db, "frank@example.com", "Frank", 0)

	if rec := edit(mux, nil, "/bbcode/preview", map[string]string{"text": "x"}); rec.Code != http.StatusUnauthorized {
		t.Errorf("a guest's preview answers %d", rec.Code)
	}
	rec := edit(mux, login(t, db, "Frank"), "/bbcode/preview", map[string]string{"text": "[b]Hi[/b] <i>"})
	if rec.Code != http.StatusOK || !strings.Contains(rec.Body.String(), `<strong>Hi</strong>`) && !strings.Contains(rec.Body.String(), "<strong>Hi</strong>") {
		t.Errorf("preview = %d %s", rec.Code, rec.Body.String())
	}
	if strings.Contains(rec.Body.String(), "<i>") {
		t.Errorf("the preview lets HTML through: %s", rec.Body.String())
	}
}

func TestAPlacedNoteAnswersWithItsHTML(t *testing.T) {
	db, mux := storeSite(t)
	userID, avatarID := owner(t, db, "frank@example.com", "Frank", 0)
	hold(t, db, userID, 13, 1)

	rec := edit(mux, login(t, db, "Frank"), itemsPath(homeOf(t, db, avatarID).ID), map[string]any{"kind": "note", "item": 13, "skin": "defaultskin", "text": "[b]Hi[/b]"})
	if rec.Code != http.StatusOK || !strings.Contains(rec.Body.String(), "strong") || strings.Contains(rec.Body.String(), "[b]") {
		t.Errorf("place = %d %s", rec.Code, rec.Body.String())
	}
}
