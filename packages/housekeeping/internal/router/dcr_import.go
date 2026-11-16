package router

import (
	"errors"
	"fmt"
	"io/fs"
	"net/http"
	"os"

	"github.com/kronothepenguin/project-reborn/packages/assets/dcr"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// HandleDCRImport handles POST /housekeeping/dcr/import. It replaces the
// variables and texts of the database with those of the client's folder, with
// its staff log row, in one transaction. A missing file leaves the database as
// it was, and the page names the file.
func (r *Router) HandleDCRImport(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	folder := dcrFolder()
	err := r.inTx(ctx, func(q *store.Queries) error {
		if err := dcr.Import(ctx, q, os.DirFS(folder)); err != nil {
			return err
		}
		variables, err := q.CountDCRVariables(ctx)
		if err != nil {
			return err
		}
		texts, err := q.CountDCRTexts(ctx)
		if err != nil {
			return err
		}
		return writeLog(req, q, staffLog{action: actionDCRImport, detail: fmt.Sprintf("%d variables, %d texts", variables, texts)})
	})
	var missing *fs.PathError
	switch {
	case errors.Is(err, fs.ErrNotExist) && errors.As(err, &missing):
		page := dcrPage{chrome: r.chrome(req), Error: fmt.Sprintf(dcrMissing, missing.Path, folder)}
		r.writeDCRPage(w, req, http.StatusUnprocessableEntity, page)
	case err != nil:
		r.fail(w, err)
	default:
		http.Redirect(w, req, "/housekeeping/dcr?imported=1", http.StatusSeeOther)
	}
}
