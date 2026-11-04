package housekeeping

import (
	"bytes"
	"database/sql"
	"encoding/binary"
	"encoding/json/v2"
	"fmt"
	"hash/crc32"
	"image"
	"image/color"
	"image/gif"
	"image/jpeg"
	"image/png"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/cms/seed"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

const imageInvalid = "The image must be a PNG or a GIF of 300x187 pixels."

// picture is a gradient with some transparency, so that a re-encoding that
// loses pixels shows.
func picture(width, height int) *image.NRGBA {
	m := image.NewNRGBA(image.Rect(0, 0, width, height))
	for y := range height {
		for x := range width {
			m.SetNRGBA(x, y, color.NRGBA{R: uint8(x), G: uint8(y), B: uint8(x + y), A: uint8(255 - y)})
		}
	}
	return m
}

func pngOf(t *testing.T, m image.Image) []byte {
	t.Helper()
	var out bytes.Buffer
	if err := png.Encode(&out, m); err != nil {
		t.Fatalf("png.Encode: %v", err)
	}
	return out.Bytes()
}

// animation is a GIF of frames frames, each in a palette of its own, with a delay
// and a disposal per frame and a loop count.
func animation(t *testing.T, width, height, frames int) ([]byte, *gif.GIF) {
	t.Helper()
	g := &gif.GIF{LoopCount: 3}
	for i := range frames {
		palette := color.Palette{
			color.RGBA{R: uint8(40 * i), A: 255},
			color.RGBA{G: 200, B: uint8(30 * i), A: 255},
			color.RGBA{},
		}
		frame := image.NewPaletted(image.Rect(0, 0, width, height), palette)
		for y := range height {
			for x := range width {
				frame.SetColorIndex(x, y, uint8((x/(i+5)+y/7)%3))
			}
		}
		g.Image = append(g.Image, frame)
		g.Delay = append(g.Delay, 10*(i+1))
		g.Disposal = append(g.Disposal, gif.DisposalBackground)
	}
	var out bytes.Buffer
	if err := gif.EncodeAll(&out, g); err != nil {
		t.Fatalf("gif.EncodeAll: %v", err)
	}
	return out.Bytes(), g
}

// flicker is a GIF of frames frames of one color each, which compress to a few
// hundred bytes and decode to a whole 300x187 frame.
func flicker(t *testing.T, frames int) []byte {
	t.Helper()
	palette := color.Palette{color.RGBA{R: 255, A: 255}, color.RGBA{B: 255, A: 255}}
	g := &gif.GIF{}
	for i := range frames {
		frame := image.NewPaletted(image.Rect(0, 0, 300, 187), palette)
		for p := range frame.Pix {
			frame.Pix[p] = uint8(i % 2)
		}
		g.Image = append(g.Image, frame)
		g.Delay = append(g.Delay, 5)
	}
	var out bytes.Buffer
	if err := gif.EncodeAll(&out, g); err != nil {
		t.Fatalf("gif.EncodeAll: %v", err)
	}
	return out.Bytes()
}

// withPNGChunk adds a chunk after the header chunk, as a tool that writes
// metadata would.
func withPNGChunk(data []byte, kind string, content []byte) []byte {
	const afterHeader = 8 + 25
	chunk := binary.BigEndian.AppendUint32(nil, uint32(len(content)))
	chunk = append(chunk, kind...)
	chunk = append(chunk, content...)
	chunk = binary.BigEndian.AppendUint32(chunk, crc32.ChecksumIEEE(append([]byte(kind), content...)))
	return append(append(append([]byte(nil), data[:afterHeader]...), chunk...), data[afterHeader:]...)
}

// withGIFComment adds a comment extension before the trailer, and bytes after it.
func withGIFComment(data []byte, comment string, tail string) []byte {
	extension := append([]byte{0x21, 0xfe, byte(len(comment))}, comment...)
	extension = append(extension, 0)
	out := append(append([]byte(nil), data[:len(data)-1]...), extension...)
	return append(append(out, 0x3b), tail...)
}

func uploadImage(mux *http.ServeMux, cookie *http.Cookie, body []byte) *httptest.ResponseRecorder {
	r := httptest.NewRequest("POST", "/housekeeping/news/images", bytes.NewReader(body))
	r.Header.Set("Content-Type", "application/octet-stream")
	if cookie != nil {
		r.AddCookie(cookie)
	}
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, r)
	return rec
}

type imageAnswer struct {
	Path  string `json:"path"`
	Error string `json:"error"`
}

