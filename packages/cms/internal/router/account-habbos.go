package router

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

type ownHabbo struct {
	ID     int64
	Name   string
	Figure string
	Active bool
}

type habbosPage struct {
	accountPage
	Habbos      []ownHabbo
	ImagingURL  string
	CanAdd      bool
	NewName     string
	Figure      string
	Gender      string
	EditorState string
}

func (r *Router) newHabbosPage(ctx context.Context) (habbosPage, error) {
	session, _ := auth.FromContext(ctx)
	account, err := r.newAccountPage(ctx)
	if err != nil {
		return habbosPage{}, err
	}
	avatars, err := r.deps.Queries.ListUserAvatars(ctx, session.UserID)
	if err != nil {
		return habbosPage{}, err
	}
	habbos := make([]ownHabbo, len(avatars))
	for i, avatar := range avatars {
		habbos[i] = ownHabbo{ID: avatar.ID, Name: avatar.Name, Figure: avatar.Figure, Active: avatar.ID == session.AvatarID}
	}
	return habbosPage{
		accountPage: account,
		Habbos:      habbos,
		ImagingURL:  settings.GetString("imaging.avatarUrl"),
		CanAdd:      len(habbos) < settings.GetInt("registration.maxHabbosPerUser"),
	}, nil
}

// HandleAccountHabbosView renders GET /account/habbos.
func (r *Router) HandleAccountHabbosView(w http.ResponseWriter, req *http.Request) {
	page, err := r.newHabbosPage(req.Context())
	if err != nil {
		r.fail(w, err)
		return
	}
	r.answer(w, "account/habbos.html", false, page)
}

// HandleAccountHabbos handles the POST /account/habbos action, which adds a habbo
// to the user. It starts without credits, so that it does not repeat the welcome
// credits of registering.
func (r *Router) HandleAccountHabbos(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	session, _ := auth.FromContext(ctx)
	name, figure, gender := req.PostFormValue("name"), req.PostFormValue("figure"), req.PostFormValue("gender")
	if figure == "" {
		figure, gender = settings.GetString("registration.defaultFigure"), settings.GetString("registration.defaultGender")
	}

	result, failed, err := r.addHabbo(ctx, session.UserID, name, figure, gender)
	if err != nil {
		r.fail(w, err)
		return
	}
	page, err := r.newHabbosPage(ctx)
	if err != nil {
		r.fail(w, err)
		return
	}
	page.Result, page.Failed = result, failed
	if failed {
		page.NewName, page.Figure, page.Gender, page.EditorState = name, figure, gender, req.PostFormValue("editorState")
	}
	r.answer(w, "account/habbos.html", failed, page)
}

func (r *Router) addHabbo(ctx context.Context, userID int64, name, figure, gender string) (result string, failed bool, err error) {
	problem, err := r.nameProblem(ctx, name, formNameTexts)
	if err != nil {
		return "", false, err
	}
	if problem != "" {
		return problem, true, nil
	}
	if auth.ValidateLook(figure, gender) != nil {
		return "An error occurred trying to process your request.", true, nil
	}

	// The limit is counted in the transaction, so that requests at the same
	// moment cannot pass it together: the pool has one connection.
	tx, err := r.deps.DB.BeginTx(ctx, nil)
	if err != nil {
		return "", false, err
	}
	defer tx.Rollback()
	q := r.deps.Queries.WithTx(tx)
	avatars, err := q.ListUserAvatars(ctx, userID)
	if err != nil {
		return "", false, err
	}
	if limit := settings.GetInt("registration.maxHabbosPerUser"); len(avatars) >= limit {
		return fmt.Sprintf("You can have %d habbos at most.", limit), true, nil
	}
	_, err = auth.CreateHabbo(ctx, q, userID, auth.Habbo{Name: name, Figure: figure, Gender: gender})
	if store.IsConflict(err) {
		return formNameTexts.taken, true, nil
	}
	if err != nil {
		return "", false, err
	}
	if err := tx.Commit(); err != nil {
		return "", false, err
	}
	return name + " is ready to use.", false, nil
}

// HandleAccountHabbosSwitch handles POST /account/habbos/{id}/switch.
func (r *Router) HandleAccountHabbosSwitch(w http.ResponseWriter, req *http.Request) {
	id, err := strconv.ParseInt(req.PathValue("id"), 10, 64)
	if err != nil {
		http.NotFound(w, req)
		return
	}
	err = auth.SwitchHabbo(req.Context(), r.deps.DB, id)
	switch {
	case errors.Is(err, auth.ErrNotOwner):
		http.Error(w, http.StatusText(http.StatusForbidden), http.StatusForbidden)
	case err != nil:
		r.fail(w, err)
	default:
		http.Redirect(w, req, "/account/habbos", http.StatusSeeOther)
	}
}
