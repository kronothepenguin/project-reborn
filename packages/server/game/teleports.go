package game

import (
	"context"
	"database/sql"
	"fmt"
	"strconv"

	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/furni"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
)

// TeleportLeft tells a room that a habbo goes away through the teleport ID, and TeleportArrival that the habbo Name
// comes out of it.
type (
	TeleportLeft    struct{ ID int64 }
	TeleportArrival struct {
		ID   int64
		Name string
	}
)

// teleportIn returns the habbo room viewer is in and its teleport id.
func teleportIn(viewer habbo.Habbo, id int64) (*room.Room, room.Furni, bool) {
	r, item, ok := in(viewer, id)
	if !ok || !furni.IsTeleport(item.Definition.Sprite) {
		return nil, room.Furni{}, false
	}
	return r, item, true
}

// stands reports whether the habbo stands on the teleport's tile.
func stands(o room.Occupant, teleport room.Furni) bool {
	return o.X == int(teleport.X) && o.Y == int(teleport.Y)
}

// EnterTeleport steps the habbo into the teleport id (INTODOOR) from the tile in front of it, the one the teleport
// faces, as Holo did: a teleport's tile takes no walk, so the step is taken here and told at once, and the room's
// clock ends it on its next tick.
func EnterTeleport(viewer habbo.Habbo, id int64) {
	r, teleport, ok := teleportIn(viewer, id)
	if !ok {
		return
	}
	front := directions[teleport.Direction%8]
	x, y := int(teleport.X), int(teleport.Y)
	var step *room.Occupant
	r.Update(viewer.ID, func(o *room.Occupant) {
		if o.Leaving || o.Walking || o.X != x+front.x || o.Y != y+front.y {
			return
		}
		o.HeadDirection = direction(o.X, o.Y, x, y)
		o.BodyDirection = o.HeadDirection
		o.Statuses = append(without(o.Statuses, "mv", "sit", "lay"), room.Status{
			Action:     "mv",
			Parameters: strconv.Itoa(x) + "," + strconv.Itoa(y) + "," + level(teleport.Altitude),
		})
		sent := snapshot(o)
		step = &sent
		o.X, o.Y, o.Height = x, y, teleport.Altitude
		o.Walking, o.GoalX, o.GoalY, o.Changed = true, x, y, false
	})
	if step != nil {
		broadcast(r, Statuses{Occupants: []room.Occupant{*step}})
	}
}

// TeleportTarget returns the teleport that the teleport id leads to, and the room that one stands in (GETDOORFLAT),
// for the habbo that stands in id, and opens its passage there. It reports false while the other of the pair stands
// in no room: in a hand, in a present, or recycled (plans/server decision 0111).
func TeleportTarget(ctx context.Context, db *sql.DB, viewer habbo.Habbo, id int64) (teleport, flat int64, ok bool, err error) {
	r, from, ok := teleportIn(viewer, id)
	if !ok || !from.PartnerFurniID.Valid {
		return 0, 0, false, nil
	}
	if o, ok := r.Occupant(viewer.ID); !ok || !stands(o, from) {
		return 0, 0, false, nil
	}
	to, err := store.New(db).GetFurni(ctx, from.PartnerFurniID.Int64)
	if store.IsNotFound(err) || err == nil && !to.RoomID.Valid {
		return 0, 0, false, nil
	}
	if err != nil {
		return 0, 0, false, fmt.Errorf("game: teleport target: %w", err)
	}
	room.OpenPassage(viewer.ID, room.Passage{Teleport: to.ID, Ref: room.Ref{ID: to.RoomID.Int64}})
	return to.ID, to.RoomID.Int64, true, nil
}

// LeaveByTeleport shows the room that the habbo goes away through the teleport id it stands in (DOORGOIN).
func LeaveByTeleport(viewer habbo.Habbo, id int64) {
	r, teleport, ok := teleportIn(viewer, id)
	if !ok {
		return
	}
	if o, ok := r.Occupant(viewer.ID); ok && stands(o, teleport) {
		broadcast(r, TeleportLeft{ID: id})
	}
}

// GoViaTeleport takes the habbo through the passage it opened, to the teleport id of the room flatID (GOVIADOOR), and
// reports whether the habbo is now let into another room, which it goes on into with GOTOFLAT. In the room it is in,
// the habbo stands in the other teleport at once, and the room sees it come out. Into another room, which it must
// have chosen, the teleport lets it past the doorbell, the password, a ban and the room's last place, as Holo did
// (plans/server decision 0110).
func GoViaTeleport(viewer habbo.Habbo, flatID, id int64) bool {
	p, ok := room.ClosePassage(viewer.ID)
	if !ok || p.Teleport != id || p.Ref.ID != flatID {
		return false
	}
	r, ok := room.In(viewer.ID)
	if !ok {
		return room.AdmitThrough(viewer.ID, p.Ref, id)
	}
	if r.Ref() != p.Ref {
		return false
	}
	if teleport, ok := arriveByTeleport(r, viewer, id); ok {
		if o, ok := r.Occupant(viewer.ID); ok {
			broadcast(r, Statuses{Occupants: []room.Occupant{o}})
		}
		broadcast(r, TeleportArrival{ID: teleport.ID, Name: viewer.Name})
	}
	return false
}

// arriveByTeleport stands the habbo, which is in r, in the teleport id of r, facing the teleport's way, and reports
// whether it did: not for a teleport that left the room meanwhile, nor for the id 0 of a habbo that came by the door.
func arriveByTeleport(r *room.Room, viewer habbo.Habbo, id int64) (room.Furni, bool) {
	teleport, ok := r.FurniByID(id)
	if id == 0 || !ok || !furni.IsTeleport(teleport.Definition.Sprite) {
		return room.Furni{}, false
	}
	moved := r.Update(viewer.ID, func(o *room.Occupant) {
		o.X, o.Y, o.Height = int(teleport.X), int(teleport.Y), teleport.Altitude
		o.HeadDirection, o.BodyDirection = int(teleport.Direction), int(teleport.Direction)
		o.Statuses = without(o.Statuses, "mv", "sit", "lay")
		o.Walking, o.Changed = false, false
	})
	return teleport, moved
}
