package router

import (
	"net/http"
	"path/filepath"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/config"
)

const (
	dcrImported = "The client files were imported."
	dcrMissing  = "The client files were not imported: %s is missing from %s."
)

type dcrPage struct {
	chrome
	Folder    string
	Variables int64
	Texts     int64
	Message   string
	Error     string
}

// dcrFolder is the client's folder, dcr/ inside the assets folder of config.json.
func dcrFolder() string {
	return filepath.Join(config.Get().Assets.Path, "dcr")
}

// HandleDCRView renders GET /housekeeping/dcr: the client's folder and how many
// variables and texts the database holds.
func (r *Router) HandleDCRView(w http.ResponseWriter, req *http.Request) {
	page := dcrPage{chrome: r.chrome(req)}
	if req.URL.Query().Has("imported") {
		page.Message = dcrImported
	}
	r.writeDCRPage(w, req, http.StatusOK, page)
}

// writeDCRPage counts the rows of both tables into page and renders it with status.
func (r *Router) writeDCRPage(w http.ResponseWriter, req *http.Request, status int, page dcrPage) {
	ctx := req.Context()
	variables, err := r.deps.Queries.CountDCRVariables(ctx)
	if err != nil {
		r.fail(w, err)
		return
	}
	texts, err := r.deps.Queries.CountDCRTexts(ctx)
	if err != nil {
		r.fail(w, err)
		return
	}
	page.Folder, page.Variables, page.Texts = dcrFolder(), variables, texts
	w.WriteHeader(status)
	astro.WriteTemplate(w, r.deps.Resolver, "dcr.html", page)
}
