package router

import (
	"context"
	"database/sql"
	"net/http"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/cms/internal/badge"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

const (
	groupPurchaseDetail = "Group purchase"
	reasonGroup         = "group"
	accessRegular       = "open"
	roleAdmin           = "admin"
	roleMember          = "member"
	widgetGroup         = "group_info"
)

// Why a purchase fails, which the dialog words as grouppurchase.php did.
const (
	purchaseDisabled        = "disabled"
	purchaseCredits         = "credits"
	purchaseOwned           = "owned"
	purchaseBlank           = "blank"
	purchaseNameLong        = "nameLong"
	purchaseDescriptionLong = "descriptionLong"
	purchaseTaken           = "taken"
)

// myGroup is a group the active habbo joined, as its lists show it.
type myGroup struct {
	ID    int64
	Name  string
	Badge string
}

// groupPurchase is what grouppurchase.php checked before it showed its form, so
// that the dialog can open as Holo's did; buying checks it all again.
type groupPurchase struct {
	Enabled        bool
	Price          int
	Owned          int64
	MaxOwned       int
	NameMax        int
	DescriptionMax int
}

func (r *Router) myGroups(ctx context.Context, avatarID int64) ([]myGroup, error) {
	rows, err := r.deps.Queries.ListAvatarGroups(ctx, avatarID)
	if err != nil {
		return nil, err
	}
	groups := make([]myGroup, 0, len(rows))
	for _, row := range rows {
		groups = append(groups, myGroup{ID: row.ID, Name: row.Name, Badge: row.Badge})
	}
	return groups, nil
}

func (r *Router) groupPurchase(ctx context.Context, userID int64) (groupPurchase, error) {
	owned, err := r.deps.Queries.CountUserOwnedGroups(ctx, userID)
	if err != nil {
		return groupPurchase{}, err
	}
	return groupPurchase{
		Enabled:        settings.GetBool("features.groupPurchase"),
		Price:          settings.GetInt("groups.price"),
		Owned:          owned,
		MaxOwned:       settings.GetInt("groups.maxOwned"),
		NameMax:        settings.GetInt("groups.nameMaxLength"),
		DescriptionMax: settings.GetInt("groups.descriptionMaxLength"),
	}, nil
}

type purchaseBody struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type purchaseAnswer struct {
	ID    int64  `json:"id,omitempty"`
	Name  string `json:"name,omitempty"`
	Error string `json:"error,omitempty"`
}

// HandleGroupsPurchase handles POST /groups, grouppurchase.php's confirmation:
// the active habbo buys a Regular group with Holo's badge from the user's purse.
// The debit, its ledger row, the group, the owner's admin row and the home with
// its Group information widget are written together.
func (r *Router) HandleGroupsPurchase(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	var body purchaseBody
	if !readEdit(w, req, &body) {
		return
	}
	session, _ := auth.FromContext(ctx)
	name := strings.TrimSpace(body.Name)
	description := strings.TrimSpace(body.Description)

	refusal := ""
	var created store.Group
	now := time.Now().UTC()
	err := r.inTx(ctx, func(q *store.Queries) error {
		price := settings.GetInt("groups.price")
		if !settings.GetBool("features.groupPurchase") {
			refusal = purchaseDisabled
			return nil
		}
		wallet, err := q.GetWallet(ctx, session.UserID)
		if err != nil {
			return err
		}
		if wallet.Credits < int64(price) {
			refusal = purchaseCredits
			return nil
		}
		owned, err := q.CountUserOwnedGroups(ctx, session.UserID)
		if err != nil {
			return err
		}
		switch {
		case owned >= int64(settings.GetInt("groups.maxOwned")):
			refusal = purchaseOwned
			return nil
		case name == "" || description == "":
			refusal = purchaseBlank
			return nil
		case utf8.RuneCountInString(name) > settings.GetInt("groups.nameMaxLength"):
			refusal = purchaseNameLong
			return nil
		case utf8.RuneCountInString(description) > settings.GetInt("groups.descriptionMaxLength"):
			refusal = purchaseDescriptionLong
			return nil
		}
		switch _, err := q.GetGroupByName(ctx, name); {
		case err == nil:
			refusal = purchaseTaken
			return nil
		case !store.IsNotFound(err):
			return err
		}

		changed, err := q.ChangeWalletCredits(ctx, store.ChangeWalletCreditsParams{UserID: session.UserID, Credits: -int64(price), UpdatedAt: now})
		if err != nil {
			return err
		}
		if changed == 0 {
			refusal = purchaseCredits
			return nil
		}
		err = q.CreateWalletTransaction(ctx, store.CreateWalletTransactionParams{
			UserID:    session.UserID,
			AvatarID:  sql.NullInt64{Int64: session.AvatarID, Valid: true},
			Credits:   -int64(price),
			Reason:    reasonGroup,
			Detail:    groupPurchaseDetail,
			CreatedAt: now,
		})
		if err != nil {
			return err
		}
		created, err = q.CreateGroup(ctx, store.CreateGroupParams{
			AvatarID:    session.AvatarID,
			Name:        name,
			Description: description,
			Badge:       badge.Default,
			Access:      accessRegular,
			CreatedAt:   now,
			UpdatedAt:   now,
		})
		if err != nil {
			return err
		}
		err = q.AddGroupMember(ctx, store.AddGroupMemberParams{
			GroupID:     created.ID,
			AvatarID:    session.AvatarID,
			Role:        roleAdmin,
			RequestedAt: now,
			JoinedAt:    sql.NullTime{Time: now, Valid: true},
		})
		if err != nil {
			return err
		}
		home, err := q.CreateGroupHome(ctx, store.CreateGroupHomeParams{GroupID: created.ID, UpdatedAt: now})
		if err != nil {
			return err
		}
		// Holo wrote the Group information widget where it wrote the profile widget.
		_, err = q.CreateHomeItem(ctx, store.CreateHomeItemParams{
			HomeID:    home.ID,
			Kind:      "widget",
			Widget:    sql.NullString{String: widgetGroup, Valid: true},
			Skin:      "defaultskin",
			X:         profileX,
			Y:         profileY,
			Z:         profileZ,
			CreatedAt: now,
			UpdatedAt: now,
		})
		return err
	})
	switch {
	case store.IsConflict(err):
		r.answerJSON(w, http.StatusUnprocessableEntity, purchaseAnswer{Error: purchaseTaken})
	case err != nil:
		r.fail(w, err)
	case refusal != "":
		r.answerJSON(w, http.StatusUnprocessableEntity, purchaseAnswer{Error: refusal})
	default:
		r.answerJSON(w, http.StatusOK, purchaseAnswer{ID: created.ID, Name: created.Name})
	}
}
