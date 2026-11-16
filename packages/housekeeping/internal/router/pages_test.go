package router

import (
	"reflect"
	"testing"
)

// A field of a page hides the field of chrome with the same name, and the layout
// then prints the wrong thing: the ticket page once named the asker as the one
// logged in. The tests of the handlers stand in for the layout, so they cannot see it.
func TestNoPageHidesAFieldOfTheLayout(t *testing.T) {
	layout := reflect.TypeFor[chrome]()
	for _, page := range []reflect.Type{
		reflect.TypeFor[accessDeniedPage](),
		reflect.TypeFor[accessGroupPage](),
		reflect.TypeFor[accessGroupsPage](),
		reflect.TypeFor[alertsPage](),
		reflect.TypeFor[bannerDeletePage](),
		reflect.TypeFor[bannerPage](),
		reflect.TypeFor[bannersPage](),
		reflect.TypeFor[bansPage](),
		reflect.TypeFor[dcrPage](),
		reflect.TypeFor[habboPage](),
		reflect.TypeFor[habbosPage](),
		reflect.TypeFor[helpPage](),
		reflect.TypeFor[homeStorePage](),
		reflect.TypeFor[imagesPage](),
		reflect.TypeFor[indexPage](),
		reflect.TypeFor[logsPage](),
		reflect.TypeFor[newsArticlePage](),
		reflect.TypeFor[newsPage](),
		reflect.TypeFor[settingsPage](),
		reflect.TypeFor[ticketPage](),
		reflect.TypeFor[transactionsPage](),
		reflect.TypeFor[vouchersPage](),
	} {
		for i := range layout.NumField() {
			name := layout.Field(i).Name
			field, _ := page.FieldByName(name)
			if len(field.Index) != 2 {
				t.Errorf("%s hides chrome.%s", page.Name(), name)
			}
		}
	}
}