func wantAnswer(t *testing.T, rec *httptest.ResponseRecorder, status int, want imageAnswer) {
	t.Helper()
	var got imageAnswer
	if err := json.Unmarshal(rec.Body.Bytes(), &got); err != nil {
		t.Fatalf("the answer %q is not JSON: %v", rec.Body, err)
	}
	if rec.Code != status || got != want || rec.Header().Get("Content-Type") != "application/json" {
		t.Errorf("got %d %+v as %q, want %d %+v", rec.Code, got, rec.Header().Get("Content-Type"), status, want)
	}
}

type storedImage struct {
	format  string
	data    []byte
	width   int64
	height  int64
	creator sql.NullInt64
}

func imageRow(t *testing.T, db *sql.DB, id int64) storedImage {
	t.Helper()
	var stored storedImage
	err := db.QueryRowContext(t.Context(), `SELECT format, data, width, height, created_by_user_id FROM images WHERE id = ?`, id).
		Scan(&stored.format, &stored.data, &stored.width, &stored.height, &stored.creator)
	if err != nil {
		t.Fatalf("read image %d: %v", id, err)
	}
	return stored
}

func samePixels(t *testing.T, got, want image.Image) {
	t.Helper()
	if got.Bounds() != want.Bounds() {
		t.Fatalf("bounds %v, want %v", got.Bounds(), want.Bounds())
	}
	for y := want.Bounds().Min.Y; y < want.Bounds().Max.Y; y++ {
		for x := want.Bounds().Min.X; x < want.Bounds().Max.X; x++ {
			if g, w := color.NRGBAModel.Convert(got.At(x, y)), color.NRGBAModel.Convert(want.At(x, y)); g != w {
				t.Fatalf("pixel %d,%d is %v, want %v", x, y, g, w)
			}
		}
	}
}

func TestUploadingTakesTheAttribute(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := staff(t, db, "Keeper", auth.HousekeepingAccess, auth.HousekeepingBanners, auth.HousekeepingHomeStore, auth.HousekeepingSettings)

	wantPage(t, uploadImage(mux, cookie, pngOf(t, picture(300, 187))), http.StatusForbidden, "access-denied.html")
	if got := count(t, db, `SELECT COUNT(*) FROM images`); got != 0 {
		t.Errorf("%d images", got)
	}
	if rows := staffLogs(t, db); len(rows) != 0 {
		t.Errorf("%d log rows", len(rows))
	}
}

func TestUploadingAPNGKeepsOnlyItsPixels(t *testing.T) {
	db, mux := newSite(t)
	userID, cookie := newsWriter(t, db)
	sent := withPNGChunk(pngOf(t, picture(300, 187)), "tEXt", []byte("Comment\x00SECRET"))
	if _, err := png.Decode(bytes.NewReader(sent)); err != nil || !bytes.Contains(sent, []byte("SECRET")) {
		t.Fatalf("the PNG with a comment is not right: %v", err)
	}

	wantAnswer(t, uploadImage(mux, cookie, sent), http.StatusOK, imageAnswer{Path: "/news/images/1.png"})
	stored := imageRow(t, db, 1)
	if stored.format != "png" || stored.width != 300 || stored.height != 187 || stored.creator.Int64 != userID {
		t.Errorf("stored %s %dx%d by %v", stored.format, stored.width, stored.height, stored.creator)
	}
	if bytes.Contains(stored.data, []byte("SECRET")) || bytes.Equal(stored.data, sent) {
		t.Error("the PNG was stored as it was sent")
	}
	decoded, err := png.Decode(bytes.NewReader(stored.data))
	if err != nil {
		t.Fatalf("the stored PNG does not decode: %v", err)
	}
	samePixels(t, decoded, picture(300, 187))
	wantOneLog(t, db, "news.image", "/news/images/1.png", 0, 0)
	wantActor(t, db, "news.image", userID)
}

