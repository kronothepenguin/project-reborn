package auth

import (
	"context"
	"database/sql"
	"fmt"
	"slices"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// Fuse is a right of the R26 game client, kept by its exact name (plans/holo-port
// decision 0015). Access groups grant fuses as they grant attributes, through the
// same table (plans/server decision 0045).
type Fuse string

const (
	FuseTrade                 Fuse = "fuse_trade"
	FuseBuyCredits            Fuse = "fuse_buy_credits"
	FuseUseClubDance          Fuse = "fuse_use_club_dance"
	FuseUseSpecialRoomLayouts Fuse = "fuse_use_special_room_layouts"
	FuseHabboChooser          Fuse = "fuse_habbo_chooser"
	FuseFurniChooser          Fuse = "fuse_furni_chooser"

	FuseAdministratorAccess Fuse = "fuse_administrator_access"
	FuseAlert               Fuse = "fuse_alert"
	FuseAnyRoomController   Fuse = "fuse_any_room_controller"
	FuseBan                 Fuse = "fuse_ban"
	FuseCancelRoomEvent     Fuse = "fuse_cancel_roomevent"
	FuseCatalogEditor       Fuse = "fuse_catalog_editor"
	FuseCredits             Fuse = "fuse_credits"
	FuseDebugWindow         Fuse = "fuse_debug_window"
	FuseEnterFullRooms      Fuse = "fuse_enter_full_rooms"
	FuseEnterLockedRooms    Fuse = "fuse_enter_locked_rooms"
	FuseFreeze              Fuse = "fuse_freeze"
	FuseKick                Fuse = "fuse_kick"
	FuseModeratorAccess     Fuse = "fuse_moderator_access"
	FuseMute                Fuse = "fuse_mute"
	FusePerformancePanel    Fuse = "fuse_performance_panel"
	FusePickUpAnyFurni      Fuse = "fuse_pick_up_any_furni"
	FuseReceiveCallsForHelp Fuse = "fuse_receive_calls_for_help"
	FuseRemovePhotos        Fuse = "fuse_remove_photos"
	FuseRemoveStickies      Fuse = "fuse_remove_stickies"
	FuseRoomAlert           Fuse = "fuse_room_alert"
	FuseRoomKick            Fuse = "fuse_room_kick"
	FuseRoomMute            Fuse = "fuse_room_mute"
	FuseSeeAllRoomOwners    Fuse = "fuse_see_all_roomowners"
	FuseSeeChatLogLink      Fuse = "fuse_see_chat_log_link"
	FuseSeeFlatIDs          Fuse = "fuse_see_flat_ids"
	FuseSuperban            Fuse = "fuse_superban"
	FuseTeleport            Fuse = "fuse_teleport"
)

var (
	defaultFuses = []Fuse{FuseTrade, FuseBuyCredits}
	clubFuses    = []Fuse{FuseUseClubDance, FuseUseSpecialRoomLayouts, FuseHabboChooser, FuseFurniChooser}
)

type FuseEntry struct {
	Fuse        Fuse
	Description string
}

var fuseCatalogue = []FuseEntry{
	{FuseAdministratorAccess, "the chat commands :ha, :offline, :refresh, :cat_transform, :mycoords and :masscredits"},
	{FuseAlert, "alerting a habbo from the mod tool, the chat commands :alert and :ra, and the client's alert when a download from another domain fails"},
	{FuseAnyRoomController, "acting as owner in any room, kicking, banning and handling furni, and owners cannot kick or ban the holder"},
	{FuseBan, "banning from the mod tool, and the chat command :ban"},
	{FuseCancelRoomEvent, "ending and editing any room's event"},
	{FuseCatalogEditor, "the chat command :editcatalogue, for the catalogue's edit mode"},
	{FuseCredits, "the chat command :credits"},
	{FuseDebugWindow, "the debug chat commands :copypaste and :petcontrol, and logging the connection"},
	{FuseEnterFullRooms, "entering full rooms"},
	{FuseEnterLockedRooms, "entering any room past its doorbell, password, club or staff lock, and seeing hidden room owners in the navigator's lists"},
	{FuseFreeze, "the chat commands :freeze and :unfreeze"},
	{FuseFurniChooser, "the furni chooser of a private room, with the chat command :furni"},
	{FuseHabboChooser, "the habbo chooser, with the chat command :chooser"},
	{FuseKick, "the mod tool and its button in rooms, kicking from it, and the chat command :kick"},
	{FuseModeratorAccess, "the chat commands :commandlist, :teletome, :jatlook, :userinfo and :whosonline"},
	{FuseMute, "the chat commands :shutup and :unmute"},
	{FusePerformancePanel, "the performance panel, with the chat command :performance"},
	{FusePickUpAnyFurni, "opening presents and answering the doorbell in rooms the habbo does not own"},
	{FuseReceiveCallsForHelp, "receiving, answering, deleting and following calls for help"},
	{FuseRemovePhotos, "taking down photos in rooms the habbo does not own"},
	{FuseRemoveStickies, "deleting post-its in rooms the habbo does not own"},
	{FuseRoomAlert, "alerting a whole room from the mod tool, and the chat command :roomalert"},
	{FuseRoomKick, "kicking a whole room from the mod tool, and the chat command :roomkick"},
	{FuseRoomMute, "the chat commands :roomshutup and :roomunmute"},
	{FuseSeeAllRoomOwners, "seeing the owner of a room that hides it, in the navigator's search"},
	{FuseSeeChatLogLink, "the chat log link of a call for help"},
	{FuseSeeFlatIDs, "the ids of rooms in the navigator and in calls for help"},
	{FuseSuperban, "banning the IP address too, from the mod tool, and the chat command :superban"},
	{FuseTeleport, "the chat commands :teleport and :warp"},
	{FuseUseClubDance, "the club dances"},
	{FuseUseSpecialRoomLayouts, "the club's room layouts when creating a room"},
}

// FuseCatalogue lists the fuses access groups grant, with what each allows in the
// game, for housekeeping's checkboxes. fuse_trade and fuse_buy_credits are not in
// it: every habbo holds them.
func FuseCatalogue() []FuseEntry {
	return slices.Clone(fuseCatalogue)
}

// Fuses returns the fuses of userID's habbos: fuse_trade and fuse_buy_credits
// for everyone, the club fuses while the user's club runs, and the catalogue's
// fuses of the user's access groups.
func Fuses(ctx context.Context, db *sql.DB, userID int64) ([]Fuse, error) {
	q := store.New(db)
	fuses := slices.Clone(defaultFuses)
	_, err := q.GetClubEnd(ctx, store.GetClubEndParams{UserID: userID, Now: clock().UTC()})
	switch {
	case err == nil:
		fuses = append(fuses, clubFuses...)
	case !store.IsNotFound(err):
		return nil, fmt.Errorf("auth: fuses: %w", err)
	}
	names, err := q.ListUserAttributes(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("auth: fuses: %w", err)
	}
	for _, entry := range fuseCatalogue {
		if slices.Contains(names, string(entry.Fuse)) && !slices.Contains(fuses, entry.Fuse) {
			fuses = append(fuses, entry.Fuse)
		}
	}
	return fuses, nil
}
