package game

import (
	"context"
	"database/sql"
	"fmt"
	"math"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// Club is a user's club as the client shows it: the days left of the running period, the whole periods of club the
// user has had, and the whole periods prepaid after the running one (plans/server decision 0052).
type Club struct {
	DaysLeft, ElapsedPeriods, PrepaidPeriods int
}

// ClubStatus reads the club of userID now, with periods of club.daysPerMonth days.
func ClubStatus(ctx context.Context, db *sql.DB, userID int64) (Club, error) {
	periods, err := store.New(db).ListClubSubscriptions(ctx, userID)
	if err != nil {
		return Club{}, fmt.Errorf("game: club: %w", err)
	}
	return clubAt(periods, time.Now().UTC(), settings.GetInt("club.daysPerMonth")), nil
}

// clubAt counts the days left as the CMS does: from now to the end of the last period while a period covers now, a
// day that has begun among them.
func clubAt(periods []store.ListClubSubscriptionsRow, now time.Time, daysPerMonth int) Club {
	var running bool
	var end time.Time
	var had time.Duration
	for _, p := range periods {
		if !p.StartsAt.After(now) && p.EndsAt.After(now) {
			running = true
		}
		if p.EndsAt.After(end) {
			end = p.EndsAt
		}
		if p.StartsAt.Before(now) {
			had += min(p.EndsAt.Sub(p.StartsAt), now.Sub(p.StartsAt))
		}
	}
	club := Club{ElapsedPeriods: int(had / (time.Duration(daysPerMonth) * 24 * time.Hour))}
	if running {
		days := int(math.Ceil(end.Sub(now).Hours() / 24))
		club.DaysLeft = (days-1)%daysPerMonth + 1
		club.PrepaidPeriods = (days - 1) / daysPerMonth
	}
	return club
}