func TestUploadingAGIFKeepsItsAnimation(t *testing.T) {
	db, mux := newSite(t)
	userID, cookie := newsWriter(t, db)
	data, want := animation(t, 300, 187, 3)
	sent := withGIFComment(data, "SECRET", "SECRET-TAIL")
	if _, err := gif.DecodeAll(bytes.NewReader(sent)); err != nil {
		t.Fatalf("the GIF with a comment does not decode: %v", err)
	}

	wantAnswer(t, uploadImage(mux, cookie, sent), http.StatusOK, imageAnswer{Path: "/news/images/1.gif"})
	stored := imageRow(t, db, 1)
	if stored.format != "gif" || stored.width != 300 || stored.height != 187 || stored.creator.Int64 != userID {
		t.Errorf("stored %s %dx%d by %v", stored.format, stored.width, stored.height, stored.creator)
	}
	if bytes.Contains(stored.data, []byte("SECRET")) {
		t.Error("the comment or the bytes after the GIF were stored")
	}
	got, err := gif.DecodeAll(bytes.NewReader(stored.data))
	if err != nil {
		t.Fatalf("the stored GIF does not decode: %v", err)
	}
	if len(got.Image) != 3 || fmt.Sprint(got.Delay) != fmt.Sprint(want.Delay) || got.LoopCount != want.LoopCount ||
		fmt.Sprint(got.Disposal) != fmt.Sprint(want.Disposal) {
		t.Fatalf("stored %d frames, delays %v, loop %d, disposal %v; want 3, %v, %d, %v",
			len(got.Image), got.Delay, got.LoopCount, got.Disposal, want.Delay, want.LoopCount, want.Disposal)
	}
	for i := range got.Image {
		samePixels(t, got.Image[i], want.Image[i])
	}
	wantOneLog(t, db, "news.image", "/news/images/1.gif", 0, 0)
	wantActor(t, db, "news.image", userID)
}

func TestABadImageIsRefused(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := newsWriter(t, db)

	var jpg bytes.Buffer
	if err := jpeg.Encode(&jpg, picture(300, 187), nil); err != nil {
		t.Fatal(err)
	}
	full := pngOf(t, picture(300, 187))
	moving, _ := animation(t, 300, 187, 2)
	tooLong := flicker(t, 501)
	wide, _ := animation(t, 301, 187, 2)

	for _, c := range []struct {
		name   string
		body   []byte
		status int
		want   string
	}{
		{"nothing", nil, http.StatusUnprocessableEntity, imageInvalid},
		{"text", []byte("a picture, honestly"), http.StatusUnprocessableEntity, imageInvalid},
		{"a JPEG", jpg.Bytes(), http.StatusUnprocessableEntity, imageInvalid},
		{"a PNG too wide", pngOf(t, picture(301, 187)), http.StatusUnprocessableEntity, imageInvalid},
		{"a PNG too short", pngOf(t, picture(300, 186)), http.StatusUnprocessableEntity, imageInvalid},
		{"a PNG on its side", pngOf(t, picture(187, 300)), http.StatusUnprocessableEntity, imageInvalid},
		{"a PNG cut short", full[:len(full)/2], http.StatusUnprocessableEntity, imageInvalid},
		{"a GIF too wide", wide, http.StatusUnprocessableEntity, imageInvalid},
		{"a GIF cut short", moving[:len(moving)/2], http.StatusUnprocessableEntity, imageInvalid},
		{"a GIF without its end", moving[:len(moving)-1], http.StatusUnprocessableEntity, imageInvalid},
		{"a GIF of 501 frames", tooLong, http.StatusUnprocessableEntity, "The GIF must have at most 500 frames."},
		{"a body past 2 MB", append(full, make([]byte, 2<<20)...), http.StatusRequestEntityTooLarge, "The image must be at most 2 MB."},
	} {
		t.Run(c.name, func(t *testing.T) {
			wantAnswer(t, uploadImage(mux, cookie, c.body), c.status, imageAnswer{Error: c.want})
		})
	}
	if got := count(t, db, `SELECT COUNT(*) FROM images`); got != 0 {
		t.Errorf("%d images", got)
	}
	if rows := staffLogs(t, db); len(rows) != 0 {
		t.Errorf("%d log rows", len(rows))
	}
}

func TestAGIFOf500FramesIsTaken(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := newsWriter(t, db)
	data := flicker(t, 500)

	wantAnswer(t, uploadImage(mux, cookie, data), http.StatusOK, imageAnswer{Path: "/news/images/1.gif"})
	got, err := gif.DecodeAll(bytes.NewReader(imageRow(t, db, 1).data))
	if err != nil || len(got.Image) != 500 {
		t.Errorf("stored a GIF of %v frames: %v", got, err)
	}
}

