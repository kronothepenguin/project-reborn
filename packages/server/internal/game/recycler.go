package game

import (
	"context"
	"database/sql"
	"fmt"
	"math"
	"slices"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/furni"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
)

// RecyclerState is where a habbo's recycling stands, numbered as the client's 304 numbers it.
type RecyclerState int

const (
	// RecyclerOpen: the habbo recycles nothing.
	RecyclerOpen RecyclerState = iota
	// RecyclerInProgress: the recycling runs, for MinutesLeft more.
	RecyclerInProgress
	// RecyclerReady: the reward may be taken.
	RecyclerReady
	// RecyclerTimedOut: the reward waited too long, and only the furni come back (decision server/0116).
	RecyclerTimedOut
)

// RecyclerSetup is what the recycler asks and gives: whether it runs, its three times in minutes, and its rewards,
// by how many furni each takes.
type RecyclerSetup struct {
	Enabled                                  bool
	MinOwnedMinutes, Minutes, TimeoutMinutes int
	Rewards                                  []RecyclerReward
}

// RecyclerReward is the furni given for Count furni recycled at once.
type RecyclerReward struct {
	Count      int
	Definition store.FurniDefinition
}

// RecyclerStatus is a habbo's recycling: its state and, while there is one, the reward it brings.
type RecyclerStatus struct {
	State       RecyclerState
	Reward      store.FurniDefinition
	MinutesLeft int
}

// Recycler returns the recycler's setup, its rewards read from the store. A reward whose furni is not loaded is left
// out.
func Recycler(ctx context.Context, db *sql.DB) (RecyclerSetup, error) {
	q := store.New(db)
	setup := RecyclerSetup{
		Enabled:         settings.Bool(ctx, q, "recycler.enabled"),
		MinOwnedMinutes: settings.Int(ctx, q, "recycler.minOwnedMinutes"),
		Minutes:         settings.Int(ctx, q, "recycler.sessionMinutes"),
		TimeoutMinutes:  settings.Int(ctx, q, "recycler.timeoutMinutes"),
	}
	rows, err := q.ListRecyclerRewards(ctx)
	if err != nil {
		return RecyclerSetup{}, fmt.Errorf("game: recycler: %w", err)
	}
	for _, row := range rows {
		if d, ok := furni.Get(row.FurniDefinitionID); ok {
			setup.Rewards = append(setup.Rewards, RecyclerReward{Count: int(row.FurniCount), Definition: d})
		}
	}
	return setup, nil
}

// Recycling returns where viewer's recycling stands, counted from its saved start, so that a restart changes nothing
// (decision server/0093): in progress for recycler.sessionMinutes, then ready until recycler.timeoutMinutes
// after its start, then timed out. A habbo with no recycling, and any habbo while the recycler is off, has it open.
func Recycling(ctx context.Context, db *sql.DB, viewer habbo.Habbo) (RecyclerStatus, error) {
	q := store.New(db)
	if !settings.Bool(ctx, q, "recycler.enabled") {
		return RecyclerStatus{}, nil
	}
	row, err := q.GetRecycling(ctx, viewer.ID)
	if store.IsNotFound(err) {
		return RecyclerStatus{}, nil
	}
	if err != nil {
		return RecyclerStatus{}, fmt.Errorf("game: recycling: %w", err)
	}
	return recyclingStatus(ctx, q, row, time.Now()), nil
}

func recyclingStatus(ctx context.Context, q *store.Queries, row store.Recycling, now time.Time) RecyclerStatus {
	reward, _ := furni.Get(row.FurniDefinitionID)
	status := RecyclerStatus{Reward: reward}
	length := time.Duration(settings.Int(ctx, q, "recycler.sessionMinutes")) * time.Minute
	timeout := time.Duration(settings.Int(ctx, q, "recycler.timeoutMinutes")) * time.Minute
	switch passed := now.Sub(row.StartedAt); {
	case passed < length:
		status.State, status.MinutesLeft = RecyclerInProgress, int(math.Ceil((length - passed).Minutes()))
	case passed < timeout:
		status.State = RecyclerReady
	default:
		status.State = RecyclerTimedOut
	}
	return status
}

