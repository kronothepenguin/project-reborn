package router

import (
	"net/http"
	"strconv"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

type bannerDeletePage struct {
	chrome
	ID   int64
	Text string
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
