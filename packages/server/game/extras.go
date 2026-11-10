package game

import (
	"context"
	"database/sql"
	"fmt"
	"slices"
	"time"
	"unicode/utf8"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// Rating is a habbo room's rating as a habbo sees it: -1 until it votes, then the sum of the room's votes, never below
// 0, and the share of +1 votes, 0 to 100 (plans/server decision 0082).
type Rating struct {
	Value   int
	Percent int
}

// RatingChanged tells a habbo that voted on its room the room's new rating.
type RatingChanged struct{ Rating Rating }

// RoomRating returns the habbo room flatID's rating as the viewer sees it.
func RoomRating(ctx context.Context, db *sql.DB, viewer habbo.Habbo, flatID int64) (Rating, error) {
	q := store.New(db)
	voted, err := q.HasVotedOnRoom(ctx, store.HasVotedOnRoomParams{RoomID: flatID, AvatarID: viewer.ID})
	if err != nil {
		return Rating{}, fmt.Errorf("game: room rating: %w", err)
	}
	if !voted {
		return Rating{Value: -1}, nil
	}
	return rating(ctx, q, flatID)
}

func rating(ctx context.Context, q *store.Queries, flatID int64) (Rating, error) {
	row, err := q.GetRoomRating(ctx, flatID)
	if err != nil {
		return Rating{}, fmt.Errorf("game: room rating: %w", err)
	}
	r := Rating{Value: max(int(row.Rating), 0)}
	if row.Votes > 0 {
		up := (row.Votes + row.Rating) / 2
		r.Percent = int(up * 100 / row.Votes)
	}
	return r, nil
}

// RateRoom records the viewer's vote, 1 or -1, on the habbo room it is in (RATEFLAT), once; then everyone in the room
// who has voted, the viewer too, gets the new rating, as Holo sent it.
func RateRoom(ctx context.Context, db *sql.DB, viewer habbo.Habbo, vote int) error {
	r, ok := room.In(viewer.ID)
	if !ok || r.Ref().Public || (vote != 1 && vote != -1) {
		return nil
	}
	q := store.New(db)
	n, err := q.AddRoomVote(ctx, store.AddRoomVoteParams{RoomID: r.Ref().ID, AvatarID: viewer.ID, Vote: int64(vote), VotedAt: time.Now().UTC()})
	if err != nil {
		return fmt.Errorf("game: rate room: %w", err)
	}
	if n == 0 {
		return nil
	}
	now, err := rating(ctx, q, r.Ref().ID)
	if err != nil {
		return err
	}
	for _, o := range r.Occupants() {
		voted, err := q.HasVotedOnRoom(ctx, store.HasVotedOnRoomParams{RoomID: r.Ref().ID, AvatarID: o.AvatarID})
		if err != nil {
			return fmt.Errorf("game: rate room: %w", err)
		}
		if voted {
			o.Session.Notify(RatingChanged{Rating: now})
		}
	}
	return nil
}

// EventInfo is a room event as the client shows it: its host's name and its room too.
type EventInfo struct {
	room.Event
	HostName string
	FlatID   int64
}

// RoomEventChanged tells the habbos in a room its event, or that it has none.
type RoomEventChanged struct {
	Event EventInfo
	Held  bool
}

// eventTimeLayout is the time the client shows for an event: when it started, hours and minutes in UTC, as Holo
// showed its short time and as the game's date is UTC.
const eventTimeLayout = "15:04"

// EventTime writes when an event started, as the client shows it.
func EventTime(e room.Event) string { return e.Started.UTC().Format(eventTimeLayout) }

// EventTypes returns how many room event types there are (plans/server decision 0081).
func EventTypes() int { return settings.GetIntOr("game.roomEventTypes", 11) }

// CanHostEvent reports whether the viewer may host an event where it is (CAN_CREATE_ROOMEVENT): in a habbo room it
// owns, as owns counts owners, which hosts no event yet.
func CanHostEvent(viewer habbo.Habbo) bool {
	r, ok := room.In(viewer.ID)
	if !ok || r.Ref().Public || !owns(r, viewer) {
		return false
	}
	_, held := r.Event()
	return !held
}

// HostEvent starts an event of the type, 1 to EventTypes, in the habbo room the viewer owns and is in
// (CREATE_ROOMEVENT), with a name and a description of 3 characters or more, as the client asks them; or changes its
// own event (EDIT_ROOMEVENT). The room learns it.
func HostEvent(viewer habbo.Habbo, eventType int, name, description string, edit bool) {
	r, ok := room.In(viewer.ID)
	if !ok || r.Ref().Public || !owns(r, viewer) || eventType < 1 || eventType > EventTypes() ||
		utf8.RuneCountInString(name) < 3 || utf8.RuneCountInString(description) < 3 {
		return
	}
	e := room.Event{HostID: viewer.ID, Type: eventType, Name: name, Description: description, Started: time.Now().UTC()}
	switch old, held := r.Event(); {
	case edit && (!held || old.HostID != viewer.ID):
		return
	case edit:
		e.Started = old.Started
	case held:
		return
	}
	if r.SetEvent(e) {
		notify(r.Occupants(), RoomEventChanged{Event: EventInfo{Event: e, HostName: viewer.Name, FlatID: r.Ref().ID}, Held: true})
	}
}

// EndEvent ends the event the viewer hosts in its room (QUIT_ROOMEVENT).
func EndEvent(viewer habbo.Habbo) {
	if r, ok := room.In(viewer.ID); ok {
		endEventOf(r, viewer.ID)
	}
}

func endEventOf(r *room.Room, hostID int64) {
	if e, held := r.Event(); !held || e.HostID != hostID {
		return
	}
	if _, ended := r.EndEvent(); ended {
		notify(r.Occupants(), RoomEventChanged{})
	}
}

// RoomEvent returns the event of the habbo room flatID, for GOTOFLAT.
func RoomEvent(flatID int64) (EventInfo, bool) {
	r, ok := room.Loaded(room.Ref{ID: flatID})
	if !ok {
		return EventInfo{}, false
	}
	return eventInfo(r)
}

func eventInfo(r *room.Room) (EventInfo, bool) {
	e, held := r.Event()
	if !held {
		return EventInfo{}, false
	}
	host, ok := habbo.Get(e.HostID)
	if !ok {
		return EventInfo{}, false
	}
	return EventInfo{Event: e, HostName: host.Name, FlatID: r.Ref().ID}, true
}

// Events returns the events of a type, by room, for the navigator's list (GET_ROOMEVENTS_BY_TYPE).
func Events(eventType int) []EventInfo {
	var all []EventInfo
	for _, r := range room.All() {
		if e, ok := eventInfo(r); ok && e.Type == eventType {
			all = append(all, e)
		}
	}
	slices.SortFunc(all, func(a, b EventInfo) int { return int(a.FlatID - b.FlatID) })
	return all
}

// GroupBadges returns the favourite groups the habbos in the viewer's room show, by id (GET_GROUP_BADGES), as their
// user lines name them (plans/server decision 0068).
func GroupBadges(viewer habbo.Habbo) []habbo.Group {
	r, ok := room.In(viewer.ID)
	if !ok {
		return nil
	}
	var groups []habbo.Group
	for _, v := range visitorsOf(r) {
		if g := v.Habbo.Group; g.ID != 0 && !slices.ContainsFunc(groups, func(x habbo.Group) bool { return x.ID == g.ID }) {
			groups = append(groups, g)
		}
	}
	slices.SortFunc(groups, func(a, b habbo.Group) int { return int(a.ID - b.ID) })
	return groups
}

// GroupDetails returns the group groupID's name and description (GET_GROUP_DETAILS). Groups have no room.
func GroupDetails(ctx context.Context, db *sql.DB, groupID int64) (store.Group, bool, error) {
	g, err := store.New(db).GetGroup(ctx, groupID)
	if store.IsNotFound(err) {
		return store.Group{}, false, nil
	}
	if err != nil {
		return store.Group{}, false, fmt.Errorf("game: group details: %w", err)
	}
	return g, true, nil
}

// favouriteGroup reads the habbo's favourite group, and its status in it: 1 when it owns the group, 2 an admin, 3 a
// member.
func favouriteGroup(ctx context.Context, q *store.Queries, avatarID int64) (habbo.Group, error) {
	groups, err := q.ListAvatarGroups(ctx, avatarID)
	if err != nil {
		return habbo.Group{}, err
	}
	for _, g := range groups {
		if !g.Favourite {
			continue
		}
		status := 3
		switch {
		case g.OwnerAvatarID == avatarID:
			status = 1
		case g.Role == "admin":
			status = 2
		}
		return habbo.Group{ID: g.ID, Badge: g.Badge, Status: status}, nil
	}
	return habbo.Group{}, nil
}

// UserTags returns the tags of the habbo avatarID's profile on the site (GET_USER_TAGS).
func UserTags(ctx context.Context, db *sql.DB, avatarID int64) ([]string, error) {
	q := store.New(db)
	profile, err := q.GetAvatarProfile(ctx, avatarID)
	if store.IsNotFound(err) {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("game: user tags: %w", err)
	}
	tags, err := q.ListProfileTags(ctx, profile.ID)
	if err != nil {
		return nil, fmt.Errorf("game: user tags: %w", err)
	}
	return tags, nil
}
