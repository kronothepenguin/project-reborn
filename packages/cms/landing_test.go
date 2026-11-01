package cms

import (
	"encoding/xml"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

type promoFeed struct {
	Habbos []struct {
		Image  string `xml:"image,attr"`
		Figure string `xml:"figure,attr"`
		Gender string `xml:"gender,attr"`
	} `xml:"habbo"`
}

func readPromoFeed(t *testing.T, mux *http.ServeMux) promoFeed {
	t.Helper()
	rec := serve(mux, "GET", "/xml/promo-habbos.xml", nil, nil)
	if rec.Code != http.StatusOK {
		t.Fatalf("got %d: %s", rec.Code, rec.Body)
	}
	if got := rec.Header().Get("Content-Type"); got != "application/xml; charset=utf-8" {
		t.Errorf("Content-Type = %q", got)
	}
	var feed promoFeed
	if err := xml.Unmarshal(rec.Body.Bytes(), &feed); err != nil {
		t.Fatalf("the feed does not parse: %v\n%s", err, rec.Body)
	}
	return feed
}

func TestPromoFeedDescribesAHabbo(t *testing.T) {
	db, mux := newSite(t)
	setSetting(t, db, "imaging.avatarUrl", "https://imager.example/avatar")
	userID := habbo(t, db, "admin@example.com", "Admin")
	_, err := db.ExecContext(t.Context(), `UPDATE avatars SET gender = 'F' WHERE user_id = ?`, userID)
	if err != nil {
		t.Fatalf("set the gender: %v", err)
	}

	feed := readPromoFeed(t, mux)
	if len(feed.Habbos) != 1 {
		t.Fatalf("%d habbos, want 1", len(feed.Habbos))
	}
	got := feed.Habbos[0]
	if got.Figure != "hd-180-1" || got.Gender != "F" {
		t.Errorf("habbo = %+v, want its figure and gender", got)
	}
	image, err := url.Parse(got.Image)
	if err != nil {
		t.Fatalf("image %q: %v", got.Image, err)
	}
	query := image.Query()
	if image.Host != "imager.example" || image.Path != "/avatar" || query.Get("figure") != "hd-180-1" ||
		query.Get("size") != "b" || query.Get("direction") != "4" || query.Get("head_direction") != "3" || query.Get("gesture") != "sml" {
		t.Errorf("image = %q, want Holo's options on the configured imager", got.Image)
	}
}

func TestPromoFeedEscapesItsValues(t *testing.T) {
	db, mux := newSite(t)
	userID := habbo(t, db, "admin@example.com", "Admin")
	const figure = `hd-1"><x y='1'&z=2`
	if _, err := db.ExecContext(t.Context(), `UPDATE avatars SET figure = ? WHERE user_id = ?`, figure, userID); err != nil {
		t.Fatalf("set the figure: %v", err)
	}

	feed := readPromoFeed(t, mux)
	if len(feed.Habbos) != 1 || feed.Habbos[0].Figure != figure {
		t.Fatalf("feed = %+v, want the figure to survive", feed)
	}
	image, err := url.Parse(feed.Habbos[0].Image)
	if err != nil {
		t.Fatalf("image: %v", err)
	}
	if got := image.Query().Get("figure"); got != figure {
		t.Errorf("the image URL carries %q, want %q", got, figure)
	}
}

func TestPromoFeedShowsAtMostTenRandomHabbos(t *testing.T) {
	db, mux := newSite(t)
	q := store.New(db)
	userID := habbo(t, db, "admin@example.com", "Admin0")
	for i := 1; i < 14; i++ {
		_, err := q.CreateAvatar(t.Context(), store.CreateAvatarParams{
			UserID: userID, Name: "Admin" + strconv.Itoa(i), Figure: "hd-" + strconv.Itoa(i) + "-1", Gender: "M", CreatedAt: testNow, UpdatedAt: testNow,
		})
		if err != nil {
			t.Fatalf("CreateAvatar: %v", err)
		}
	}

	first := readPromoFeed(t, mux)
	if len(first.Habbos) != 10 {
		t.Errorf("%d habbos, want 10", len(first.Habbos))
	}
	for range 20 {
		if next := readPromoFeed(t, mux); next.Habbos[0].Figure != first.Habbos[0].Figure {
			return
		}
	}
	t.Error("the feed started with the same habbo 21 times")
}

func TestPromoFeedOfAnEmptyHotel(t *testing.T) {
	_, mux := newSite(t)
	if feed := readPromoFeed(t, mux); len(feed.Habbos) != 0 {
		t.Errorf("feed = %+v, want no habbos", feed)
	}
}

func TestLandingPromoCanBeSwitchedOff(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "admin@example.com", "Admin")

	wantPage(t, serve(mux, "GET", "/", nil, nil), http.StatusOK, "LandingPromo:true", "Name:Holo Hotel", "ShortName:Holo")

	setSetting(t, db, "features.landingPromo", false)
	wantPage(t, serve(mux, "GET", "/", nil, nil), http.StatusOK, "LandingPromo:false")
	if rec := serve(mux, "GET", "/xml/promo-habbos.xml", nil, nil); rec.Code != http.StatusNotFound {
		t.Errorf("the feed answers %d while the promo is off, want 404", rec.Code)
	}
}

func TestFailedSignInKeepsTheLanding(t *testing.T) {
	_, mux := newSite(t)
	rec := serve(mux, "POST", "/", nil, credentials("Nobody", "secret123"))
	wantPage(t, rec, http.StatusUnprocessableEntity, "LandingPromo:true", "ShortName:Holo")
	if !strings.Contains(rec.Body.String(), "Username:Nobody") {
		t.Errorf("the page lost the name: %s", rec.Body)
	}
}

func TestLandingShowsTheAgeLimit(t *testing.T) {
	_, mux := newSite(t)
	wantPage(t, serve(mux, "GET", "/?ageLimit=true", nil, nil), http.StatusOK, "index.html", "Error:You are too young to register.")
	wantPage(t, serve(mux, "GET", "/?ageLimit=false", nil, nil), http.StatusOK, "index.html", "Error:}")
	wantPage(t, serve(mux, "GET", "/", nil, nil), http.StatusOK, "index.html", "Error:}")
}

func TestSignInDoesNotTrimTheUsername(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "admin@example.com", "Admin")

	wantPage(t, serve(mux, "POST", "/", nil, credentials(" Admin", "secret123")), http.StatusUnprocessableEntity, "Invalid username or password.")
}

// Every signed-out page shows Holo's header: it counts habbos, as Holo's users
// table held one row per habbo.
func TestHeaderCountsRegisteredHabbos(t *testing.T) {
	db, mux := newSite(t)
	pages := []string{"/", "/register", "/forgot", "/reset/token", "/disclaimer", "/privacy"}
	for _, path := range pages {
		wantPage(t, serve(mux, "GET", path, nil, nil), http.StatusOK, "Name:Holo Hotel", "ShortName:Holo", "RegisteredUsers:0")
	}

	userID := habbo(t, db, "admin@example.com", "Admin")
	secondHabbo(t, db, userID, "Admin2")
	for _, path := range pages {
		wantPage(t, serve(mux, "GET", path, nil, nil), http.StatusOK, "RegisteredUsers:2")
	}
}
