package router

import (
	"context"
	"html/template"
	"net/http"
	"strconv"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/cms/internal/bbcode"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

const newsDateFormat = "2006-01-02"

// The lengths of Holo's lists: the headlines column, and a category's listing.
const (
	newsHeadlines  = 10
	newsInCategory = 25
)

type newsPage struct {
	community
	Headlines []newsLink
}

type newsLink struct {
	ID    int64
	Title string
	Date  string
}

type newsListPage struct {
	newsPage
	// InCategory lists the last articles of Category, which may be empty,
	// instead of every article.
	InCategory bool
	Category   string
	Articles   []newsLink
}

type newsArticlePage struct {
	newsPage
	Title    string
	Category string
	Date     string
	Summary  template.HTML
	Body     template.HTML
	Author   string
}

// renamedCategories maps Holo's category names to Reborn's, which update 0023
// gave their articles.
var renamedCategories = map[string]string{
	"HoloCMS":            "Reborn CMS",
	"Holograph Emulator": "Reborn Server",
}

// HandleNewsView handles GET /news, news.php: the archive of every article, or
// with ?category= the last articles of that category. A category's old name
// redirects to its new one, with the rest of the query kept.
func (r *Router) HandleNewsView(w http.ResponseWriter, req *http.Request) {
	query := req.URL.Query()
	if renamed, ok := renamedCategories[query.Get("category")]; ok {
		query.Set("category", renamed)
		http.Redirect(w, req, "/news?"+query.Encode(), http.StatusMovedPermanently)
		return
	}
	r.newsList(w, req, http.StatusOK, query.Get("category"), query.Has("category"))
}

// HandleNewsArticleView handles GET /news/{id}. An unknown article shows the
// archive, as Holo's did, though with status 404.
func (r *Router) HandleNewsArticleView(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	id, err := strconv.ParseInt(req.PathValue("id"), 10, 64)
	if err != nil {
		r.newsList(w, req, http.StatusNotFound, "", false)
		return
	}
	article, err := r.deps.Queries.GetNewsArticle(ctx, id)
	switch {
	case store.IsNotFound(err):
		r.newsList(w, req, http.StatusNotFound, "", false)
		return
	case err != nil:
		r.fail(w, err)
		return
	}
	shared, err := r.newsPage(ctx)
	if err != nil {
		r.fail(w, err)
		return
	}
	astro.WriteTemplate(w, r.deps.Resolver, "news/id.html", newsArticlePage{
		newsPage: shared,
		Title:    article.Title,
		Category: article.Category,
		Date:     article.PublishedAt.UTC().Format(newsDateFormat),
		Summary:  bbcode.Lines(article.Summary),
		Body:     bbcode.Format(article.Body, false),
		Author:   article.Author,
	})
}

func (r *Router) newsList(w http.ResponseWriter, req *http.Request, status int, category string, inCategory bool) {
	ctx := req.Context()
	shared, err := r.newsPage(ctx)
	if err != nil {
		r.fail(w, err)
		return
	}
	page := newsListPage{newsPage: shared, InCategory: inCategory, Category: category}
	if inCategory {
		rows, err := r.deps.Queries.ListNewsArticlesInCategory(ctx, store.ListNewsArticlesInCategoryParams{Category: category, RowLimit: newsInCategory})
		if err != nil {
			r.fail(w, err)
			return
		}
		for _, row := range rows {
			page.Articles = append(page.Articles, newsLink{ID: row.ID, Title: row.Title, Date: row.PublishedAt.UTC().Format(newsDateFormat)})
		}
	} else {
		rows, err := r.deps.Queries.ListNewsArticles(ctx)
		if err != nil {
			r.fail(w, err)
			return
		}
		for _, row := range rows {
			page.Articles = append(page.Articles, newsLink{ID: row.ID, Title: row.Title, Date: row.PublishedAt.UTC().Format(newsDateFormat)})
		}
	}
	w.WriteHeader(status)
	astro.WriteTemplate(w, r.deps.Resolver, "news.html", page)
}

func (r *Router) newsPage(ctx context.Context) (newsPage, error) {
	shared, err := r.community(ctx)
	if err != nil {
		return newsPage{}, err
	}
	page := newsPage{community: shared}
	latest, err := r.deps.Queries.ListLatestNewsArticles(ctx, newsHeadlines)
	if err != nil {
		return page, err
	}
	for _, row := range latest {
		page.Headlines = append(page.Headlines, newsLink{ID: row.ID, Title: row.Title})
	}
	return page, nil
}
