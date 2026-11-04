package seed

import (
	"image"
	_ "image/gif"
	_ "image/png"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"testing"
)

func TestTheTopStoriesAreThePublicFiles(t *testing.T) {
	entries, err := os.ReadDir(filepath.Join(public, "web-gallery", "images", "top-story"))
	if err != nil {
		t.Fatal(err)
	}
	var files []string
	for _, entry := range entries {
		files = append(files, "/web-gallery/images/top-story/"+entry.Name())
	}
	if !slices.Equal(TopStories(), files) {
		t.Errorf("TopStories() = %v, the folder holds %v", TopStories(), files)
	}
	if !slices.Contains(TopStories(), DefaultTopStory) {
		t.Errorf("the default %s is not offered", DefaultTopStory)
	}
	for _, path := range TopStories() {
		f, err := os.Open(filepath.Join(public, strings.TrimPrefix(path, "/")))
		if err != nil {
			t.Fatal(err)
		}
		config, _, err := image.DecodeConfig(f)
		f.Close()
		if err != nil || config.Width != 300 || config.Height != 187 {
			t.Errorf("%s is %dx%d, %v, want 300x187", path, config.Width, config.Height, err)
		}
	}
}
