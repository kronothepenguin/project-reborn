package router

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"net/url"
	"slices"
	"strconv"
	"strings"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/cms/seed"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

const (
	newsPublished     = "Article published successfully."
	newsUpdated       = "Article updated successfully."
	newsDeleted       = "Article deleted successfully."
	newsEditMissing   = "Unable to edit article; this article does not exist!"
	newsDeleteMissing = "Unable to delete article; this article does not exist!"
	newsImageInvalid  = "The topstory image must be one of the local images, an uploaded image or an http(s) address."
)

// newsDateFormat is the date Holo's news pages show.
const newsDateFormat = "2006-01-02"

// newsCategories are the choices of Holo's form, in its order.
func newsCategories() []string {
	return []string{
		"HoloCMS", "News", "Furniture", "Updates", "Server", "Credits",
		settings.GetString("site.shortName") + " Club",
		"Maintenance", "Technical", "Downtime", "Website", "Special Offers", "Sponsored",
		"Events & Competitions", "Security", "Staff", "Announcements", "Tips", "Holograph Emulator", "Other",
	}
}

// newsForm is an article as its form shows it, so that a refused one shows what
// was typed. The fields carry Holo's names.
type newsForm struct {
	Title      string
	Category   string
	TopStory   string
	ShortStory string
	Story      string
}

func readNewsForm(req *http.Request) newsForm {
	return newsForm{
		Title:      req.PostFormValue("title"),
		Category:   req.PostFormValue("category"),
		TopStory:   strings.TrimSpace(req.PostFormValue("topstory")),
		ShortStory: req.PostFormValue("short_story"),
		Story:      req.PostFormValue("story"),
	}
}

type newsPage struct {
	chrome
	Articles []newsRow
	Message  string
	Error    string
}

type newsRow struct {
	ID      int64
	Title   string
	Summary string
	Date    string
	Author  string
}

// newsArticlePage is the compose form, with an ID of 0, and the edit form, whose
// heading keeps the saved title while the fields show what was typed.
type newsArticlePage struct {
	chrome
	ID         int64
	Title      string
	Form       newsForm
	Categories []newsCategory
	TopStories []string
	Preview    string
	// Uploads are the paths of the uploaded pictures, newest first, which the
	// image editor offers in its Uploaded mode.
	Uploads []string
	Message string
	Error   string
}

type newsCategory struct {
	Name     string
	Selected bool
}

// newsCategoryOptions selects the article's category. Holo's form selected
// HoloCMS for Other and Events & Competitions, so saving moved them there; and a
// category that is not offered, such as the club of an older short name, stays
// as a choice of its own.
func newsCategoryOptions(selected string) []newsCategory {
	categories := newsCategories()
	options := make([]newsCategory, 0, len(categories)+1)
	for _, name := range categories {
		options = append(options, newsCategory{Name: name, Selected: name == selected})
	}
	if !slices.Contains(categories, selected) {
		options = append(options, newsCategory{Name: selected, Selected: true})
	}
	return options
}

// webAddress reports whether address is an absolute http or https address.
func webAddress(address string) bool {
	u, err := url.Parse(address)
	return err == nil && (u.Scheme == "http" || u.Scheme == "https") && u.Host != ""
}

// topStory accepts only addresses that are safe in the src of the CMS's pages:
// Holo's local pictures, uploaded images and http(s) addresses. For an uploaded
// image it also returns the image, which the article links to.
func (r *Router) topStory(ctx context.Context, address string) (image sql.NullInt64, valid bool, err error) {
	if slices.Contains(seed.TopStories(), address) || webAddress(address) {
		return sql.NullInt64{}, true, nil
	}
	id, uploaded, err := r.uploadedImage(ctx, address)
	return sql.NullInt64{Int64: id, Valid: uploaded}, uploaded, err
}

// sitePicture is the address housekeeping loads a picture from. A path is the
// CMS's, at site.url, because housekeeping may run on another port.
func sitePicture(address string) string {
	if strings.HasPrefix(address, "/") {
		return settings.GetString("site.url") + address
	}
	return address
}

func (r *Router) newNewsPage(req *http.Request) (newsPage, error) {
	page := newsPage{chrome: r.chrome(req)}
	articles, err := r.deps.Queries.ListNewsArticles(req.Context())
	if err != nil {
		return page, err
	}
	for _, article := range articles {
		page.Articles = append(page.Articles, newsRow{
			ID:      article.ID,
			Title:   article.Title,
			Summary: article.Summary,
			Date:    article.PublishedAt.UTC().Format(newsDateFormat),
			Author:  article.Author,
		})
	}
	return page, nil
}

