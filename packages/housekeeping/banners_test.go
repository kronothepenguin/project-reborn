package housekeeping

import (
	"database/sql"
	"fmt"
	"html"
	"net/http"
	"net/url"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

const (
	bannerForgotten = "You're something forgotten!"
	bannerTooLong   = "The text must be at most 50 characters, and each url at most 255."
	bannerAddress   = "The urls must be http(s) addresses or paths of the site, such as /community."
)

func bannerKeeper(t *testing.T, db *sql.DB) (int64, *http.Cookie) {
	t.Helper()
	return staff(t, db, "Keeper", auth.HousekeepingAccess, auth.HousekeepingBanners)
}

func bannerURL(id int64) string {
	return fmt.Sprintf("/housekeeping/banners/%d", id)
}

func bannerForm(text, image, link, status string) url.Values {
	return url.Values{"text": {text}, "banner": {image}, "url": {link}, "status": {status}}
}

func addBanner(t *testing.T, db *sql.DB, text string, enabled bool) store.Banner {
	t.Helper()
	banner, err := store.New(db).CreateBanner(t.Context(), store.CreateBannerParams{
		Title:     text,
		ImageURL:  "https://images.example.com/banner.gif",
		LinkURL:   "/community",
		Enabled:   enabled,
		CreatedAt: testNow,
		UpdatedAt: testNow,
	})
	if err != nil {
		t.Fatalf("CreateBanner: %v", err)
	}
	return banner
}

func bannerRow(t *testing.T, db *sql.DB, id int64) store.Banner {
	t.Helper()
	banner, err := store.New(db).GetBanner(t.Context(), id)
	if err != nil {
		t.Fatalf("GetBanner %d: %v", id, err)
	}
	return banner
}

func sameBanner(a, b store.Banner) bool {
	return a.ID == b.ID && a.Title == b.Title && a.ImageURL == b.ImageURL && a.LinkURL == b.LinkURL &&
		a.Enabled == b.Enabled && a.UpdatedAt.Equal(b.UpdatedAt)
}

func newestBanner(t *testing.T, db *sql.DB) store.Banner {
	t.Helper()
	var id int64
	if err := db.QueryRowContext(t.Context(), `SELECT MAX(id) FROM banners`).Scan(&id); err != nil {
		t.Fatalf("find the newest banner: %v", err)
	}
	return bannerRow(t, db, id)
}

func TestTheBannersTakeTheAttribute(t *testing.T) {
	db, mux := newSite(t)
	banner := addBanner(t, db, "Old banner", true)
	_, cookie := staff(t, db, "Writer", auth.HousekeepingAccess, auth.HousekeepingNews, auth.HousekeepingHomeStore, auth.HousekeepingSettings, auth.HousekeepingLogs)

	for _, c := range []struct {
		method string
		path   string
		form   url.Values
	}{
		{"GET", "/housekeeping/banners", nil},
		{"POST", "/housekeeping/banners", bannerForm("New", "/banner.gif", "/community", "1")},
		{"GET", bannerURL(banner.ID), nil},
		{"POST", bannerURL(banner.ID), bannerForm("Changed", "/banner.gif", "/community", "0")},
		{"GET", bannerURL(banner.ID) + "/delete", nil},
		{"POST", bannerURL(banner.ID) + "/delete", url.Values{}},
	} {
		wantPage(t, serve(mux, c.method, c.path, cookie, c.form), http.StatusForbidden, "access-denied.html")
	}
	if got := count(t, db, `SELECT COUNT(*) FROM banners`); got != 1 {
		t.Errorf("%d banners, want 1", got)
	}
	if after := bannerRow(t, db, banner.ID); !sameBanner(after, banner) {
		t.Errorf("banner = %+v, want %+v", after, banner)
	}
	if rows := staffLogs(t, db); len(rows) != 0 {
		t.Errorf("%d log rows", len(rows))
	}
}

// The installer's Moderator group holds banners and not news, as Holo's rank 6
// reached the banners and not the news.
func TestModeratorsManageBannersButNotNews(t *testing.T) {
	db, mux := newSite(t)
	userID := habbo(t, db, "mod@example.com", "Mod")
	if err := store.New(db).AddAccessGroupMember(t.Context(), store.AddAccessGroupMemberParams{AccessGroupID: 2, UserID: userID, GrantedAt: testNow}); err != nil {
		t.Fatalf("AddAccessGroupMember: %v", err)
	}
	cookie := login(t, db, "Mod")

	wantPage(t, serve(mux, "GET", "/housekeeping/banners", cookie, nil), http.StatusOK, "banners.html")
	wantPage(t, serve(mux, "GET", "/housekeeping/news", cookie, nil), http.StatusForbidden, "access-denied.html")
}

func TestTheBannersPageIsHolos(t *testing.T) {
	db, mux := newSite(t)
	first := addBanner(t, db, "First", true)
	second := addBanner(t, db, "Second", false)
	_, cookie := bannerKeeper(t, db)

	rec := serve(mux, "GET", "/housekeeping/banners", cookie, nil)
	wantPage(t, rec, http.StatusOK, "banners.html",
		"Form:{Text: Banner: URL: Enabled:false}",
		fmt.Sprintf("Banners:[{ID:%d bannerForm:{Text:First Banner:https://images.example.com/banner.gif URL:/community Enabled:true}} {ID:%d bannerForm:{Text:Second Banner:https://images.example.com/banner.gif URL:/community Enabled:false}}]", first.ID, second.ID),
		"Message: Error: ListMessage: ListError:}")
}

func TestAddingABanner(t *testing.T) {
	db, mux := newSite(t)
	userID, cookie := bannerKeeper(t, db)

	form := bannerForm("Visit the forum", " /web-gallery/images/top-story/top_story_news.png ", "\thttps://forum.example.com/ ", "1")
	wantRedirect(t, serve(mux, "POST", "/housekeeping/banners", cookie, form), "/housekeeping/banners?added=1")

	got := newestBanner(t, db)
	if got.Title != "Visit the forum" || got.ImageURL != "/web-gallery/images/top-story/top_story_news.png" ||
		got.LinkURL != "https://forum.example.com/" || !got.Enabled {
		t.Errorf("banner = %+v", got)
	}
	wantPage(t, serve(mux, "GET", "/housekeeping/banners?added=1", cookie, nil), http.StatusOK,
		"Message:Succesfully added! Error: ListMessage: ListError:",
		fmt.Sprintf("{ID:%d bannerForm:{Text:Visit the forum Banner:/web-gallery/images/top-story/top_story_news.png URL:https://forum.example.com/ Enabled:true}}", got.ID))
	wantOneLog(t, db, "banners.create", fmt.Sprintf("Visit the forum (ID: %d)", got.ID), 0, 0)
	wantActor(t, db, "banners.create", userID)
}

// Holo asked only for the two urls, and a banner without a text is shown without one.
func TestABannerNeedsNoText(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := bannerKeeper(t, db)

	wantRedirect(t, serve(mux, "POST", "/housekeeping/banners", cookie, bannerForm("", "/banner.gif", "/community", "0")), "/housekeeping/banners?added=1")
	got := newestBanner(t, db)
	if got.Title != "" || got.Enabled {
		t.Errorf("banner = %+v", got)
	}
	wantOneLog(t, db, "banners.create", fmt.Sprintf("(ID: %d)", got.ID), 0, 0)
}

// Only 1 enables a banner, as Holo's status column read it.
func TestTheStatusIsHolos(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := bannerKeeper(t, db)

	for status, enabled := range map[string]bool{"1": true, "0": false, "": false, "2": false, "yes": false} {
		wantRedirect(t, serve(mux, "POST", "/housekeeping/banners", cookie, bannerForm("Status "+status, "/banner.gif", "/community", status)), "/housekeeping/banners?added=1")
		if got := newestBanner(t, db); got.Enabled != enabled {
			t.Errorf("status %q enabled the banner: %t, want %t", status, got.Enabled, enabled)
		}
	}
}

func TestABannerTakesAddressesAndPathsOfTheSite(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := bannerKeeper(t, db)
	longest := "https://images.example.com/" + strings.Repeat("a", 255-len("https://images.example.com/"))

	for _, c := range []struct{ text, image, link string }{
		{"Paths", "/web-gallery/banner.gif", "/news/2?from=banner#top"},
		{"Addresses", "https://images.example.com/banner.gif", "http://forum.example.com/thread?id=1"},
		{strings.Repeat("é", 50), longest, longest},
	} {
		wantRedirect(t, serve(mux, "POST", "/housekeeping/banners", cookie, bannerForm(c.text, c.image, c.link, "1")), "/housekeeping/banners?added=1")
		if got := newestBanner(t, db); got.Title != c.text || got.ImageURL != c.image || got.LinkURL != c.link {
			t.Errorf("banner = %+v, want %+v", got, c)
		}
	}
}

func TestABadBannerIsRefused(t *testing.T) {
	db, mux := newSite(t)
	banner := addBanner(t, db, "Old banner", true)
	_, cookie := bannerKeeper(t, db)
	tooLong := "https://images.example.com/" + strings.Repeat("a", 256-len("https://images.example.com/"))

	for _, c := range []struct {
		name  string
		field string
		value string
		want  string
	}{
		{"no banner", "banner", "", bannerForgotten},
		{"a banner of spaces", "banner", "   ", bannerForgotten},
		{"no link", "url", "", bannerForgotten},
		{"a link of spaces", "url", " \t ", bannerForgotten},
		{"a text too long", "text", strings.Repeat("a", 51), bannerTooLong},
		{"a banner too long", "banner", tooLong, bannerTooLong},
		{"a link too long", "url", tooLong, bannerTooLong},
		{"a script for a link", "url", "javascript:alert(1)", bannerAddress},
		{"a script in capitals", "url", "JavaScript:alert(1)", bannerAddress},
		{"a script for a banner", "banner", "javascript:alert(1)", bannerAddress},
		{"data", "banner", "data:image/gif;base64,R0lGODlh", bannerAddress},
		{"another host without a scheme", "url", "//evil.example.com/", bannerAddress},
		{"another host behind three slashes", "url", "///evil.example.com/", bannerAddress},
		{"another host behind a backslash", "url", `/\evil.example.com/`, bannerAddress},
		{"Holo's relative link", "url", "news.php?id=2", bannerAddress},
		{"ftp", "banner", "ftp://images.example.com/banner.gif", bannerAddress},
		{"a scheme without a host", "url", "https:///community", bannerAddress},
		{"a tab in the scheme", "url", "java\tscript:alert(1)", bannerAddress},
	} {
		t.Run(c.name, func(t *testing.T) {
			form := bannerForm("Typed", "/banner.gif", "/community", "1")
			form.Set(c.field, c.value)
			typed := fmt.Sprintf("Form:{Text:%s Banner:%s URL:%s Enabled:true}",
				form.Get("text"), strings.TrimSpace(form.Get("banner")), strings.TrimSpace(form.Get("url")))
			wantPage(t, serve(mux, "POST", "/housekeeping/banners", cookie, form), http.StatusUnprocessableEntity,
				"banners.html", typed, "Error:"+html.EscapeString(c.want))
			wantPage(t, serve(mux, "POST", bannerURL(banner.ID), cookie, form), http.StatusUnprocessableEntity,
				"banners/id.html", fmt.Sprintf("ID:%d %s", banner.ID, typed), "Error:"+html.EscapeString(c.want))
		})
	}
	if got := count(t, db, `SELECT COUNT(*) FROM banners`); got != 1 {
		t.Errorf("%d banners, want 1", got)
	}
	if after := bannerRow(t, db, banner.ID); !sameBanner(after, banner) {
		t.Errorf("banner = %+v, want %+v", after, banner)
	}
	if rows := staffLogs(t, db); len(rows) != 0 {
		t.Errorf("%d log rows", len(rows))
	}
}

func TestEditingABanner(t *testing.T) {
	db, mux := newSite(t)
	banner := addBanner(t, db, "Old banner", true)
	userID, cookie := bannerKeeper(t, db)

	wantPage(t, serve(mux, "GET", bannerURL(banner.ID), cookie, nil), http.StatusOK, "banners/id.html",
		fmt.Sprintf("ID:%d Form:{Text:Old banner Banner:https://images.example.com/banner.gif URL:/community Enabled:true} Message: Error:", banner.ID))

	before := time.Now().UTC()
	form := bannerForm("New banner", "/web-gallery/new.gif", "/community", "0")
	wantRedirect(t, serve(mux, "POST", bannerURL(banner.ID), cookie, form), bannerURL(banner.ID)+"?saved=1")

	got := bannerRow(t, db, banner.ID)
	if got.Title != "New banner" || got.ImageURL != "/web-gallery/new.gif" || got.LinkURL != "/community" || got.Enabled {
		t.Errorf("banner = %+v", got)
	}
	if !got.CreatedAt.Equal(testNow) || got.UpdatedAt.Before(before.Truncate(time.Second)) {
		t.Errorf("created %v, updated %v", got.CreatedAt, got.UpdatedAt)
	}
	wantOneLog(t, db, "banners.update", fmt.Sprintf("New banner (ID: %d): text, banner, status", banner.ID), 0, 0)
	wantActor(t, db, "banners.update", userID)
	wantPage(t, serve(mux, "GET", bannerURL(banner.ID)+"?saved=1", cookie, nil), http.StatusOK,
		"Form:{Text:New banner Banner:/web-gallery/new.gif URL:/community Enabled:false} Message:Succesfully edited! Error:")
}

func TestSavingABannerUnchangedLogsNothing(t *testing.T) {
	db, mux := newSite(t)
	banner := addBanner(t, db, "Old banner", true)
	_, cookie := bannerKeeper(t, db)

	form := bannerForm(banner.Title, banner.ImageURL, banner.LinkURL, "1")
	wantRedirect(t, serve(mux, "POST", bannerURL(banner.ID), cookie, form), bannerURL(banner.ID)+"?saved=1")
	if after := bannerRow(t, db, banner.ID); !sameBanner(after, banner) {
		t.Errorf("banner = %+v, want %+v", after, banner)
	}
	if rows := staffLogs(t, db); len(rows) != 0 {
		t.Errorf("%d log rows", len(rows))
	}
}

func TestDeletingABanner(t *testing.T) {
	db, mux := newSite(t)
	banner := addBanner(t, db, "Old banner", true)
	kept := addBanner(t, db, "Kept banner", true)
	userID, cookie := bannerKeeper(t, db)

	wantPage(t, serve(mux, "GET", bannerURL(banner.ID)+"/delete", cookie, nil), http.StatusOK, "banners/id/delete.html",
		fmt.Sprintf("ID:%d Text:Old banner}", banner.ID))
	if got := count(t, db, `SELECT COUNT(*) FROM banners`); got != 2 {
		t.Errorf("the question deleted something: %d banners", got)
	}

	wantRedirect(t, serve(mux, "POST", bannerURL(banner.ID)+"/delete", cookie, url.Values{}), "/housekeeping/banners?deleted=1")
	if _, err := store.New(db).GetBanner(t.Context(), banner.ID); !store.IsNotFound(err) {
		t.Errorf("the banner is still there: %v", err)
	}
	if after := bannerRow(t, db, kept.ID); !sameBanner(after, kept) {
		t.Errorf("the other banner = %+v, want %+v", after, kept)
	}
	wantOneLog(t, db, "banners.delete", fmt.Sprintf("Old banner (ID: %d)", banner.ID), 0, 0)
	wantActor(t, db, "banners.delete", userID)
	wantPage(t, serve(mux, "GET", "/housekeeping/banners?deleted=1", cookie, nil), http.StatusOK,
		"Message: Error: ListMessage:Succesfully deleted! ListError:")
}

// Holo said its delete was done for any id, and its edit form showed blanks for
// a banner that was gone.
func TestABannerThatDoesNotExist(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := bannerKeeper(t, db)

	for _, c := range []struct {
		method string
		path   string
		form   url.Values
	}{
		{"GET", bannerURL(999), nil},
		{"POST", bannerURL(999), bannerForm("Ghost", "/banner.gif", "/community", "1")},
		{"GET", bannerURL(999) + "/delete", nil},
		{"POST", bannerURL(999) + "/delete", url.Values{}},
		{"GET", "/housekeeping/banners/ghost", nil},
		{"POST", "/housekeeping/banners/ghost", bannerForm("Ghost", "/banner.gif", "/community", "1")},
		{"GET", "/housekeeping/banners/ghost/delete", nil},
		{"POST", "/housekeeping/banners/ghost/delete", url.Values{}},
	} {
		wantPage(t, serve(mux, c.method, c.path, cookie, c.form), http.StatusNotFound,
			"banners.html", "Banners:[] Message: Error: ListMessage: ListError:Something was going wrong!")
	}
	if rows := staffLogs(t, db); len(rows) != 0 {
		t.Errorf("%d log rows", len(rows))
	}
}
