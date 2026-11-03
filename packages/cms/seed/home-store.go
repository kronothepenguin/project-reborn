// Package seed holds what the CMS's home store needs beside its rows, which the
// update packages/store/migrations/0002-home-store.sql writes: the art in the
// repository and the ids of the categories Holo fixed in its HTML.
package seed

import "slices"

// Holo's webstore listed its categories in fixed HTML, with these two under main
// categories of their own and every other one under Stickers.
const (
	BackgroundsCategory = 27
	NotesCategory       = 29
)

// Art returns the paths, under the CMS's public files, of the stickers and
// backgrounds a store item can show.
func Art() []string {
	return slices.Clone(art)
}
