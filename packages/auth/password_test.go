package auth

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

func TestValidatePassword(t *testing.T) {
	f := newFixture(t)
	for password, want := range map[string]error{
		"12345":                 ErrPasswordTooShort,
		"123456":                nil,
		strings.Repeat("a", 25): nil,
		strings.Repeat("a", 26): ErrPasswordTooLong,
		strings.Repeat("ñ", 25): nil,
	} {
		err := ValidatePassword(t.Context(), store.New(f.db), password)
		if !errors.Is(err, want) {
			t.Errorf("ValidatePassword(%d characters) = %v, want %v", len([]rune(password)), err, want)
		}
		if want != nil && !errors.Is(err, ErrPasswordLength) {
			t.Errorf("ValidatePassword() error = %v, want it to match ErrPasswordLength", err)
		}
	}

	f.set(t, "auth.passwordMinLength", 8)
	if err := ValidatePassword(t.Context(), store.New(f.db), "1234567"); !errors.Is(err, ErrPasswordLength) {
		t.Errorf("ValidatePassword() = %v after raising the minimum to 8, want ErrPasswordLength", err)
	}
}

// changePassword posts through Sessions, as a signed-in visitor does, and returns
// the cookie of the answer.
func (f *fixture) changePassword(t *testing.T, cookie *http.Cookie, password string) (*http.Cookie, error) {
	t.Helper()
	var changed error
	handler := Sessions(f.db)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		changed = ChangePassword(w, r, f.db, password)
	}))
	r := httptest.NewRequest(http.MethodPost, "/", nil)
	r.AddCookie(cookie)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, r)
	cookies := rec.Result().Cookies()
	if len(cookies) == 0 {
		return nil, changed
	}
	return cookies[len(cookies)-1], changed
}

func TestChangePasswordKeepsOnlyTheCallersSession(t *testing.T) {
	f := newFixture(t)
	_, avatarID := f.habbo(t, "admin@example.com", "Admin", testPassword)
	mine := f.mustLogin(t, "Admin", false)
	other := f.mustLogin(t, "Admin", false)
	token := f.reset(t)

	renewed, err := f.changePassword(t, mine, "brand-new-1")
	if err != nil {
		t.Fatalf("ChangePassword: %v", err)
	}
	if renewed == nil || renewed.Value == mine.Value {
		t.Fatalf("the cookie = %+v, want a new token", renewed)
	}
	if session, ok, _ := f.visit(t, renewed); !ok || session.AvatarID != avatarID {
		t.Errorf("the new token = %+v, %t, want the same habbo", session, ok)
	}
	if _, ok, _ := f.visit(t, mine); ok {
		t.Error("the old token still works")
	}
	if _, ok, _ := f.visit(t, other); ok {
		t.Error("another session survived the change")
	}
	if n := len(f.sessions(t)); n != 1 {
		t.Errorf("%d sessions, want 1", n)
	}
	if err := ResetPassword(t.Context(), f.db, token, "another-one-2"); !errors.Is(err, ErrInvalidReset) {
		t.Errorf("ResetPassword after the change = %v, want ErrInvalidReset", err)
	}
	if _, _, err := f.login(t, "10.0.0.1", "Admin", testPassword, false); !errors.Is(err, ErrInvalidCredentials) {
		t.Errorf("Login with the old password = %v, want ErrInvalidCredentials", err)
	}
	if _, _, err := f.login(t, "10.0.0.1", "Admin", "brand-new-1", false); err != nil {
		t.Errorf("Login with the new password = %v, want a session", err)
	}
}

func TestChangePasswordKeepsRememberMe(t *testing.T) {
	f := newFixture(t)
	f.habbo(t, "admin@example.com", "Admin", testPassword)
	cookie := f.mustLogin(t, "Admin", true)

	renewed, err := f.changePassword(t, cookie, "brand-new-1")
	if err != nil {
		t.Fatalf("ChangePassword: %v", err)
	}
	if renewed.MaxAge <= 0 {
		t.Errorf("MaxAge = %d, want the cookie to outlive the browser", renewed.MaxAge)
	}
	if session, ok, _ := f.visit(t, renewed); !ok || !session.Remember {
		t.Errorf("the session = %+v, %t, want it remembered", session, ok)
	}
}

func TestChangePasswordValidates(t *testing.T) {
	f := newFixture(t)
	f.habbo(t, "admin@example.com", "Admin", testPassword)
	cookie := f.mustLogin(t, "Admin", false)

	if _, err := f.changePassword(t, cookie, "short"); !errors.Is(err, ErrPasswordTooShort) {
		t.Errorf("ChangePassword(short) = %v, want ErrPasswordTooShort", err)
	}
	if _, ok, _ := f.visit(t, cookie); !ok {
		t.Error("a refused change ended the session")
	}
	if _, _, err := f.login(t, "10.0.0.1", "Admin", testPassword, false); err != nil {
		t.Errorf("Login after the refused change = %v, want a session", err)
	}
}
