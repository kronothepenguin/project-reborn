package cms

import (
	"io/fs"
	"regexp"
	"strings"
	"testing"
)

var (
	templateOpen = regexp.MustCompile(`\[\[-? *(if|range|with|block|define) `)
	templateEnd  = regexp.MustCompile(`\[\[-? *end *-?\]\]`)
)

// Astro writes the script that wakes every island before a page's first island.
// When the Go template leaves that island out, as an [[ if ]] does for some
// visitors, the script goes with it and the page's other islands never wake. A
// page with one island loses nothing, since the script goes with that island.
func TestEveryPageWakesItsIslandsForEveryone(t *testing.T) {
	err := fs.WalkDir(DistFS, "dist", func(path string, d fs.DirEntry, err error) error {
		if err != nil || d.IsDir() || !strings.HasSuffix(path, ".html") {
			return err
		}
		data, err := fs.ReadFile(DistFS, path)
		if err != nil {
			return err
		}
		page := string(data)
		island := strings.Index(page, "<astro-island")
		if strings.Count(page, "<astro-island") < 2 {
			return nil
		}
		script := strings.LastIndex(page[:island], "<script>")
		if script < 0 {
			t.Errorf("%s: no script before its first island", path)
			return nil
		}
		before := page[:script]
		if depth := len(templateOpen.FindAllString(before, -1)) - len(templateEnd.FindAllString(before, -1)); depth != 0 {
			t.Errorf("%s: the island script stands inside %d template blocks", path, depth)
		}
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
}
