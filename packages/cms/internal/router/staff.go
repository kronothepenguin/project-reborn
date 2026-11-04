package router

import (
	"context"
	"database/sql"
	"html/template"
	"net/http"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/cms/internal/bbcode"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// visitFormat is Holo's date_full, the format of lastvisit.
const visitFormat = "02-01-2006 15:04:05"

type staffPage struct {
	community
	ImagingURL string
	Members    []staffMember
	Boxes      []staffBox
}

type staffMember struct {
	Name      string
	Figure    string
	Motto     string
	Rank      string
	LastVisit string
	Badge     string
}

type staffBox struct {
	Heading string
	Body    template.HTML
	// Color is one of Holo's: red, blue, white or green.
	Color string
}

// HandleStaffView handles GET /staff, staff.php: the staff in one list
// (0076) and the page's two boxes. With features.staffPage off, Holo sent the
// visitor to its index.
func (r *Router) HandleStaffView(w http.ResponseWriter, req *http.Request) {
	if !settings.GetBool("features.staffPage") {
		http.Redirect(w, req, "/", http.StatusSeeOther)
		return
	}
	ctx := req.Context()
	shared, err := r.community(ctx)
	if err != nil {
		r.fail(w, err)
		return
	}
	page := staffPage{community: shared, ImagingURL: settings.GetString("imaging.avatarUrl")}
	rows, err := r.deps.Queries.ListStaff(ctx)
	if err != nil {
		r.fail(w, err)
		return
	}
	for _, row := range rows {
		visit, err := r.lastVisit(ctx, row.ID, row.CreatedAt)
		if err != nil {
			r.fail(w, err)
			return
		}
		member := staffMember{Name: row.Name, Figure: row.Figure, Motto: row.Motto, Rank: row.GroupName, LastVisit: visit}
		if member.Motto == "" {
			member.Motto = "No motto"
		}
		if row.Badge != "" {
			member.Badge = image("c_images/album1584/" + row.Badge + ".gif")
		}
		page.Members = append(page.Members, member)
	}
	for _, box := range []string{"box1", "box2"} {
		page.Boxes = append(page.Boxes, staffBox{
			Heading: settings.GetString("staffPage." + box + "Heading"),
			Body:    bbcode.Format(settings.GetString("staffPage."+box+"Body"), false),
			Color:   settings.GetString("staffPage." + box + "Color"),
		})
	}
	astro.WriteTemplate(w, r.deps.Resolver, "staff.html", page)
}

// lastVisit is Holo's lastvisit: when the habbo was last seen on the site, or
// else when it last signed in, or else when it was made, which is when Holo
// first wrote it.
func (r *Router) lastVisit(ctx context.Context, avatarID int64, created time.Time) (string, error) {
	seen, err := r.deps.Queries.GetLastSeen(ctx, avatarID)
	if store.IsNotFound(err) {
		seen, err = r.deps.Queries.GetLastSignIn(ctx, sql.NullInt64{Int64: avatarID, Valid: true})
	}
	switch {
	case store.IsNotFound(err):
		seen = created
	case err != nil:
		return "", err
	}
	return seen.UTC().Format(visitFormat), nil
}
