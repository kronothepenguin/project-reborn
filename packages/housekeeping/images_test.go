package housekeeping

import (
	"fmt"
	"net/http"
	"net/url"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/cms/seed"
)

const imageMissing = "Error:Unable to delete image; this image does not exist!"

func imageDeleteURL(id int64) string {
	return fmt.Sprintf("/housekeeping/images/%d/delete", id)
}

// sizeOf is the size the page gives an image's bytes.
func sizeOf(t *testing.T, data []byte) string {
	t.Helper()
	return fmt.Sprintf("%.1f KB", float64(len(data))/1024)
}

func TestTheImagesPageTakesTheAttribute(t *testing.T) {
	db, mux := newSite(t)
	_, writer := newsWriter(t, db)
	wantAnswer(t, uploadImage(mux, writer, pngOf(t, picture(300, 187))), http.StatusOK, imageAnswer{Path: "/news/images/1.png"})
	_, cookie := staff(t, db, "Keeper", auth.HousekeepingAccess, auth.HousekeepingBanners, auth.HousekeepingHomeStore, auth.HousekeepingSettings, auth.HousekeepingLogs)

	wantPage(t, serve(mux, "GET", "/housekeeping/images", cookie, nil), http.StatusForbidden, "access-denied.html")
	wantPage(t, serve(mux, "POST", imageDeleteURL(1), cookie, url.Values{}), http.StatusForbidden, "access-denied.html")
	if got := count(t, db, `SELECT COUNT(*) FROM images`); got != 1 {
		t.Errorf("%d images, want 1", got)
	}
	if rows := logsOf(t, db, "images.delete"); len(rows) != 0 {
		t.Errorf("%d delete rows", len(rows))
	}
}

func TestTheImagesPageListsTheUploadsAndTheirArticles(t *testing.T) {
	db, mux := newSite(t)
	userID, cookie := newsWriter(t, db)
	wantPage(t, serve(mux, "GET", "/housekeeping/images", cookie, nil), http.StatusOK, "images.html", "Images:[] Message: Error:")

	wantAnswer(t, uploadImage(mux, cookie, pngOf(t, picture(300, 187))), http.StatusOK, imageAnswer{Path: "/news/images/1.png"})
	moving, _ := animation(t, 300, 187, 2)
	wantAnswer(t, uploadImage(mux, cookie, moving), http.StatusOK, imageAnswer{Path: "/news/images/2.gif"})
	for _, title := range []string{"First", "Second"} {
		wantRedirect(t, serve(mux, "POST", "/housekeeping/news", cookie, articleForm(title, "/news/images/1.png")), "/housekeeping/news?published=1")
	}

	rec := serve(mux, "GET", "/housekeeping/images", cookie, nil)
	wantPage(t, rec, http.StatusOK, "images.html",
		fmt.Sprintf("Images:[{ID:2 Path:/news/images/2.gif Preview:http://localhost:17387/news/images/2.gif Format:GIF Size:%s Uploader:Writer (ID: %d) Date:", sizeOf(t, imageRow(t, db, 2).data), userID),
		"Articles:[]} {ID:1 Path:/news/images/1.png Preview:http://localhost:17387/news/images/1.png Format:PNG Size:"+sizeOf(t, imageRow(t, db, 1).data),
		"Articles:[{ID:2 Title:Second} {ID:1 Title:First}]}] Message: Error:")
}

func TestDeletingAnUnusedImage(t *testing.T) {
	db, mux := newSite(t)
	userID, cookie := newsWriter(t, db)
	wantAnswer(t, uploadImage(mux, cookie, pngOf(t, picture(300, 187))), http.StatusOK, imageAnswer{Path: "/news/images/1.png"})
	moving, _ := animation(t, 300, 187, 2)
	wantAnswer(t, uploadImage(mux, cookie, moving), http.StatusOK, imageAnswer{Path: "/news/images/2.gif"})
	wantRedirect(t, serve(mux, "POST", "/housekeeping/news", cookie, articleForm("Uses one", "/news/images/1.png")), "/housekeeping/news?published=1")

	wantRedirect(t, serve(mux, "POST", imageDeleteURL(2), cookie, url.Values{}), "/housekeeping/images?deleted=1")
	if got := count(t, db, `SELECT COUNT(*) FROM images WHERE id = 2`); got != 0 {
		t.Error("the unused image is still there")
	}
	wantOneLog(t, db, "images.delete", "/news/images/2.gif", 0, 0)
	wantActor(t, db, "images.delete", userID)
	wantPage(t, serve(mux, "GET", "/housekeeping/images?deleted=1", cookie, nil), http.StatusOK,
		"Message:Image deleted successfully. Error:")
	wantPage(t, serve(mux, "POST", imageDeleteURL(2), cookie, url.Values{}), http.StatusNotFound, "images.html", imageMissing)
}

