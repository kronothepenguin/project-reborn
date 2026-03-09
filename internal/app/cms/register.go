package cms

import (
	"context"
	"database/sql"
	"errors"
	"maps"
	"net/http"
	"slices"
	"time"

	"github.com/kronothepenguin/project-reborn/internal/app/cms/validator"
	"github.com/kronothepenguin/project-reborn/internal/pkg/storage"
	"github.com/kronothepenguin/project-reborn/internal/pkg/tmpl"
	"golang.org/x/crypto/bcrypt"
)

func (c *CMS) handleRegisterView(w http.ResponseWriter, r *http.Request) {
	tmpl.ExecuteTemplate(r.Context(), w, "register.page.html", c.data)
}

func (c *CMS) handleRegister(w http.ResponseWriter, r *http.Request) {
	errs := map[string]error{}

	name := validator.AvatarName(r.FormValue("username"))
	errs["name"] = name.Validate()

	password := &validator.Password{
		Value:   r.FormValue("password"),
		Confirm: r.FormValue("password_confirm"),
	}
	errs["password"] = password.Validate()

	date := &validator.Date{
		Day:   r.FormValue("day"),
		Month: r.FormValue("month"),
		Year:  r.FormValue("year"),
	}
	errs["date"] = date.Validate()

	email := &validator.Email{
		Value:   r.FormValue("email"),
		Confirm: r.FormValue("email_confirm"),
	}
	errs["email"] = email.Validate()

	// newsletter := r.FormValue("newsletter")
	tos := r.FormValue("terms")
	if tos != "true" {
		errs["tos"] = errors.New("accept_tos")
	}

	err := errors.Join(slices.Collect(maps.Values(errs))...)
	if err != nil {
		data := maps.Clone(c.data)
		data["Value"] = map[string]any{
			"name":     name,
			"password": password.Value,
			"day":      date.Day,
			"month":    date.Month,
			"year":     date.Year,
			"email":    email.Value,
			"tos":      tos,
		}
		data["Error"] = errs
		tmpl.ExecuteTemplate(r.Context(), w, "register.page.html", data)
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password.Value), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	dob, err := time.Parse(time.DateOnly, date.Year+"-"+date.Month+"-"+date.Day)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := register(c.db, r.Context(), string(name), email.Value, string(hash), dob); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := login(c.db, email.Value, password.Value); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	http.Redirect(w, r, "/me", http.StatusFound)
}

func register(db *sql.DB, ctx context.Context, name, email, password string, dob time.Time) error {
	tx, err := db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		return err
	}
	defer tx.Rollback()

	queries := storage.New(tx)
	id, err := queries.CreateUser(ctx, storage.CreateUserParams{
		Email:    email,
		Password: password,
		Dob:      dob,
	})
	if err != nil {
		return err
	}
	err = queries.CreateUserAvatar(ctx, storage.CreateUserAvatarParams{
		UserID:  id,
		Name:    name,
		Credits: 500, // TODO: from settings
		Figure:  "",  // TODO: from settings
	})
	if err != nil {
		return err
	}

	return tx.Commit()
}