func (r *Router) newNewsArticlePage(req *http.Request, id int64, title string, form newsForm) (newsArticlePage, error) {
	page := newsArticlePage{
		chrome:     r.chrome(req),
		ID:         id,
		Title:      title,
		Form:       form,
		Categories: newsCategoryOptions(form.Category),
		TopStories: seed.TopStories(),
		Preview:    sitePicture(form.TopStory),
	}
	images, err := r.deps.Queries.ListImages(req.Context())
	if err != nil {
		return page, err
	}
	for _, image := range images {
		page.Uploads = append(page.Uploads, newsImagePath(image.ID, image.Format))
	}
	return page, nil
}

// HandleNewsView renders GET /housekeeping/news, Holo's news_manage: every
// article, newest first.
func (r *Router) HandleNewsView(w http.ResponseWriter, req *http.Request) {
	page, err := r.newNewsPage(req)
	if err != nil {
		r.fail(w, err)
		return
	}
	switch query := req.URL.Query(); {
	case query.Has("published"):
		page.Message = newsPublished
	case query.Has("updated"):
		page.Message = newsUpdated
	case query.Has("deleted"):
		page.Message = newsDeleted
	}
	astro.WriteTemplate(w, r.deps.Resolver, "news.html", page)
}

// newsMissing answers with Holo's list and its message for an article that does
// not exist, with 404.
func (r *Router) newsMissing(w http.ResponseWriter, req *http.Request, message string) {
	page, err := r.newNewsPage(req)
	if err != nil {
		r.fail(w, err)
		return
	}
	page.Error = message
	w.WriteHeader(http.StatusNotFound)
	astro.WriteTemplate(w, r.deps.Resolver, "news.html", page)
}

// newsArticle loads the article of the path, and answers newsMissing with
// missing when there is none.
func (r *Router) newsArticle(w http.ResponseWriter, req *http.Request, missing string) (store.GetNewsArticleRow, bool) {
	id, err := strconv.ParseInt(req.PathValue("id"), 10, 64)
	if err != nil {
		r.newsMissing(w, req, missing)
		return store.GetNewsArticleRow{}, false
	}
	article, err := r.deps.Queries.GetNewsArticle(req.Context(), id)
	switch {
	case store.IsNotFound(err):
		r.newsMissing(w, req, missing)
		return article, false
	case err != nil:
		r.fail(w, err)
		return article, false
	}
	return article, true
}

func (r *Router) refuseNews(w http.ResponseWriter, req *http.Request, name string, id int64, title string, form newsForm, message string) {
	page, err := r.newNewsArticlePage(req, id, title, form)
	if err != nil {
		r.fail(w, err)
		return
	}
	page.Error = message
	w.WriteHeader(http.StatusUnprocessableEntity)
	astro.WriteTemplate(w, r.deps.Resolver, name, page)
}

// HandleNewsComposeView renders GET /housekeeping/news/new, Holo's news_compose.
// A browser selected Holo's first category, and the picture starts as the
// default local one.
func (r *Router) HandleNewsComposeView(w http.ResponseWriter, req *http.Request) {
	form := newsForm{Category: newsCategories()[0], TopStory: seed.DefaultTopStory}
	page, err := r.newNewsArticlePage(req, 0, "", form)
	if err != nil {
		r.fail(w, err)
		return
	}
	astro.WriteTemplate(w, r.deps.Resolver, "news/new.html", page)
}

// HandleNewsCreate handles POST /housekeeping/news. The author is the staff
// member's active habbo, and the date is now.
func (r *Router) HandleNewsCreate(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	form := readNewsForm(req)
	image, valid, err := r.topStory(ctx, form.TopStory)
	if err != nil {
		r.fail(w, err)
		return
	}
	if !valid {
		r.refuseNews(w, req, "news/new.html", 0, "", form, newsImageInvalid)
		return
	}
	session, _ := auth.FromContext(ctx)
	now := time.Now().UTC()
	err = r.inTx(ctx, func(q *store.Queries) error {
		article, err := q.CreateNewsArticle(ctx, store.CreateNewsArticleParams{
			AvatarID:    sql.NullInt64{Int64: session.AvatarID, Valid: true},
			Title:       form.Title,
			Category:    form.Category,
			ImageURL:    form.TopStory,
			ImageID:     image,
			Summary:     form.ShortStory,
			Body:        form.Story,
			PublishedAt: now,
			CreatedAt:   now,
			UpdatedAt:   now,
		})
		if err != nil {
			return err
		}
		return writeLog(req, q, staffLog{action: actionNewsCreate, detail: fmt.Sprintf("%s (ID: %d)", article.Title, article.ID)})
	})
	switch {
	// The uploaded picture was deleted after the check.
	case store.IsForeignKey(err):
		r.refuseNews(w, req, "news/new.html", 0, "", form, newsImageInvalid)
	case err != nil:
		r.fail(w, err)
	default:
		http.Redirect(w, req, "/housekeeping/news?published=1", http.StatusSeeOther)
	}
}