// The browser pages the list (0080), and a delete returns to the page its form
// carried, leaving out one that is no positive number.
func TestADeleteReturnsToItsPage(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := newsWriter(t, db)
	cases := []struct{ query, want string }{
		{"?page=3", "/housekeeping/images?deleted=1&page=3"},
		{"?page=0", "/housekeeping/images?deleted=1"},
		{"?page=-2", "/housekeeping/images?deleted=1"},
		{"?page=two", "/housekeeping/images?deleted=1"},
		{"", "/housekeeping/images?deleted=1"},
	}
	for i := range cases {
		wantAnswer(t, uploadImage(mux, cookie, pngOf(t, picture(300, 187))), http.StatusOK, imageAnswer{Path: fmt.Sprintf("/news/images/%d.png", i+1)})
	}
	for i, c := range cases {
		wantRedirect(t, serve(mux, "POST", imageDeleteURL(int64(i+1))+c.query, cookie, url.Values{}), c.want)
	}
}

// The database refuses to delete a picture an article shows, and the answer
// names the articles that keep it.
func TestAnImageInUseIsNotDeleted(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := newsWriter(t, db)
	wantAnswer(t, uploadImage(mux, cookie, pngOf(t, picture(300, 187))), http.StatusOK, imageAnswer{Path: "/news/images/1.png"})

	for i, want := range []string{
		"Unable to delete image; it is the topstory image of First (ID: 1). Change or delete that article first.",
		"Unable to delete image; it is the topstory image of Second (ID: 2) and First (ID: 1). Change or delete those articles first.",
		"Unable to delete image; it is the topstory image of Third (ID: 3), Second (ID: 2) and First (ID: 1). Change or delete those articles first.",
	} {
		title := []string{"First", "Second", "Third"}[i]
		wantRedirect(t, serve(mux, "POST", "/housekeeping/news", cookie, articleForm(title, "/news/images/1.png")), "/housekeeping/news?published=1")
		wantPage(t, serve(mux, "POST", imageDeleteURL(1), cookie, url.Values{}), http.StatusUnprocessableEntity,
			"images.html", "Error:"+want)
	}
	if got := count(t, db, `SELECT COUNT(*) FROM images`); got != 1 {
		t.Errorf("%d images, want the one in use", got)
	}
	if rows := logsOf(t, db, "images.delete"); len(rows) != 0 {
		t.Errorf("%d delete rows", len(rows))
	}

	for id := int64(1); id <= 3; id++ {
		wantRedirect(t, serve(mux, "POST", articleURL(id), cookie, articleForm([]string{"First", "Second", "Third"}[id-1], seed.DefaultTopStory)), "/housekeeping/news?updated=1")
	}
	wantRedirect(t, serve(mux, "POST", imageDeleteURL(1), cookie, url.Values{}), "/housekeeping/images?deleted=1")
	wantOneLog(t, db, "images.delete", "/news/images/1.png", 0, 0)
}

func TestDeletingAnImageThatDoesNotExist(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := newsWriter(t, db)

	for _, path := range []string{imageDeleteURL(999), "/housekeeping/images/abc/delete"} {
		wantPage(t, serve(mux, "POST", path, cookie, url.Values{}), http.StatusNotFound, "images.html", "Images:[]", imageMissing)
	}
	if rows := staffLogs(t, db); len(rows) != 0 {
		t.Errorf("%d log rows", len(rows))
	}
}
