package router

import (
	"cmp"
	"net/http"
	"slices"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// quickMenuSize is quickmenu.php's LIMIT.
const quickMenuSize = 10

// quickGroup is one row of the header's My Groups: Admin marks an admin's row
// and Owner the owner's, never both, as quickmenu.php drew them.
type quickGroup struct {
	ID        int64  `json:"id"`
	Name      string `json:"name"`
	Favourite bool   `json:"favourite"`
	Admin     bool   `json:"admin"`
	Owner     bool   `json:"owner"`
}

// purchaseLimits are groupPurchase with the purse, for the dialog behind the
// menu's Create a group.
type purchaseLimits struct {
	Enabled        bool  `json:"enabled"`
	Price          int   `json:"price"`
	Credits        int64 `json:"credits"`
	Owned          int64 `json:"owned"`
	MaxOwned       int   `json:"maxOwned"`
	NameMax        int   `json:"nameMax"`
	DescriptionMax int   `json:"descriptionMax"`
}

type quickMenu struct {
	Groups   []quickGroup   `json:"groups"`
	Purchase purchaseLimits `json:"purchase"`
}

// HandleMeGroupsJSON handles GET /me/groups, quickmenu.php?key=groups: the active
// habbo's groups for the header's My Groups, the members' rows before the
// admins' as Holo's ORDER BY member_rank put them, at most ten.
func (r *Router) HandleMeGroupsJSON(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	session, _ := auth.FromContext(ctx)
	rows, err := r.deps.Queries.ListAvatarGroups(ctx, session.AvatarID)
	if err != nil {
		r.fail(w, err)
		return
	}
	rank := func(role string) int {
		if role == roleAdmin {
			return 2
		}
		return 1
	}
	slices.SortStableFunc(rows, func(a, b store.ListAvatarGroupsRow) int { return cmp.Compare(rank(a.Role), rank(b.Role)) })
	rows = rows[:min(len(rows), quickMenuSize)]
	menu := quickMenu{Groups: make([]quickGroup, 0, len(rows))}
	for _, row := range rows {
		owner := row.OwnerAvatarID == session.AvatarID
		admin := row.Role == roleAdmin
		menu.Groups = append(menu.Groups, quickGroup{ID: row.ID, Name: row.Name, Favourite: row.Favourite, Admin: admin && !owner, Owner: owner})
	}
	purchase, err := r.groupPurchase(ctx, session.UserID)
	if err != nil {
		r.fail(w, err)
		return
	}
	wallet, err := r.deps.Queries.GetWallet(ctx, session.UserID)
	if err != nil {
		r.fail(w, err)
		return
	}
	menu.Purchase = purchaseLimits{
		Enabled:        purchase.Enabled,
		Price:          purchase.Price,
		Credits:        wallet.Credits,
		Owned:          purchase.Owned,
		MaxOwned:       purchase.MaxOwned,
		NameMax:        purchase.NameMax,
		DescriptionMax: purchase.DescriptionMax,
	}
	r.answerJSON(w, http.StatusOK, menu)
}
