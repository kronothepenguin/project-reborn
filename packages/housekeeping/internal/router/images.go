package router

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// Holo had no uploads, so these follow the texts of its news_manage.
const (
	imageDeleted = "Image deleted successfully."
	imageMissing = "Unable to delete image; this image does not exist!"
)

// errImageInUse makes inTx roll back a delete that the link of an article
// refused.
var errImageInUse = errors.New("housekeeping: the image is in use")

// imageInUse names the articles that show an image, which must take another
// picture or be deleted before the image can be.
func imageInUse(articles []store.ListImageArticlesRow) string {
	names := make([]string, len(articles))
	for i, article := range articles {
		names[i] = fmt.Sprintf("%s (ID: %d)", article.Title, article.ID)
	}
	if len(names) == 1 {
		return fmt.Sprintf("Unable to delete image; it is the topstory image of %s. Change or delete that article first.", names[0])
	}
	last := len(names) - 1
	return fmt.Sprintf("Unable to delete image; it is the topstory image of %s and %s. Change or delete those articles first.",
		strings.Join(names[:last], ", "), names[last])
}

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

func (r *Router) refuseImage(w http.ResponseWriter, req *http.Request, status int, message string) {
	page, err := r.newImagesPage(req)
	if err != nil {
		r.fail(w, err)
		return
	}
	page.Error = message
	w.WriteHeader(status)
	astro.WriteTemplate(w, r.deps.Resolver, "images.html", page)
}

// HandleImageDelete handles POST /housekeeping/images/{id}/delete. The link of
// news_articles refuses to delete a picture an article shows, and the answer
// names those articles, listed in the same transaction.
func (r *Router) HandleImageDelete(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	id, err := strconv.ParseInt(req.PathValue("id"), 10, 64)
	if err != nil {
		r.refuseImage(w, req, http.StatusNotFound, imageMissing)
		return
	}
	var articles []store.ListImageArticlesRow
	err = r.inTx(ctx, func(q *store.Queries) error {
		stored, err := q.GetImage(ctx, id)
		if err != nil {
			return err
		}
		_, deleted := q.DeleteImage(ctx, id)
		if store.IsForeignKey(deleted) {
			articles, err = q.ListImageArticles(ctx, sql.NullInt64{Int64: id, Valid: true})
			if err != nil {
				return err
			}
			if len(articles) > 0 {
				return errImageInUse
			}
		}
		if deleted != nil {
			return deleted
		}
		return writeLog(req, q, staffLog{action: actionImagesDelete, detail: newsImagePath(id, stored.Format)})
	})
	switch {
	case store.IsNotFound(err):
		r.refuseImage(w, req, http.StatusNotFound, imageMissing)
	case errors.Is(err, errImageInUse):
		r.refuseImage(w, req, http.StatusUnprocessableEntity, imageInUse(articles))
	case err != nil:
		r.fail(w, err)
	default:
		target := "/housekeeping/images?deleted=1"
		// The browser pages the list (0080), and the form carries its page.
		if page, err := strconv.Atoi(req.URL.Query().Get("page")); err == nil && page > 0 {
			target += "&page=" + strconv.Itoa(page)
		}
		http.Redirect(w, req, target, http.StatusSeeOther)
	}
}