// HandleNewsArticleView renders GET /housekeeping/news/{id}, the edit form of
// Holo's news_manage.
func (r *Router) HandleNewsArticleView(w http.ResponseWriter, req *http.Request) {
	article, ok := r.newsArticle(w, req, newsEditMissing)
	if !ok {
		return
	}
	form := newsForm{
		Title:      article.Title,
		Category:   article.Category,
		TopStory:   article.ImageURL,
		ShortStory: article.Summary,
		Story:      article.Body,
	}
	page, err := r.newNewsArticlePage(req, article.ID, article.Title, form)
	if err != nil {
		r.fail(w, err)
		return
	}
	astro.WriteTemplate(w, r.deps.Resolver, "news/id.html", page)
}

// HandleNewsArticleSave handles POST /housekeeping/news/{id}. The author and the
// date stay, as in Holo, and Holo's list answers.
func (r *Router) HandleNewsArticleSave(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	article, ok := r.newsArticle(w, req, newsEditMissing)
	if !ok {
		return
	}
	form := readNewsForm(req)
	image, valid, err := r.topStory(ctx, form.TopStory)
	if err != nil {
		r.fail(w, err)
		return
	}
	if !valid {
		r.refuseNews(w, req, "news/id.html", article.ID, article.Title, form, newsImageInvalid)
		return
	}

	err = r.inTx(ctx, func(q *store.Queries) error {
		saved, err := q.GetNewsArticle(ctx, article.ID)
		if err != nil {
			return err
		}
		var changed []string
		if form.Title != saved.Title {
			changed = append(changed, "title")
		}
		if form.Category != saved.Category {
			changed = append(changed, "category")
		}
		if form.TopStory != saved.ImageURL || image != saved.ImageID {
			changed = append(changed, "topstory")
		}
		if form.ShortStory != saved.Summary {
			changed = append(changed, "short_story")
		}
		if form.Story != saved.Body {
			changed = append(changed, "story")
		}
		if len(changed) == 0 {
			return nil
		}
		_, err = q.UpdateNewsArticle(ctx, store.UpdateNewsArticleParams{
			ID:        article.ID,
			Title:     form.Title,
			Category:  form.Category,
			ImageURL:  form.TopStory,
			ImageID:   image,
			Summary:   form.ShortStory,
			Body:      form.Story,
			UpdatedAt: time.Now().UTC(),
		})
		if err != nil {
			return err
		}
		// staff_logs has no column for an article, so the detail names it.
		return writeLog(req, q, staffLog{
			action: actionNewsUpdate,
			detail: fmt.Sprintf("%s (ID: %d): %s", form.Title, article.ID, strings.Join(changed, ", ")),
		})
	})
	switch {
	case store.IsNotFound(err):
		r.newsMissing(w, req, newsEditMissing)
	// The uploaded picture was deleted after the check.
	case store.IsForeignKey(err):
		r.refuseNews(w, req, "news/id.html", article.ID, article.Title, form, newsImageInvalid)
	case err != nil:
		r.fail(w, err)
	default:
		http.Redirect(w, req, "/housekeeping/news?updated=1", http.StatusSeeOther)
	}
}

// HandleNewsArticleDelete handles POST /housekeeping/news/{id}/delete. Holo
// deleted on a link, with no question asked.
func (r *Router) HandleNewsArticleDelete(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	id, err := strconv.ParseInt(req.PathValue("id"), 10, 64)
	if err != nil {
		r.newsMissing(w, req, newsDeleteMissing)
		return
	}
	err = r.inTx(ctx, func(q *store.Queries) error {
		article, err := q.GetNewsArticle(ctx, id)
		if err != nil {
			return err
		}
		if _, err := q.DeleteNewsArticle(ctx, id); err != nil {
			return err
		}
		return writeLog(req, q, staffLog{action: actionNewsDelete, detail: fmt.Sprintf("%s (ID: %d)", article.Title, id)})
	})
	switch {
	case store.IsNotFound(err):
		r.newsMissing(w, req, newsDeleteMissing)
	case err != nil:
		r.fail(w, err)
	default:
		http.Redirect(w, req, "/housekeeping/news?deleted=1", http.StatusSeeOther)
	}
}
