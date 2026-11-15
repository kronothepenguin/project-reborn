package router

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

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
