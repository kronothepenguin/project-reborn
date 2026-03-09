package cms

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"

	"github.com/kronothepenguin/project-reborn/internal/pkg/storage"
	"github.com/kronothepenguin/project-reborn/internal/pkg/tmpl"
)

func (c *CMS) handleIndexView(w http.ResponseWriter, r *http.Request) {
	tmpl.ExecuteTemplate(r.Context(), w, "index.page.html", c.data)
}

func (c *CMS) handleLogin(w http.ResponseWriter, r *http.Request) {
	fmt.Println(r.FormValue("username"), r.FormValue("password"), r.FormValue("remember"))
	http.Redirect(w, r, "/me", http.StatusFound)
}

func login(db *sql.DB, ctx context.Context, email, password string) error {
	queries := storage.New(db)

	queries.VerifySession(ctx, storage.VerifySessionParams{})
	return nil
}
