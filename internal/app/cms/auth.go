package cms

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/base64"
	"net/http"
	"time"

	"github.com/kronothepenguin/project-reborn/internal/pkg/storage"
	"golang.org/x/crypto/bcrypt"
)

const (
	cookieSession = "session"
	cookieEmail   = "email"
	cookieMaxAge  = 7 * 24 * 60 * 60 // 1 week
)

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

func login(db *sql.DB, ctx context.Context, email, password string) error {
	queries := storage.New(db)

	user, err := queries.GetUserByEmail(ctx, email)
	if err != nil {
		return err
	}

	return bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
}

func createSession(db *sql.DB, ctx context.Context, w http.ResponseWriter, email string, remember bool) error {
	queries := storage.New(db)

	user, err := queries.GetUserByEmail(ctx, email)
	if err != nil {
		return err
	}

	token, err := generateToken(32)
	if err != nil {
		return err
	}

	if err := queries.CreateSession(ctx, storage.CreateSessionParams{
		UserID: user.ID,
		Token:  token,
	}); err != nil {
		return err
	}

	maxAge := 0
	if remember {
		maxAge = cookieMaxAge
	}
	setSessionCookies(w, email, token, maxAge)

	return nil
}

func setSessionCookies(w http.ResponseWriter, email, token string, maxAge int) {
	for _, c := range []*http.Cookie{
		{Name: cookieSession, Value: token},
		{Name: cookieEmail, Value: email},
	} {
		c.Path = "/"
		c.HttpOnly = true
		c.SameSite = http.SameSiteLaxMode
		c.MaxAge = maxAge
		http.SetCookie(w, c)
	}
}

func clearSessionCookies(w http.ResponseWriter) {
	for _, name := range []string{cookieSession, cookieEmail} {
		http.SetCookie(w, &http.Cookie{
			Name:     name,
			Value:    "",
			Path:     "/",
			MaxAge:   -1,
			HttpOnly: true,
		})
	}
}

func refreshSession(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie(cookieSession)
	if err != nil || cookie.MaxAge <= 0 {
		return
	}
	emailCookie, err := r.Cookie(cookieEmail)
	if err != nil {
		return
	}
	setSessionCookies(w, emailCookie.Value, cookie.Value, cookieMaxAge)
}

func destroySession(db *sql.DB, ctx context.Context, w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie(cookieSession)
	if err == nil {
		storage.New(db).DeleteSession(ctx, cookie.Value)
	}
	clearSessionCookies(w)
}

func generateToken(n int) (string, error) {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}
