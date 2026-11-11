package game

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/virtual/catalogue"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
)

// CataloguePages returns the catalogue's pages that viewer sees, in the catalogue's order (plans/server decision
// 0100).
func CataloguePages(ctx context.Context, db *sql.DB, viewer habbo.Habbo) ([]catalogue.Page, error) {
	level, member, err := levelAndClub(ctx, db, viewer.UserID)
	if err != nil {
		return nil, fmt.Errorf("game: catalogue: %w", err)
	}
	var pages []catalogue.Page
	for _, p := range catalogue.Pages() {
		if seesPage(p, level, member) {
			pages = append(pages, p)
		}
	}
	return pages, nil
}

// CataloguePage returns the page the client names by code, and false for one that does not exist or that viewer does
// not see.
func CataloguePage(ctx context.Context, db *sql.DB, viewer habbo.Habbo, code string) (catalogue.Page, bool, error) {
	p, ok := catalogue.Get(code)
	if !ok {
		return catalogue.Page{}, false, nil
	}
	level, member, err := levelAndClub(ctx, db, viewer.UserID)
	if err != nil {
		return catalogue.Page{}, false, fmt.Errorf("game: catalogue: %w", err)
	}
	if !seesPage(p, level, member) {
		return catalogue.Page{}, false, nil
	}
	return p, true, nil
}

// seesPage tells whether a habbo of that access group level sees p: its level reaches the page's, or the page is open
// to the club and its user is a member.
func seesPage(p catalogue.Page, level int64, member bool) bool {
	return level >= p.MinLevel || p.OpenToClub && member
}

// levelAndClub reads the highest level of the user's access groups and whether the user is a club member now, both
// from the store, since the site changes them.
func levelAndClub(ctx context.Context, db *sql.DB, userID int64) (level int64, member bool, err error) {
	if level, err = auth.Level(ctx, db, userID); err != nil {
		return 0, false, err
	}
	club, err := ClubStatus(ctx, db, userID)
	if err != nil {
		return 0, false, err
	}
	return level, club.DaysLeft > 0, nil
}
