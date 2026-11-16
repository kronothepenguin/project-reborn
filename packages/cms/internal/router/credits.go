package router

import (
	"html/template"
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/cms/internal/bbcode"
	"github.com/kronothepenguin/project-reborn/packages/settings"
)

// creditsPage is credits.php: box 2 in the first column, and the purse and box 1
// in the second. Credits is the user's purse, which guests do not see.
type creditsPage struct {
	community
	Credits     int64
	Box1Heading string
	Box1Body    template.HTML
	Box2Heading string
	Box2Body    template.HTML
}

// HandleCreditsView handles GET /credits, credits.php, which guests read too
// (0017). The boxes are BBCode with their pictures in the page (0105).
func (r *Router) HandleCreditsView(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	shared, err := r.community(ctx)
	if err != nil {
		r.fail(w, err)
		return
	}
	page := creditsPage{
		community:   shared,
		Box1Heading: settings.String(ctx, r.deps.Queries, "creditsPage.box1Heading"),
		Box1Body:    bbcode.Format(settings.String(ctx, r.deps.Queries, "creditsPage.box1Body"), false),
		Box2Heading: settings.String(ctx, r.deps.Queries, "creditsPage.box2Heading"),
		Box2Body:    bbcode.Format(settings.String(ctx, r.deps.Queries, "creditsPage.box2Body"), false),
	}
	if session, ok := auth.FromContext(ctx); ok {
		wallet, err := r.deps.Queries.GetWallet(ctx, session.UserID)
		if err != nil {
			r.fail(w, err)
			return
		}
		page.Credits = wallet.Credits
	}
	astro.WriteTemplate(w, r.deps.Resolver, "credits.html", page)
}
