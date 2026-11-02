package router

import (
	"math"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// maxWalletAmount keeps wallets far from the limit of SQLite's integers, past which
// a sum silently becomes a float.
const maxWalletAmount = math.MaxInt32

const (
	emailInvalid  = "Invalid e-mail address"
	emailTaken    = "This e-mail address already has an account."
	bornOnInvalid = "Please supply a valid date of birth."
	ticketInvalid = "Tickets and film must be numbers from 0 to 2147483647."
)

type userForm struct {
	email      string
	bornOn     time.Time
	newsletter bool
	tickets    int64
	film       int64
}

// walletField reads a number that a blank field leaves as it is.
func walletField(posted string, current int64) (int64, bool) {
	if posted == "" {
		return current, true
	}
	amount, err := strconv.ParseInt(posted, 10, 64)
	return amount, err == nil && amount >= 0 && amount <= maxWalletAmount
}

// readUserForm answers with a message when a field is refused. The email and the
// birth date take housekeeping.usersPrivate, because whoever cannot read them does
// not get the fields.
func readUserForm(req *http.Request, user store.User, wallet store.Wallet, private bool) (userForm, string) {
	form := userForm{email: user.Email, bornOn: user.BornOn, newsletter: req.PostFormValue("newsletter") != ""}
	if private {
		form.email = keep(req.PostFormValue("email"), user.Email)
		if form.email != user.Email && auth.ValidateEmail(form.email) != nil {
			return form, emailInvalid
		}
		if posted := req.PostFormValue("bornOn"); posted != "" {
			bornOn, err := time.Parse(time.DateOnly, posted)
			if err != nil || auth.ValidateBornOn(bornOn) != nil {
				return form, bornOnInvalid
			}
			form.bornOn = bornOn
		}
	}
	var ok bool
	if form.tickets, ok = walletField(req.PostFormValue("tickets"), wallet.Tickets); !ok {
		return form, ticketInvalid
	}
	if form.film, ok = walletField(req.PostFormValue("film"), wallet.Film); !ok {
		return form, ticketInvalid
	}
	return form, ""
}

func (f userForm) changedFrom(user store.User, wallet store.Wallet) string {
	var changed []string
	if f.email != user.Email {
		changed = append(changed, "email")
	}
	if !f.bornOn.Equal(user.BornOn) {
		changed = append(changed, "birth date")
	}
	if f.newsletter != user.Newsletter {
		changed = append(changed, "newsletter")
	}
	if f.tickets != wallet.Tickets {
		changed = append(changed, "tickets")
	}
	if f.film != wallet.Film {
		changed = append(changed, "film")
	}
	return strings.Join(changed, ", ")
}

// HandleUserSave handles POST /housekeeping/users/{id}, the user's half of Holo's
// Edit User. The form lives on the page of one of the user's habbos, and the posted
// habbo says which, so that the answer comes back to it. Credits are not here: they
// move only with a ledger row, through the credits form.
func (r *Router) HandleUserSave(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	id, err := strconv.ParseInt(req.PathValue("id"), 10, 64)
	if err != nil {
		http.NotFound(w, req)
		return
	}
	habboID, err := strconv.ParseInt(req.PostFormValue("habbo"), 10, 64)
	if err != nil {
		http.NotFound(w, req)
		return
	}
	avatar, err := r.deps.Queries.GetAvatar(ctx, habboID)
	switch {
	case store.IsNotFound(err):
		http.NotFound(w, req)
		return
	case err != nil:
		r.fail(w, err)
		return
	case avatar.UserID != id:
		http.NotFound(w, req)
		return
	}
	user, err := r.deps.Queries.GetUser(ctx, id)
	if err != nil {
		r.fail(w, err)
		return
	}
	wallet, err := r.deps.Queries.GetWallet(ctx, id)
	if err != nil {
		r.fail(w, err)
		return
	}

	allowed, err := r.mayActOn(req, "edit user", id, avatar.ID)
	if err != nil {
		r.fail(w, err)
		return
	}
	if !allowed {
		r.refuseHabbo(w, req, avatar, userAbove)
		return
	}
	private, err := r.holds(req, auth.HousekeepingUsersPrivate)
	if err != nil {
		r.fail(w, err)
		return
	}
	form, message := readUserForm(req, user, wallet, private)
	if message != "" {
		r.refuseHabbo(w, req, avatar, message)
		return
	}

	now := time.Now().UTC()
	err = r.inTx(ctx, func(q *store.Queries) error {
		err := q.UpdateUser(ctx, store.UpdateUserParams{
			ID:         id,
			Email:      form.email,
			BornOn:     form.bornOn,
			Newsletter: form.newsletter,
			UpdatedAt:  now,
		})
		if err != nil {
			return err
		}
		err = q.UpdateWalletTicketsAndFilm(ctx, store.UpdateWalletTicketsAndFilmParams{
			UserID:    id,
			Tickets:   form.tickets,
			Film:      form.film,
			UpdatedAt: now,
		})
		if err != nil {
			return err
		}
		return writeLog(req, q, staffLog{
			action:       actionUsersUpdate,
			detail:       form.changedFrom(user, wallet),
			targetUser:   id,
			targetAvatar: avatar.ID,
		})
	})
	switch {
	case store.IsConflict(err):
		r.refuseHabbo(w, req, avatar, emailTaken)
	case err != nil:
		r.fail(w, err)
	default:
		http.Redirect(w, req, habboPath(avatar.ID)+"?saved=1", http.StatusSeeOther)
	}
}