func TestAnUploadedImageIsATopStory(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := newsWriter(t, db)
	wantAnswer(t, uploadImage(mux, cookie, pngOf(t, picture(300, 187))), http.StatusOK, imageAnswer{Path: "/news/images/1.png"})
	moving, _ := animation(t, 300, 187, 2)
	wantAnswer(t, uploadImage(mux, cookie, moving), http.StatusOK, imageAnswer{Path: "/news/images/2.gif"})

	for _, path := range []string{"/news/images/1.png", "/news/images/2.gif"} {
		wantRedirect(t, serve(mux, "POST", "/housekeeping/news", cookie, articleForm("Uploaded", path)), "/housekeeping/news?published=1")
		article := newestArticle(t, db)
		if article.ImageURL != path {
			t.Errorf("the picture is %q, want %q", article.ImageURL, path)
		}
		wantPage(t, serve(mux, "GET", articleURL(article.ID), cookie, nil), http.StatusOK, "Preview:http://localhost:17387"+path)
	}

	for _, path := range []string{
		"/news/images/3.png",
		"/news/images/1.gif",
		"/news/images/2.png",
		"/news/images/01.png",
		"/news/images/1.png?size=2",
		"/news/images/1.png/",
		"/news/images/1",
		"/news/images/0.png",
		"/news/images/-1.png",
		"/news/images/1.png.png",
	} {
		wantPage(t, serve(mux, "POST", "/housekeeping/news", cookie, articleForm("Uploaded", path)), http.StatusUnprocessableEntity,
			"Error:"+newsImageInvalid)
	}
	if got := count(t, db, `SELECT COUNT(*) FROM news_articles`); got != 2 {
		t.Errorf("%d articles, want 2", got)
	}
}

// The editor uploads a picture before the article is saved, so the form keeps
// what was typed around it.
func TestAnUploadLeavesTheArticleAlone(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "author@example.com", "Author")
	id := oldArticle(t, db, habboOf(t, db, "Author").ID, "News")
	before := newsArticle(t, db, id)
	_, cookie := newsWriter(t, db)

	wantAnswer(t, uploadImage(mux, cookie, pngOf(t, picture(300, 187))), http.StatusOK, imageAnswer{Path: "/news/images/1.png"})
	if after := newsArticle(t, db, id); !sameArticle(after, before) {
		t.Errorf("article = %+v, want %+v", after, before)
	}
	form := url.Values{"title": {"Old news"}, "category": {"News"}, "topstory": {"/news/images/1.png"}, "short_story": {"Old summary"}, "story": {"Old body"}}
	wantRedirect(t, serve(mux, "POST", articleURL(id), cookie, form), "/housekeeping/news?updated=1")
	wantOneLog(t, db, "news.update", fmt.Sprintf("Old news (ID: %d): topstory", id), 0, 0)
	if _, err := store.New(db).GetImage(t.Context(), 1); err != nil {
		t.Errorf("GetImage: %v", err)
	}
}

func TestAnArticleLinksItsUploadedPicture(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := newsWriter(t, db)
	wantAnswer(t, uploadImage(mux, cookie, pngOf(t, picture(300, 187))), http.StatusOK, imageAnswer{Path: "/news/images/1.png"})

	wantRedirect(t, serve(mux, "POST", "/housekeeping/news", cookie, articleForm("Linked", "/news/images/1.png")), "/housekeeping/news?published=1")
	id := newestArticle(t, db).ID
	linked := sql.NullInt64{Int64: 1, Valid: true}
	if got := newsArticle(t, db, id); got.ImageID != linked || got.ImageURL != "/news/images/1.png" {
		t.Errorf("the new article shows %q linked to %v, want the upload", got.ImageURL, got.ImageID)
	}

	for _, c := range []struct {
		address string
		want    sql.NullInt64
	}{
		{seed.DefaultTopStory, sql.NullInt64{}},
		{"/news/images/1.png", linked},
		{"https://images.example.com/top.png", sql.NullInt64{}},
	} {
		wantRedirect(t, serve(mux, "POST", articleURL(id), cookie, articleForm("Linked", c.address)), "/housekeeping/news?updated=1")
		if got := newsArticle(t, db, id); got.ImageID != c.want || got.ImageURL != c.address {
			t.Errorf("after %s the article shows %q linked to %v, want %v", c.address, got.ImageURL, got.ImageID, c.want)
		}
	}
	if rows := logsOf(t, db, "news.update"); len(rows) != 3 {
		t.Errorf("%d update rows, want 3", len(rows))
	}

	if _, err := db.ExecContext(t.Context(), `UPDATE news_articles SET image_url = '/news/images/1.png', image_id = NULL WHERE id = ?`, id); err != nil {
		t.Fatal(err)
	}
	wantRedirect(t, serve(mux, "POST", articleURL(id), cookie, articleForm("Linked", "/news/images/1.png")), "/housekeeping/news?updated=1")
	if got := newsArticle(t, db, id); got.ImageID != linked {
		t.Errorf("saving an upload whose link was missing left it at %v", got.ImageID)
	}
}

