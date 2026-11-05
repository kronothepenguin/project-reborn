package router

import (
	"reflect"
	"testing"
)

// A field of a page hides the layout's field with the same name, and the layout
// then prints the wrong thing: the staff page's list once showed guests the
// Housekeeping tab. The tests of the handlers stand in for the layout, so they
// cannot see it.
func TestNoPageHidesAFieldOfTheLayout(t *testing.T) {
	for layout, pages := range map[reflect.Type][]reflect.Type{
		reflect.TypeFor[community](): {
			reflect.TypeFor[accountPage](),
			reflect.TypeFor[communityPage](),
			reflect.TypeFor[emailPage](),
			reflect.TypeFor[groupMissingPage](),
			reflect.TypeFor[groupPage](),
			reflect.TypeFor[groupEditPage](),
			reflect.TypeFor[habbosPage](),
			reflect.TypeFor[homeEditPage](),
			reflect.TypeFor[homeMissingPage](),
			reflect.TypeFor[homePage](),
			reflect.TypeFor[looksPage](),
			reflect.TypeFor[mePage](),
			reflect.TypeFor[newsArticlePage](),
			reflect.TypeFor[newsListPage](),
			reflect.TypeFor[passwordPage](),
			reflect.TypeFor[profilePage](),
			reflect.TypeFor[referralPage](),
			reflect.TypeFor[staffPage](),
			reflect.TypeFor[tagsPage](),
		},
		reflect.TypeFor[hotelStatus](): {
			reflect.TypeFor[forgotPage](),
			reflect.TypeFor[indexPage](),
			reflect.TypeFor[logoutPage](),
			reflect.TypeFor[registerPage](),
			reflect.TypeFor[resetPage](),
		},
	} {
		for _, want := range reflect.VisibleFields(layout) {
			if want.Anonymous {
				continue
			}
			for _, page := range pages {
				got, ok := page.FieldByName(want.Name)
				if !ok || !inside(page, got.Index, layout) {
					t.Errorf("%s hides %s.%s", page.Name(), layout.Name(), want.Name)
				}
			}
		}
	}
}

// inside reports whether the field at index in page is reached through a field
// of type layout, as the layout's own field is.
func inside(page reflect.Type, index []int, layout reflect.Type) bool {
	current := page
	for _, i := range index {
		field := current.Field(i)
		if field.Type == layout {
			return true
		}
		current = field.Type
	}
	return false
}
