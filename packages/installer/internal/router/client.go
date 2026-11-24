package router

import (
	"errors"
	"io/fs"
	"net/http"
	"path/filepath"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/installer/internal/setup"
)

// clientPage names the client's folder and each file found there or missing.
type clientPage struct {
	stepper
	Folder  string
	Files   []setup.ClientFile
	Missing bool
}

// clientView reads the client's folder for the page.
func (r *Router) clientView() (clientPage, error) {
	files, err := r.deps.Setup.ClientFiles()
	if err != nil {
		return clientPage{}, err
	}
	folder := r.deps.Setup.ClientFolder()
	if abs, err := filepath.Abs(folder); err == nil {
		folder = abs
	}
	page := clientPage{stepper: r.stepper(), Folder: folder + string(filepath.Separator), Files: files}
	for _, file := range files {
		page.Missing = page.Missing || !file.Found
	}
	return page, nil
}

// HandleClientView renders GET /installer/client: the client's folder and the
// files it holds.
func (r *Router) HandleClientView(w http.ResponseWriter, req *http.Request) {
	if _, ok := r.step(w, req, "client"); !ok {
		return
	}
	page, err := r.clientView()
	if err != nil {
		r.fail(w, err)
		return
	}
	astro.WriteTemplate(w, r.deps.Resolver, "client.html", page)
}

// HandleClientSave handles POST /installer/client: "import" imports the
// client's files and "skip" imports nothing; both go on. A missing file
// imports nothing and shows the folder again.
func (r *Router) HandleClientSave(w http.ResponseWriter, req *http.Request) {
	if _, ok := r.step(w, req, "client"); !ok {
		return
	}
	switch req.PostFormValue("action") {
	case "skip":
		r.pass(w, req, "client")
		return
	case "import":
		err := r.deps.Setup.ImportClientFiles(req.Context())
		if err == nil {
			r.pass(w, req, "client")
			return
		}
		if !errors.Is(err, fs.ErrNotExist) {
			r.fail(w, err)
			return
		}
	}
	page, err := r.clientView()
	if err != nil {
		r.fail(w, err)
		return
	}
	r.invalid(w, "client.html", page)
}
