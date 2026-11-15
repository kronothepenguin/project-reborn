package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/cms/seed"
)

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
