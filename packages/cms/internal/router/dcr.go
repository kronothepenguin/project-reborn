package router

import (
	"io/fs"
	"net/http"
	"os"
	"path/filepath"

	"github.com/kronothepenguin/project-reborn/packages/assets/dcr"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/settings"
)

// HandleDCRFile serves GET /dcr/{file...}, a file of the client's folder,
// <assets.path>/dcr/. A missing file and a folder answer 404. The folder is
// opened as an os.Root on each request, so a path never leaves it, and an
// administrator may add or replace files while the CMS runs.
func (r *Router) HandleDCRFile(w http.ResponseWriter, req *http.Request) {
	root, err := os.OpenRoot(filepath.Join(config.Get().Assets.Path, "dcr"))
	if err != nil {
		http.NotFound(w, req)
		return
	}
	defer root.Close()
	http.StripPrefix("/dcr", http.FileServerFS(filesOnly{root.FS()})).ServeHTTP(w, req)
}

// filesOnly hides the folders of an fs.FS, so the file server lists none, and
// answers every file it cannot open, such as a link out of the folder, as
// missing.
type filesOnly struct{ fs.FS }

func (f filesOnly) Open(name string) (fs.File, error) {
	missing := &fs.PathError{Op: "open", Path: name, Err: fs.ErrNotExist}
	file, err := f.FS.Open(name)
	if err != nil {
		return nil, missing
	}
	if info, err := file.Stat(); err != nil || info.IsDir() {
		file.Close()
		return nil, missing
	}
	return file, nil
}

// dcrHotel is what the written client files take from the request's address
// and the hotel's settings.
func (r *Router) dcrHotel(req *http.Request) dcr.Hotel {
	ctx := req.Context()
	return dcr.Hotel{
		URL:       hotelURL(req),
		ShortName: settings.String(ctx, r.deps.Queries, "site.shortName"),
		Version:   settings.Int(ctx, r.deps.Queries, "game.clientVersion"),
	}
}

// hotelURL is the address the browser used, its scheme and its host, so the
// client loads its files from wherever the hotel answers. Behind a trusted
// proxy, auth.RealIP has set the scheme and host the proxy forwards.
func hotelURL(req *http.Request) string {
	scheme := req.URL.Scheme
	if scheme == "" {
		scheme = "http"
		if req.TLS != nil {
			scheme = "https"
		}
	}
	return scheme + "://" + req.Host
}

// writeClientText answers a file the client reads as UTF-8 text.
func writeClientText(w http.ResponseWriter, body []byte) {
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.Write(body)
}
