package game

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/settings"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
)

// RightsChanged tells a habbo that it got rights in its room, or lost them.
type RightsChanged struct{ On bool }

// AssignRights gives the habbo name, in the viewer's room, rights there (ASSIGNRIGHTS), when the viewer owns the room
// and the habbo has none and is no owner, as Holo had it: saved, then the habbo gets RightsChanged and the status
// flatctrl.
func AssignRights(ctx context.Context, db *sql.DB, viewer habbo.Habbo, name string) error {
	r, target, ok := targetIn(viewer, name)
	if !ok || !owns(r, viewer) || owns(r, target.Habbo) || r.HasRights(target.Habbo.ID) {
		return nil
	}
	err := store.New(db).AddRoomRights(ctx, store.AddRoomRightsParams{RoomID: r.Ref().ID, AvatarID: target.Habbo.ID, GrantedAt: time.Now().UTC()})
	if err != nil {
		return fmt.Errorf("game: assign rights: %w", err)
	}
	setRights(r, target.Occupant, true)
	return nil
}

// RemoveRights takes the rights of the habbo name in the viewer's room (REMOVERIGHTS), when the viewer owns the room.
func RemoveRights(ctx context.Context, db *sql.DB, viewer habbo.Habbo, name string) error {
	r, target, ok := targetIn(viewer, name)
	if !ok || !owns(r, viewer) || !r.HasRights(target.Habbo.ID) {
		return nil
	}
	_, err := store.New(db).RemoveRoomRights(ctx, store.RemoveRoomRightsParams{RoomID: r.Ref().ID, AvatarID: target.Habbo.ID})
	if err != nil {
		return fmt.Errorf("game: remove rights: %w", err)
	}
	setRights(r, target.Occupant, false)
	return nil
}

// RemoveAllRights takes every habbo's rights in the viewer's own room flatID at once, from the navigator's modify
// page (REMOVEALLRIGHTS).
func RemoveAllRights(ctx context.Context, db *sql.DB, viewer habbo.Habbo, flatID int64) error {
	q := store.New(db)
	flat, err := q.GetRoom(ctx, flatID)
	if store.IsNotFound(err) || (err == nil && flat.OwnerAvatarID != viewer.ID) {
		return nil
	}
	if err != nil {
		return fmt.Errorf("game: remove all rights: %w", err)
	}
	ids, err := q.RemoveAllRoomRights(ctx, flatID)
	if err != nil {
		return fmt.Errorf("game: remove all rights: %w", err)
	}
	r, ok := room.Loaded(room.Ref{ID: flatID})
	if !ok {
		return nil
	}
	for _, id := range ids {
		if o, in := r.Occupant(id); in {
			setRights(r, o, false)
		} else {
			r.SetRights(id, false)
		}
	}
	return nil
}

// setRights changes the copy of the room's rights once the store has the change (decision server/0010), and
// the habbo's flatctrl status and its client's control.
func setRights(r *room.Room, o room.Occupant, on bool) {
	r.SetRights(o.AvatarID, on)
	r.Update(o.AvatarID, func(o *room.Occupant) {
		if on {
			o.Statuses = setStatus(o.Statuses, room.Status{Action: "flatctrl"})
		} else {
			o.Statuses = without(o.Statuses, "flatctrl")
		}
		o.Changed = true
	})
	o.Session.Notify(RightsChanged{On: on})
}

// Kick sends the habbo name walking out of the viewer's habbo room (KICKUSER): the viewer may when it owns the room or
// has rights in it, as the client shows its button. Nobody kicks an owner of the room, nor a holder of
// fuse_any_room_controller (decision server/0045). The habbo walks to the door and leaves there (decision
// server/0079).
func Kick(viewer habbo.Habbo, name string) {
	r, target, ok := targetIn(viewer, name)
	if !ok || !controls(r, viewer) || owns(r, target.Habbo) {
		return
	}
	walkOut(r, target.Occupant.AvatarID)
}

// Ban bans the habbo name from the viewer's habbo room for game.roomBanMinutes (BANUSER), then sends it walking out:
// the viewer may when it owns the room, as the client shows its button (decisions server/0067 and server/0079).
func Ban(ctx context.Context, db *sql.DB, viewer habbo.Habbo, name string) error {
	r, target, ok := targetIn(viewer, name)
	if !ok || !owns(r, viewer) || owns(r, target.Habbo) {
		return nil
	}
	q := store.New(db)
	end := time.Now().UTC().Add(time.Duration(settings.Int(ctx, q, "game.roomBanMinutes")) * time.Minute)
	err := q.BanFromRoom(ctx, store.BanFromRoomParams{RoomID: r.Ref().ID, AvatarID: target.Habbo.ID, ExpiresAt: end})
	if err != nil {
		return fmt.Errorf("game: ban: %w", err)
	}
	r.Ban(target.Habbo.ID, end)
	walkOut(r, target.Occupant.AvatarID)
	return nil
}

// DeleteEndedRoomBans deletes the room bans that ended at now. An ended ban no longer holds, so this only keeps
// room_bans small; server.New runs it every minute, as the programs that serve sessions delete the expired ones.
func DeleteEndedRoomBans(ctx context.Context, db *sql.DB, now time.Time) error {
	if _, err := store.New(db).DeleteExpiredRoomBans(ctx, now.UTC()); err != nil {
		return fmt.Errorf("game: delete ended room bans: %w", err)
	}
	return nil
}

func walkOut(r *room.Room, avatarID int64) {
	door := r.Model()
	r.Update(avatarID, func(o *room.Occupant) {
		o.Leaving, o.Walking = true, true
		o.GoalX, o.GoalY = int(door.DoorX), int(door.DoorY)
	})
}

// targetIn finds the habbo name in the viewer's habbo room, other than the viewer.
func targetIn(viewer habbo.Habbo, name string) (*room.Room, Visitor, bool) {
	r, ok := room.In(viewer.ID)
	if !ok || r.Ref().Public {
		return nil, Visitor{}, false
	}
	for _, v := range visitorsOf(r) {
		if v.Habbo.ID != viewer.ID && strings.EqualFold(v.Habbo.Name, name) {
			return r, v, true
		}
	}
	return nil, Visitor{}, false
}
