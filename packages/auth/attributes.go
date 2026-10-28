package auth

import (
	"context"
	"fmt"
	"slices"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// Attribute is a permission a user holds through their access groups.
type Attribute string

const (
	HousekeepingAccess          Attribute = "housekeeping.access"
	HousekeepingSettings        Attribute = "housekeeping.settings"
	HousekeepingAccessGroups    Attribute = "housekeeping.accessGroups"
	HousekeepingNews            Attribute = "housekeeping.news"
	HousekeepingBanners         Attribute = "housekeeping.banners"
	HousekeepingHomeStore       Attribute = "housekeeping.homeStore"
	HousekeepingUsers           Attribute = "housekeeping.users"
	HousekeepingUsersEdit       Attribute = "housekeeping.usersEdit"
	HousekeepingCredits         Attribute = "housekeeping.credits"
	HousekeepingVouchers        Attribute = "housekeeping.vouchers"
	HousekeepingBans            Attribute = "housekeeping.bans"
	HousekeepingAlerts          Attribute = "housekeeping.alerts"
	HousekeepingAlertsBroadcast Attribute = "housekeeping.alertsBroadcast"
	HousekeepingHelp            Attribute = "housekeeping.help"
	HousekeepingLogs            Attribute = "housekeeping.logs"
	SiteMaintenanceBypass       Attribute = "site.maintenanceBypass"
	ForumEdit                   Attribute = "forum.edit"
	HomesStaffItems             Attribute = "homes.staffItems"
)

type CatalogueEntry struct {
	Attribute   Attribute
	Description string
}

var catalogue = []CatalogueEntry{
	{HousekeepingAccess, "entering housekeeping"},
	{HousekeepingSettings, "editing settings, including maintenance"},
	{HousekeepingAccessGroups, "managing access groups and their members"},
	{HousekeepingNews, "writing and deleting news"},
	{HousekeepingBanners, "managing banners"},
	{HousekeepingHomeStore, "managing the home store catalogue"},
	{HousekeepingUsers, "searching users and habbos, seeing emails and IP history"},
	{HousekeepingUsersEdit, "editing users, habbos and badges"},
	{HousekeepingCredits, "giving or taking credits"},
	{HousekeepingVouchers, "creating vouchers"},
	{HousekeepingBans, "banning and lifting bans"},
	{HousekeepingAlerts, "alerting one habbo"},
	{HousekeepingAlertsBroadcast, "alerting everyone"},
	{HousekeepingHelp, "handling help tickets"},
	{HousekeepingLogs, "reading the staff log"},
	{SiteMaintenanceBypass, "using the site during maintenance"},
	{ForumEdit, "editing, deleting, locking or pinning any thread or post"},
	{HomesStaffItems, "the staff store category and the staff skin"},
}

// Catalogue lists every attribute with what it grants, for housekeeping's
// checkboxes and the installer's administrators group.
func Catalogue() []CatalogueEntry {
	return slices.Clone(catalogue)
}

// Attributes returns the union of the attributes of userID's access groups.
func (a *Auth) Attributes(ctx context.Context, userID int64) ([]Attribute, error) {
	names, err := store.New(a.db).ListUserAttributes(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("auth: attributes: %w", err)
	}
	attributes := make([]Attribute, len(names))
	for i, name := range names {
		attributes[i] = Attribute(name)
	}
	return attributes, nil
}
