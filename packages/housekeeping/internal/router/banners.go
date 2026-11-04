package router

import (
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// Holo's spellings are kept, as its other texts are.
const (
	bannerAdded     = "Succesfully added!"
	bannerEdited    = "Succesfully edited!"
	bannerDeleted   = "Succesfully deleted!"
	bannerForgotten = "You're something forgotten!"
	bannerWrong     = "Something was going wrong!"
	bannerTooLong   = "The text must be at most 50 characters, and each url at most 255."
	bannerAddress   = "The urls must be http(s) addresses or paths of the site, such as /community."
)

// The lengths of Holo's form and of its columns.
const (
	maxBannerText = 50
	maxBannerURL  = 255
)

// bannerForm is a banner as its form shows it, with the names of Holo's fields.
type bannerForm struct {
	Text    string
	Banner  string
	URL     string
	Enabled bool
}

func readBannerForm(req *http.Request) bannerForm {
	return bannerForm{
		Text:    req.PostFormValue("text"),
		Banner:  strings.TrimSpace(req.PostFormValue("banner")),
		URL:     strings.TrimSpace(req.PostFormValue("url")),
		Enabled: req.PostFormValue("status") == "1",
	}
}

func bannerFormOf(banner store.Banner) bannerForm {
	return bannerForm{Text: banner.Title, Banner: banner.ImageURL, URL: banner.LinkURL, Enabled: banner.Enabled}
}

// sitePath reports whether address is a path of the site. A second slash or a
// backslash after the first would make a browser read another host.
func sitePath(address string) bool {
	u, err := url.Parse(address)
	return err == nil && u.Scheme == "" && u.Host == "" && strings.HasPrefix(address, "/") &&
		!strings.HasPrefix(address, "//") && !strings.Contains(address, `\`)
}

// linkable accepts the addresses a banner may show and link to.
func linkable(address string) bool {
	return webAddress(address) || sitePath(address)
}

// bannerRefusal says why a banner cannot be saved, or nothing. Holo asked for
// the image and the link, and allowed any address, javascript: too.
func bannerRefusal(form bannerForm) string {
	switch {
	case form.Banner == "" || form.URL == "":
		return bannerForgotten
	case utf8.RuneCountInString(form.Text) > maxBannerText ||
		utf8.RuneCountInString(form.Banner) > maxBannerURL || utf8.RuneCountInString(form.URL) > maxBannerURL:
		return bannerTooLong
	case !linkable(form.Banner) || !linkable(form.URL):
		return bannerAddress
	}
	return ""
}

// bannerName names a banner in the log, whose text may be blank.
func bannerName(text string, id int64) string {
	return strings.TrimSpace(fmt.Sprintf("%s (ID: %d)", text, id))
}

// bannersPage is Holo's page of banners. Holo answered each form in its own box,
// so the add form and the list each have a message.
type bannersPage struct {
	chrome
	Form        bannerForm
	Banners     []bannerRow
	Message     string
	Error       string
	ListMessage string
	ListError   string
}

type bannerRow struct {
	ID int64
	bannerForm
}

type bannerPage struct {
	chrome
	ID      int64
	Form    bannerForm
	Message string
	Error   string
}

type bannerDeletePage struct {
	chrome
	ID   int64
	Text string
}

func (r *Router) newBannersPage(req *http.Request, form bannerForm) (bannersPage, error) {
	page := bannersPage{chrome: r.chrome(req), Form: form}
	banners, err := r.deps.Queries.ListBanners(req.Context())
	if err != nil {
		return page, err
	}
	for _, banner := range banners {
		page.Banners = append(page.Banners, bannerRow{ID: banner.ID, bannerForm: bannerFormOf(banner)})
	}
	return page, nil
}

// HandleBannersView renders GET /housekeeping/banners, Holo's banners page: the
// add form, then every banner in the order it was added.
func (r *Router) HandleBannersView(w http.ResponseWriter, req *http.Request) {
	page, err := r.newBannersPage(req, bannerForm{})
	if err != nil {
		r.fail(w, err)
		return
	}
	switch query := req.URL.Query(); {
	case query.Has("added"):
		page.Message = bannerAdded
	case query.Has("deleted"):
		page.ListMessage = bannerDeleted
	}
	astro.WriteTemplate(w, r.deps.Resolver, "banners.html", page)
}

// bannerMissing answers Holo's page, with its failure in the list and 404, for a
// banner that does not exist.
func (r *Router) bannerMissing(w http.ResponseWriter, req *http.Request) {
	page, err := r.newBannersPage(req, bannerForm{})
	if err != nil {
		r.fail(w, err)
		return
	}
	page.ListError = bannerWrong
	w.WriteHeader(http.StatusNotFound)
	astro.WriteTemplate(w, r.deps.Resolver, "banners.html", page)
}

// bannerFromPath loads the banner of the path, and answers bannerMissing when
// there is none.
func (r *Router) bannerFromPath(w http.ResponseWriter, req *http.Request) (store.Banner, bool) {
	id, err := strconv.ParseInt(req.PathValue("id"), 10, 64)
	if err != nil {
		r.bannerMissing(w, req)
		return store.Banner{}, false
	}
	banner, err := r.deps.Queries.GetBanner(req.Context(), id)
	switch {
	case store.IsNotFound(err):
		r.bannerMissing(w, req)
		return banner, false
	case err != nil:
		r.fail(w, err)
		return banner, false
	}
	return banner, true
}

// HandleBannersCreate handles POST /housekeeping/banners, Holo's Add banner,
// which never added anything there: it asked for an id the form did not send.
func (r *Router) HandleBannersCreate(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	form := readBannerForm(req)
	if refusal := bannerRefusal(form); refusal != "" {
		page, err := r.newBannersPage(req, form)
		if err != nil {
			r.fail(w, err)
			return
		}
		page.Error = refusal
		w.WriteHeader(http.StatusUnprocessableEntity)
		astro.WriteTemplate(w, r.deps.Resolver, "banners.html", page)
		return
	}
	now := time.Now().UTC()
	err := r.inTx(ctx, func(q *store.Queries) error {
		banner, err := q.CreateBanner(ctx, store.CreateBannerParams{
			Title:     form.Text,
			ImageURL:  form.Banner,
			LinkURL:   form.URL,
			Enabled:   form.Enabled,
			CreatedAt: now,
			UpdatedAt: now,
		})
		if err != nil {
			return err
		}
		return writeLog(req, q, staffLog{action: actionBannersCreate, detail: bannerName(banner.Title, banner.ID)})
	})
	if err != nil {
		r.fail(w, err)
		return
	}
	http.Redirect(w, req, "/housekeeping/banners?added=1", http.StatusSeeOther)
}

// HandleBannerView renders GET /housekeeping/banners/{id}, Holo's Edit banner!
// view.
func (r *Router) HandleBannerView(w http.ResponseWriter, req *http.Request) {
	banner, ok := r.bannerFromPath(w, req)
	if !ok {
		return
	}
	page := bannerPage{chrome: r.chrome(req), ID: banner.ID, Form: bannerFormOf(banner)}
	if req.URL.Query().Has("saved") {
		page.Message = bannerEdited
	}
	astro.WriteTemplate(w, r.deps.Resolver, "banners/id.html", page)
}

// HandleBannerSave handles POST /housekeeping/banners/{id}. Holo stayed on the
// edit view, which answers here too.
func (r *Router) HandleBannerSave(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	banner, ok := r.bannerFromPath(w, req)
	if !ok {
		return
	}
	form := readBannerForm(req)
	if refusal := bannerRefusal(form); refusal != "" {
		page := bannerPage{chrome: r.chrome(req), ID: banner.ID, Form: form, Error: refusal}
		w.WriteHeader(http.StatusUnprocessableEntity)
		astro.WriteTemplate(w, r.deps.Resolver, "banners/id.html", page)
		return
	}
	err := r.inTx(ctx, func(q *store.Queries) error {
		saved, err := q.GetBanner(ctx, banner.ID)
		if err != nil {
			return err
		}
		var changed []string
		if form.Text != saved.Title {
			changed = append(changed, "text")
		}
		if form.Banner != saved.ImageURL {
			changed = append(changed, "banner")
		}
		if form.URL != saved.LinkURL {
			changed = append(changed, "url")
		}
		if form.Enabled != saved.Enabled {
			changed = append(changed, "status")
		}
		if len(changed) == 0 {
			return nil
		}
		_, err = q.UpdateBanner(ctx, store.UpdateBannerParams{
			ID:        banner.ID,
			Title:     form.Text,
			ImageURL:  form.Banner,
			LinkURL:   form.URL,
			Enabled:   form.Enabled,
			UpdatedAt: time.Now().UTC(),
		})
		if err != nil {
			return err
		}
		return writeLog(req, q, staffLog{
			action: actionBannersUpdate,
			detail: fmt.Sprintf("%s: %s", bannerName(form.Text, banner.ID), strings.Join(changed, ", ")),
		})
	})
	switch {
	case store.IsNotFound(err):
		r.bannerMissing(w, req)
	case err != nil:
		r.fail(w, err)
	default:
		http.Redirect(w, req, fmt.Sprintf("/housekeeping/banners/%d?saved=1", banner.ID), http.StatusSeeOther)
	}
}

// HandleBannerDeleteView renders GET /housekeeping/banners/{id}/delete, Holo's
// question before a banner is deleted.
func (r *Router) HandleBannerDeleteView(w http.ResponseWriter, req *http.Request) {
	banner, ok := r.bannerFromPath(w, req)
	if !ok {
		return
	}
	page := bannerDeletePage{chrome: r.chrome(req), ID: banner.ID, Text: banner.Title}
	astro.WriteTemplate(w, r.deps.Resolver, "banners/id/delete.html", page)
}

// HandleBannerDelete handles POST /housekeeping/banners/{id}/delete. Holo stayed
// on the question, about a banner that was gone; here the list answers.
func (r *Router) HandleBannerDelete(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	id, err := strconv.ParseInt(req.PathValue("id"), 10, 64)
	if err != nil {
		r.bannerMissing(w, req)
		return
	}
	err = r.inTx(ctx, func(q *store.Queries) error {
		banner, err := q.GetBanner(ctx, id)
		if err != nil {
			return err
		}
		if _, err := q.DeleteBanner(ctx, id); err != nil {
			return err
		}
		return writeLog(req, q, staffLog{action: actionBannersDelete, detail: bannerName(banner.Title, id)})
	})
	switch {
	case store.IsNotFound(err):
		r.bannerMissing(w, req)
	case err != nil:
		r.fail(w, err)
	default:
		http.Redirect(w, req, "/housekeeping/banners?deleted=1", http.StatusSeeOther)
	}
}
