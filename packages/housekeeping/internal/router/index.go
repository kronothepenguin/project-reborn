package router

import (
	"context"
	"net/http"
	"slices"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// administratorsShown is Holo's limit on the dashboard's list.
const administratorsShown = 20

type indexPage struct {
	chrome
	Habbos         int64
	Groups         int64
	ActiveBans     int64
	StaffLogs      int64
	Administrators []administrator
	Note           string
}

type administrator struct {
	ID    int64
	Name  string
	Email string
}

// HandleIndexView renders GET /housekeeping/{$}. Holo showed every administrator's
// address to all staff; here it takes housekeeping.usersPrivate.
func (r *Router) HandleIndexView(w http.ResponseWriter, req *http.Request) {
	page, err := r.newIndexPage(req.Context())
	if err != nil {
		r.fail(w, err)
		return
	}
	session, _ := auth.FromContext(req.Context())
	attributes, err := auth.Attributes(req.Context(), r.deps.DB, session.UserID)
	if err != nil {
		r.fail(w, err)
		return
	}
	if !slices.Contains(attributes, auth.HousekeepingUsersPrivate) {
		for i := range page.Administrators {
			page.Administrators[i].Email = ""
		}
	}
	page.chrome = r.chrome(req)
	astro.WriteTemplate(w, r.deps.Resolver, "index.html", page)
}

func (r *Router) newIndexPage(ctx context.Context) (indexPage, error) {
	q := r.deps.Queries
	page := indexPage{Note: settings.GetString("housekeeping.note")}
	var err error
	if page.Habbos, err = q.CountAvatars(ctx); err != nil {
		return page, err
	}
	if page.Groups, err = q.CountGroups(ctx); err != nil {
		return page, err
	}
	if page.ActiveBans, err = q.CountActiveBans(ctx, time.Now().UTC()); err != nil {
		return page, err
	}
	if page.StaffLogs, err = q.CountStaffLogs(ctx); err != nil {
		return page, err
	}
	holders, err := q.ListAttributeHolderDetails(ctx, store.ListAttributeHolderDetailsParams{
		Attribute: string(auth.HousekeepingAccessGroups),
		RowLimit:  administratorsShown,
	})
	if err != nil {
		return page, err
	}
	for _, holder := range holders {
		page.Administrators = append(page.Administrators, administrator{ID: holder.ID, Name: holder.Name, Email: holder.Email})
	}
	return page, nil
}
