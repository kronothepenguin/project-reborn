package cms

import (
	"fmt"
	"net/http"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

func TestUploadedImagesAreServedByTheirIDAndFormat(t *testing.T) {
	db, mux := newSite(t)
	data := []byte("GIF89a stands in for a picture")
	id, err := store.New(db).CreateImage(t.Context(), store.CreateImageParams{Format: "gif", Data: data, Width: 300, Height: 187, CreatedAt: testNow})
	if err != nil {
		t.Fatal(err)
	}

	rec := serve(mux, "GET", fmt.Sprintf("/news/images/%d.gif", id), nil, nil)
	if rec.Code != http.StatusOK || rec.Body.String() != string(data) {
		t.Fatalf("GET the image = %d %q", rec.Code, rec.Body)
	}
	for header, want := range map[string]string{
		"Content-Type":           "image/gif",
		"Cache-Control":          "public, max-age=31536000, immutable",
		"X-Content-Type-Options": "nosniff",
	} {
		if got := rec.Header().Get(header); got != want {
			t.Errorf("%s = %q, want %q", header, got, want)
		}
	}
	for _, path := range []string{
		fmt.Sprintf("/news/images/%d.png", id), fmt.Sprintf("/news/images/%d", id), fmt.Sprintf("/news/images/%d.gif", id+1),
		"/news/images/abc.gif", "/news/images/0.gif", "/news/images/-1.gif",
	} {
		if rec := serve(mux, "GET", path, nil, nil); rec.Code != http.StatusNotFound {
			t.Errorf("GET %s = %d, want 404", path, rec.Code)
		}
	}
}
