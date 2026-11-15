package router

import (
	"database/sql"
	"fmt"
	"net/http"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// Holo had no uploads, so these follow the texts of its news_manage.
const (
	imageDeleted = "Image deleted successfully."
	imageMissing = "Unable to delete image; this image does not exist!"
)

type imagesPage struct {
	chrome
	Images  []imageRow
	Message string
	Error   string
}

type imageRow struct {
	ID       int64
	Path     string
	Preview  string
	Format   string
	Size     string
	Uploader string
	Date     string
	Articles []store.ListImageArticlesRow
}

func (r *Router) newImagesPage(req *http.Request) (imagesPage, error) {
	ctx := req.Context()
	page := imagesPage{chrome: r.chrome(req)}
	images, err := r.deps.Queries.ListImages(ctx)
	if err != nil {
		return page, err
	}
	for _, image := range images {
		path := newsImagePath(image.ID, image.Format)
		row := imageRow{
			ID:       image.ID,
			Path:     path,
			Preview:  sitePicture(path),
			Format:   strings.ToUpper(image.Format),
			Size:     fmt.Sprintf("%.1f KB", float64(image.Size)/1024),
			Uploader: named(image.Uploader, image.CreatedByUserID),
			Date:     image.CreatedAt.UTC().Format(dateFormat),
		}
		if image.Articles > 0 {
			row.Articles, err = r.deps.Queries.ListImageArticles(ctx, sql.NullInt64{Int64: image.ID, Valid: true})
			if err != nil {
				return page, err
			}
		}
		page.Images = append(page.Images, row)
	}
	return page, nil
}

// HandleImagesView renders GET /housekeeping/images: every uploaded picture,
// newest first, with the articles that show it.
func (r *Router) HandleImagesView(w http.ResponseWriter, req *http.Request) {
	page, err := r.newImagesPage(req)
	if err != nil {
		r.fail(w, err)
		return
	}
	if req.URL.Query().Has("deleted") {
		page.Message = imageDeleted
	}
	astro.WriteTemplate(w, r.deps.Resolver, "images.html", page)
}