// StartRecycling moves the furni ids from viewer's hand into its recycler (START_FURNI_RECYCLING), and reports
// whether it did. The habbo must be in a room, as Holo asked (decision server/0118), and recycle nothing yet;
// the recycler must give a reward for exactly that many furni; and every furni must be in viewer's hand, recyclable,
// on offer in no trade (decision server/0114) and at least recycler.minOwnedMinutes old (decision
// server/0117). The recycling and every furni are saved in one transaction, or nothing is.
func StartRecycling(ctx context.Context, db *sql.DB, viewer habbo.Habbo, ids []int64) (bool, error) {
	if _, ok := room.In(viewer.ID); !ok || !settings.Bool(ctx, store.New(db), "recycler.enabled") {
		return false, nil
	}
	sorted := slices.Sorted(slices.Values(ids))
	if len(slices.Compact(sorted)) != len(ids) || slices.ContainsFunc(ids, func(id int64) bool { return onOffer(viewer, id) }) {
		return false, nil
	}
	setup, err := Recycler(ctx, db)
	if err != nil {
		return false, err
	}
	i := slices.IndexFunc(setup.Rewards, func(r RecyclerReward) bool { return r.Count == len(ids) })
	if i < 0 {
		return false, nil
	}
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return false, fmt.Errorf("game: start recycling: %w", err)
	}
	defer tx.Rollback()
	q := store.New(db).WithTx(tx)
	now := time.Now().UTC()
	err = q.CreateRecycling(ctx, store.CreateRecyclingParams{AvatarID: viewer.ID, FurniDefinitionID: setup.Rewards[i].Definition.ID, StartedAt: now})
	if store.IsConflict(err) {
		return false, nil
	}
	if err != nil {
		return false, fmt.Errorf("game: start recycling: %w", err)
	}
	madeBefore := now.Add(-time.Duration(setup.MinOwnedMinutes) * time.Minute)
	for _, id := range ids {
		row, err := q.GetFurni(ctx, id)
		if store.IsNotFound(err) {
			return false, nil
		}
		if err != nil {
			return false, fmt.Errorf("game: start recycling: %w", err)
		}
		if d, ok := furni.Get(row.FurniDefinitionID); !ok || !d.Recyclable {
			return false, nil
		}
		n, err := q.RecycleFurni(ctx, store.RecycleFurniParams{ID: id, AvatarID: viewer.ID, MadeBefore: madeBefore})
		if err != nil {
			return false, fmt.Errorf("game: start recycling: %w", err)
		}
		if n == 0 {
			return false, nil
		}
	}
	if err := tx.Commit(); err != nil {
		return false, fmt.Errorf("game: start recycling: %w", err)
	}
	viewer.Session.Notify(HandChanged{})
	return true, nil
}

// EndRecycling ends viewer's recycling (CONFIRM_FURNI_RECYCLING), and reports whether it did. Taking the reward, once
// the recycling is ready, destroys the furni given and puts the reward in viewer's hand; refusing it, at any time,
// gives the furni back. A reward that is not ready, or that waited too long, is not taken, and nothing is destroyed
// (decision server/0116). It all happens in one transaction.
func EndRecycling(ctx context.Context, db *sql.DB, viewer habbo.Habbo, take bool) (bool, error) {
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return false, fmt.Errorf("game: end recycling: %w", err)
	}
	defer tx.Rollback()
	q := store.New(db).WithTx(tx)
	row, err := q.GetRecycling(ctx, viewer.ID)
	if store.IsNotFound(err) {
		return false, nil
	}
	if err != nil {
		return false, fmt.Errorf("game: end recycling: %w", err)
	}
	now := time.Now().UTC()
	if take {
		if recyclingStatus(ctx, q, row, now).State != RecyclerReady {
			return false, nil
		}
		if _, err := q.DeleteRecycledFurni(ctx, viewer.ID); err != nil {
			return false, fmt.Errorf("game: end recycling: %w", err)
		}
		_, err = q.CreateFurni(ctx, store.CreateFurniParams{
			FurniDefinitionID: row.FurniDefinitionID, UserID: viewer.UserID,
			AvatarID: sql.NullInt64{Int64: viewer.ID, Valid: true}, CreatedAt: now,
		})
	} else {
		err = q.ReturnRecycledFurni(ctx, viewer.ID)
	}
	if err != nil {
		return false, fmt.Errorf("game: end recycling: %w", err)
	}
	if _, err := q.DeleteRecycling(ctx, viewer.ID); err != nil {
		return false, fmt.Errorf("game: end recycling: %w", err)
	}
	if err := tx.Commit(); err != nil {
		return false, fmt.Errorf("game: end recycling: %w", err)
	}
	// The client has a hand to show only in a room.
	if _, ok := room.In(viewer.ID); ok {
		viewer.Session.Notify(HandChanged{})
	}
	return true, nil
}