func TestTheNewsFormOffersTheUploads(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := newsWriter(t, db)
	wantPage(t, serve(mux, "GET", "/housekeeping/news/new", cookie, nil), http.StatusOK, "news/new.html", "Uploads:[] Message:")

	wantAnswer(t, uploadImage(mux, cookie, pngOf(t, picture(300, 187))), http.StatusOK, imageAnswer{Path: "/news/images/1.png"})
	moving, _ := animation(t, 300, 187, 2)
	wantAnswer(t, uploadImage(mux, cookie, moving), http.StatusOK, imageAnswer{Path: "/news/images/2.gif"})
	const offered = "Uploads:[/news/images/2.gif /news/images/1.png] Message:"

	wantPage(t, serve(mux, "GET", "/housekeeping/news/new", cookie, nil), http.StatusOK, "news/new.html", offered)
	wantRedirect(t, serve(mux, "POST", "/housekeeping/news", cookie, articleForm("Picked", "/news/images/1.png")), "/housekeeping/news?published=1")
	id := newestArticle(t, db).ID
	wantPage(t, serve(mux, "GET", articleURL(id), cookie, nil), http.StatusOK, "news/id.html", offered)
	wantPage(t, serve(mux, "POST", "/housekeeping/news", cookie, articleForm("Refused", "javascript:alert(1)")), http.StatusUnprocessableEntity,
		"news/new.html", offered)
	wantPage(t, serve(mux, "POST", articleURL(id), cookie, articleForm("Refused", "javascript:alert(1)")), http.StatusUnprocessableEntity,
		"news/id.html", offered)
}

// Staff can delete a picture while another has the form open. The triggers
// delete it between the check and the write, as that would.
func TestAPictureDeletedMeanwhileIsRefused(t *testing.T) {
	db, mux := newSite(t)
	habbo(t, db, "author@example.com", "Author")
	id := oldArticle(t, db, habboOf(t, db, "Author").ID, "News")
	before := newsArticle(t, db, id)
	_, cookie := newsWriter(t, db)
	for _, path := range []string{"/news/images/1.png", "/news/images/2.png"} {
		wantAnswer(t, uploadImage(mux, cookie, pngOf(t, picture(300, 187))), http.StatusOK, imageAnswer{Path: path})
	}
	for _, trigger := range []string{
		"CREATE TRIGGER delete_on_insert BEFORE INSERT ON news_articles BEGIN DELETE FROM images WHERE id = NEW.image_id; END",
		"CREATE TRIGGER delete_on_update BEFORE UPDATE ON news_articles BEGIN DELETE FROM images WHERE id = NEW.image_id; END",
	} {
		if _, err := db.ExecContext(t.Context(), trigger); err != nil {
			t.Fatal(err)
		}
	}

	wantPage(t, serve(mux, "POST", "/housekeeping/news", cookie, articleForm("Late", "/news/images/1.png")), http.StatusUnprocessableEntity,
		"news/new.html", "Form:{Title:Late Category:Tips TopStory:/news/images/1.png", "Error:"+newsImageInvalid)
	wantPage(t, serve(mux, "POST", articleURL(id), cookie, articleForm("Late", "/news/images/2.png")), http.StatusUnprocessableEntity,
		"news/id.html", fmt.Sprintf("ID:%d Title:Old news Form:{Title:Late Category:Tips TopStory:/news/images/2.png", id), "Error:"+newsImageInvalid)

	if got := count(t, db, `SELECT COUNT(*) FROM news_articles`); got != 1 {
		t.Errorf("%d articles, want 1", got)
	}
	if after := newsArticle(t, db, id); !sameArticle(after, before) || after.ImageID.Valid {
		t.Errorf("article = %+v, want %+v", after, before)
	}
	if got := count(t, db, `SELECT COUNT(*) FROM images`); got != 2 {
		t.Errorf("%d images, want the refused writes to delete nothing", got)
	}
	if rows := len(logsOf(t, db, "news.create")) + len(logsOf(t, db, "news.update")); rows != 0 {
		t.Errorf("%d news log rows", rows)
	}
}
