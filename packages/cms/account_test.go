package cms

import (
	"net/http"
	"net/url"
	"testing"
)

func TestAccountSendsGuestsHome(t *testing.T) {
	_, mux := newSite(t)
	wantRedirect(t, serve(mux, "GET", "/account", nil, nil), "/")
	wantRedirect(t, serve(mux, "GET", "/account/looks", nil, nil), "/")
	wantRedirect(t, serve(mux, "POST", "/account/looks", nil, url.Values{"figure": {newFigure}, "gender": {"F"}}), "/")
}

func TestAccountOpensOnLooks(t *testing.T) {
	db, mux := newSite(t)
	cookie, _, _ := member(t, db, mux)
	wantRedirect(t, serve(mux, "GET", "/account", cookie, nil), "/account/looks")
}

func TestLooksShowsTheHabbo(t *testing.T) {
	db, mux := newSite(t)
	cookie, _, _ := member(t, db, mux)
	wantPage(t, serve(mux, "GET", "/account/looks", cookie, nil), http.StatusOK, "account/looks.html", "Figure:"+newFigure, "Gender:F", "ClubDays:0")
}

func TestLooksChanges(t *testing.T) {
	db, mux := newSite(t)
	cookie, _, _ := member(t, db, mux)

	form := url.Values{"figure": {"hd-205-6"}, "gender": {"M"}}
	wantPage(t, serve(mux, "POST", "/account/looks", cookie, form), http.StatusOK, "Result:Account settings updated successfully.", "Failed:false", "Figure:hd-205-6", "Gender:M")
	wantPage(t, serve(mux, "GET", "/me", cookie, nil), http.StatusOK, "Figure:hd-205-6")
}

func TestLooksRefusesABadLook(t *testing.T) {
	for _, c := range []struct {
		name string
		form url.Values
		want string
	}{
		{"no gender", url.Values{"figure": {"hd-205-6"}}, "Result:An error occurred. Please try again."},
		{"unknown gender", url.Values{"figure": {"hd-205-6"}, "gender": {"U"}}, "Result:An error occurred. Please try again."},
		{"no figure", url.Values{"gender": {"M"}}, "Result:An error occurred trying to process your request."},
		{"malformed figure", url.Values{"figure": {"not a figure"}, "gender": {"M"}}, "Result:An error occurred trying to process your request."},
	} {
		t.Run(c.name, func(t *testing.T) {
			db, mux := newSite(t)
			cookie, _, _ := member(t, db, mux)

			wantPage(t, serve(mux, "POST", "/account/looks", cookie, c.form), http.StatusUnprocessableEntity, c.want, "Failed:true", "Figure:"+newFigure)
		})
	}
}
