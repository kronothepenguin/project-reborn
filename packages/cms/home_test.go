package cms

import (
	"fmt"
	"net/http"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

func TestAGuestReadsAHome(t *testing.T) {
	db, mux := storeSite(t)
	_, avatarID := owner(t, db, "frank@example.com", "Frank", 0)
	home := homeOf(t, db, avatarID)

	rec := serve(mux, "GET", "/home/frank", nil, nil)
	wantPage(t, rec, http.StatusOK, "home/name.html", "Owner:Frank", fmt.Sprintf("HomeID:%d", home.ID),
		"Background:/c_images/backgrounds2/bg_pattern_abstract2.gif", "MyPage:false", "CanEdit:false",
		"Kind:widget Widget:profile Skin:defaultskin X:25 Y:25 Z:5", "Created:")
}

func TestTheHeadersSearchOpensAHome(t *testing.T) {
	db, mux := storeSite(t)
	owner(t, db, "frank@example.com", "Frank", 0)

	wantRedirect(t, serve(mux, "GET", "/home?name=Frank", nil, nil), "/home/Frank")
	wantRedirect(t, serve(mux, "GET", "/home?name=A+B", nil, nil), "/home/A%20B")
	wantPage(t, serve(mux, "GET", "/home", nil, nil), http.StatusNotFound, "home/not-found.html")
}

func TestAHomeNobodyHasIsNotFound(t *testing.T) {
	db, mux := storeSite(t)
	userID, _ := owner(t, db, "frank@example.com", "Frank", 0)
	old, err := auth.CreateHabbo(t.Context(), store.New(db), userID, auth.Habbo{Name: "Old", Figure: "hd-180-1", Gender: "M"})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := db.ExecContext(t.Context(), `UPDATE avatars SET archived_at = ? WHERE id = ?`, testNow, old); err != nil {
		t.Fatal(err)
	}

	wantPage(t, serve(mux, "GET", "/home/Nobody", nil, nil), http.StatusNotFound, "home/not-found.html")
	wantPage(t, serve(mux, "GET", "/home/Old", nil, nil), http.StatusNotFound, "home/not-found.html")
}

func TestABannedUsersHomeSaysSo(t *testing.T) {
	db, mux := storeSite(t)
	userID, _ := owner(t, db, "frank@example.com", "Frank", 0)
	ban(t, db, userID, nil)

	wantPage(t, serve(mux, "GET", "/home/Frank", nil, nil), http.StatusOK, "home/banned.html")
}

func TestTheOwnerSeesEditOnAllTheirHabbos(t *testing.T) {
	db, mux := storeSite(t)
	userID, _ := owner(t, db, "frank@example.com", "Frank", 0)
	if _, err := auth.CreateHabbo(t.Context(), store.New(db), userID, auth.Habbo{Name: "FrankToo", Figure: "hd-180-1", Gender: "M"}); err != nil {
		t.Fatal(err)
	}
	owner(t, db, "other@example.com", "Other", 0)
	cookie := login(t, db, "Frank")

	wantPage(t, serve(mux, "GET", "/home/Frank", cookie, nil), http.StatusOK, "MyPage:true", "CanEdit:true")
	wantPage(t, serve(mux, "GET", "/home/FrankToo", cookie, nil), http.StatusOK, "MyPage:false", "CanEdit:true")
	wantPage(t, serve(mux, "GET", "/home/Other", cookie, nil), http.StatusOK, "MyPage:false", "CanEdit:false")
}

func TestAHomeShowsItsItems(t *testing.T) {
	db, mux := storeSite(t)
	userID, avatarID := owner(t, db, "frank@example.com", "Frank", 0)
	home := homeOf(t, db, avatarID).ID
	backgrounds, _ := store.New(db).ListEnabledHomeStoreItems(t.Context(), 27)
	hold(t, db, userID, 1, 1)
	hold(t, db, userID, 13, 1)
	hold(t, db, userID, backgrounds[0].ID, 1)
	cookie := login(t, db, "Frank")
	edit(mux, cookie, itemsPath(home), map[string]any{"kind": "sticker", "item": 1, "z": 7})
	edit(mux, cookie, itemsPath(home), map[string]any{"kind": "note", "item": 13, "skin": "noteitskin", "text": "Hi <b> [b]there[/b]\nfriend"})
	edit(mux, cookie, fmt.Sprintf("/homes/%d/layout", home), map[string]any{"background": backgrounds[0].ID})

	rec := serve(mux, "GET", "/home/Frank", nil, nil)
	// The stand-in page escapes what it prints, so the note's HTML shows escaped
	// once, and the text typed as HTML twice.
	wantPage(t, rec, http.StatusOK, "Kind:sticker", "Image:/c_images/stickers/sticker_geniefirehead.gif", "Kind:note", "Skin:noteitskin",
		"&lt;strong&gt;there&lt;/strong&gt;", "Hi &amp;lt;b&amp;gt;", "Background:/"+backgrounds[0].Asset)
}

func TestTheProfileWidgetShowsTheBadgeAndTheTags(t *testing.T) {
	db, mux := storeSite(t)
	_, avatarID := owner(t, db, "frank@example.com", "Frank", 0)
	q := store.New(db)
	if _, err := q.GrantAvatarBadge(t.Context(), store.GrantAvatarBadgeParams{AvatarID: avatarID, Code: "ADM", GrantedAt: testNow}); err != nil {
		t.Fatal(err)
	}
	profile, err := q.GetAvatarProfile(t.Context(), avatarID)
	if err != nil {
		t.Fatal(err)
	}
	for _, tag := range []string{"holo", "retro"} {
		if _, err := q.AddProfileTag(t.Context(), store.AddProfileTagParams{ProfileID: profile.ID, Tag: tag, CreatedAt: testNow}); err != nil {
			t.Fatal(err)
		}
	}

	wantPage(t, serve(mux, "GET", "/home/Frank", nil, nil), http.StatusOK, "Badge:/c_images/album1584/ADM.gif", "Tags:[holo retro]")
}

func TestAClubOwnersHomeIsWide(t *testing.T) {
	db, mux := storeSite(t)
	userID, _ := owner(t, db, "frank@example.com", "Frank", 0)
	wantPage(t, serve(mux, "GET", "/home/Frank", nil, nil), http.StatusOK, "Wide:false")
	if _, err := db.ExecContext(t.Context(), `INSERT INTO club_subscriptions (user_id, starts_at, ends_at, created_at) VALUES (?, ?, ?, ?)`,
		userID, time.Now().UTC().Add(-time.Hour), time.Now().UTC().Add(24*time.Hour), testNow); err != nil {
		t.Fatal(err)
	}
	wantPage(t, serve(mux, "GET", "/home/Frank", nil, nil), http.StatusOK, "Wide:true")
}
