package router

import (
	"context"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// community holds what the community layout reads. Only users who pass
// maintenance can see SiteClosed set.
type community struct {
	hotelStatus
	SignedIn      bool
	Habbo         string
	SeveralHabbos bool
	SiteClosed    bool
}

func (r *Router) community(ctx context.Context) (community, error) {
	page := community{hotelStatus: r.hotelStatus(ctx), SiteClosed: settings.GetBool("site.maintenance")}
	session, ok := auth.FromContext(ctx)
	if !ok {
		return page, nil
	}
	avatar, err := r.deps.Queries.GetAvatar(ctx, session.AvatarID)
	if err != nil {
		return page, err
	}
	habbos, err := r.deps.Queries.ListUserAvatars(ctx, session.UserID)
	if err != nil {
		return page, err
	}
	page.SignedIn, page.Habbo, page.SeveralHabbos = true, avatar.Name, len(habbos) > 1
	return page, nil
}
