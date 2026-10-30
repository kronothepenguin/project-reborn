package auth

import (
	"errors"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

func testAccount() Account {
	return Account{
		Email:        "new@example.com",
		BornOn:       time.Date(1990, time.May, 1, 0, 0, 0, 0, time.UTC),
		Newsletter:   true,
		IP:           "10.0.0.1",
		PasswordHash: HashPassword(testPassword),
		Habbo: Habbo{
			Name:    "Newbie",
			Figure:  "hd-180-1.ch-215-82.lg-270-82",
			Gender:  "F",
			Credits: 500,
			Detail:  "Welcome!",
		},
	}
}

func TestValidateHabboName(t *testing.T) {
	for name, valid := range map[string]bool{
		"Admin":                 true,
		"a":                     true,
		"Admin-1":               true,
		"-=?!@:.,":              true,
		strings.Repeat("a", 24): true,
		"MOD":                   true,
		"MODERN":                true,
		"XMOD-Bob":              true,
		strings.Repeat("a", 25): false,
		"":                      false,
		"two words":             false,
		"ñandú":                 false,
		"under_score":           false,
		"MOD-Bob":               false,
		"mod-bob":               false,
		"Mod-":                  false,
	} {
		err := ValidateHabboName(name)
		if valid != (err == nil) {
			t.Errorf("ValidateHabboName(%q) = %v, want valid %t", name, err, valid)
		}
		if err != nil && !errors.Is(err, ErrHabboName) {
			t.Errorf("ValidateHabboName(%q) = %v, want ErrHabboName", name, err)
		}
	}
}

func TestValidateHabboNameSaysWhy(t *testing.T) {
	for name, want := range map[string]error{
		"":                      ErrHabboNameEmpty,
		strings.Repeat("a", 25): ErrHabboNameTooLong,
		"MOD-Bob":               ErrHabboNameReserved,
	} {
		if err := ValidateHabboName(name); !errors.Is(err, want) || !errors.Is(err, ErrHabboName) {
			t.Errorf("ValidateHabboName(%q) = %v, want %v matching ErrHabboName", name, err, want)
		}
	}
}

func TestValidateLook(t *testing.T) {
	for _, c := range []struct {
		figure string
		gender string
		valid  bool
	}{
		{"hd-180-1.ch-215-82.lg-270-82", "M", true},
		{"hd-180-1", "F", true},
		{"hr-505-39.ha-1001-.ea-1401-84", "F", true},
		{"hd-180-1-2.ch-215", "M", true},
		{"hd-180-1", "U", false},
		{"hd-180-1", "", false},
		{"hd-180-1", "m", false},
		{"", "M", false},
		{"hd", "M", false},
		{"hd-180-1.", "M", false},
		{"hd-180-1..ch-215-82", "M", false},
		{"HD-180-1", "M", false},
		{"hd-180-1&size=l", "M", false},
		{"1750118022210132810129003", "M", false},
		{"hd-180-1." + strings.Repeat("ch-215-82.", 25) + "lg-270-82", "M", false},
	} {
		err := ValidateLook(c.figure, c.gender)
		if c.valid != (err == nil) {
			t.Errorf("ValidateLook(%q, %q) = %v, want valid %t", c.figure, c.gender, err, c.valid)
		}
		if err != nil && !errors.Is(err, ErrLook) {
			t.Errorf("ValidateLook(%q, %q) = %v, want ErrLook", c.figure, c.gender, err)
		}
	}
}

func TestValidateEmail(t *testing.T) {
	for email, valid := range map[string]bool{
		"admin@example.com":         true,
		"a.b+c@mail.example.org":    true,
		"":                          false,
		"admin":                     false,
		"admin@":                    false,
		"Admin <admin@example.com>": false,
		"<admin@example.com>":       false,
		strings.Repeat("a", 243) + "@example.com": false,
	} {
		err := ValidateEmail(email)
		if valid != (err == nil) {
			t.Errorf("ValidateEmail(%q) = %v, want valid %t", email, err, valid)
		}
		if err != nil && !errors.Is(err, ErrEmail) {
			t.Errorf("ValidateEmail(%q) = %v, want ErrEmail", email, err)
		}
	}
}

func TestValidateBornOn(t *testing.T) {
	newFixture(t)
	for _, c := range []struct {
		bornOn time.Time
		valid  bool
	}{
		{time.Date(1900, time.January, 1, 0, 0, 0, 0, time.UTC), true},
		{testNow, true},
		{time.Date(1899, time.December, 31, 0, 0, 0, 0, time.UTC), false},
		{testNow.Add(time.Second), false},
	} {
		err := ValidateBornOn(c.bornOn)
		if c.valid != (err == nil) {
			t.Errorf("ValidateBornOn(%v) = %v, want valid %t", c.bornOn, err, c.valid)
		}
		if err != nil && !errors.Is(err, ErrBornOn) {
			t.Errorf("ValidateBornOn(%v) = %v, want ErrBornOn", c.bornOn, err)
		}
	}
}

func TestCreateAccount(t *testing.T) {
	f := newFixture(t)
	account := testAccount()

	userID, avatarID, err := CreateAccount(t.Context(), store.New(f.db), account)
	if err != nil {
		t.Fatalf("CreateAccount: %v", err)
	}

	q := store.New(f.db)
	user, err := q.GetUser(t.Context(), userID)
	if err != nil {
		t.Fatalf("GetUser: %v", err)
	}
	if user.Email != account.Email || !user.BornOn.Equal(account.BornOn) || !user.Newsletter || user.CreatedIP != account.IP || !user.CreatedAt.Equal(testNow) {
		t.Errorf("user = %+v, want the account's values, created at %v", user, testNow)
	}
	avatar, err := q.GetAvatar(t.Context(), avatarID)
	if err != nil {
		t.Fatalf("GetAvatar: %v", err)
	}
	if avatar.UserID != userID || avatar.Name != "Newbie" || avatar.Figure != account.Habbo.Figure || avatar.Gender != "F" {
		t.Errorf("avatar = %+v, want the account's habbo", avatar)
	}
	if _, _, err := f.login(t, "10.0.0.2", "Newbie", testPassword, false); err != nil {
		t.Errorf("Login with the new account = %v, want a session", err)
	}
}

func TestCreateHabboWritesItsRows(t *testing.T) {
	f := newFixture(t)
	userID, _ := f.habbo(t, "admin@example.com", "Admin", testPassword)

	avatarID, err := CreateHabbo(t.Context(), store.New(f.db), userID, testAccount().Habbo)
	if err != nil {
		t.Fatalf("CreateHabbo: %v", err)
	}

	if n := f.count(t, `SELECT COUNT(*) FROM avatars WHERE id = ? AND user_id = ?`, avatarID, userID); n != 1 {
		t.Errorf("%d habbos of the user with that id, want 1", n)
	}
	if n := f.count(t, `SELECT COUNT(*) FROM profiles WHERE avatar_id = ?`, avatarID); n != 1 {
		t.Errorf("%d profiles, want 1", n)
	}
	if n := f.count(t, `SELECT COUNT(*) FROM homes JOIN profiles ON homes.profile_id = profiles.id WHERE avatar_id = ?`, avatarID); n != 1 {
		t.Errorf("%d homes, want 1", n)
	}
	if n := f.count(t, `SELECT COUNT(*) FROM wallets WHERE avatar_id = ? AND credits = 500`, avatarID); n != 1 {
		t.Errorf("%d wallets with 500 credits, want 1", n)
	}
	if n := f.count(t, `SELECT COUNT(*) FROM wallet_transactions WHERE avatar_id = ? AND credits = 500 AND reason = 'registration' AND detail = 'Welcome!'`, avatarID); n != 1 {
		t.Errorf("%d ledger rows, want 1", n)
	}
}

func TestCreateHabboWithoutCreditsWritesNoLedgerRow(t *testing.T) {
	f := newFixture(t)
	userID, _ := f.habbo(t, "admin@example.com", "Admin", testPassword)
	habbo := testAccount().Habbo
	habbo.Credits = 0

	avatarID, err := CreateHabbo(t.Context(), store.New(f.db), userID, habbo)
	if err != nil {
		t.Fatalf("CreateHabbo: %v", err)
	}
	if n := f.count(t, `SELECT COUNT(*) FROM wallets WHERE avatar_id = ? AND credits = 0`, avatarID); n != 1 {
		t.Errorf("%d empty wallets, want 1", n)
	}
	if n := f.count(t, `SELECT COUNT(*) FROM wallet_transactions`); n != 0 {
		t.Errorf("%d ledger rows, want none", n)
	}
}

func TestCreateAccountTakenValuesConflict(t *testing.T) {
	f := newFixture(t)
	f.habbo(t, "admin@example.com", "Admin", testPassword)

	for name, change := range map[string]func(*Account){
		"email ignoring case": func(a *Account) { a.Email = "ADMIN@example.com" },
		"name ignoring case":  func(a *Account) { a.Habbo.Name = "ADMIN" },
	} {
		account := testAccount()
		change(&account)
		tx, err := f.db.BeginTx(t.Context(), nil)
		if err != nil {
			t.Fatalf("BeginTx: %v", err)
		}
		_, _, err = CreateAccount(t.Context(), store.New(tx), account)
		tx.Rollback()
		if !store.IsConflict(err) {
			t.Errorf("%s: CreateAccount() = %v, want a conflict", name, err)
		}
	}
	if n := f.count(t, `SELECT COUNT(*) FROM users`); n != 1 {
		t.Errorf("%d users after the rolled back conflicts, want 1", n)
	}
}

func TestCreateAccountJoinsTheCallersTransaction(t *testing.T) {
	f := newFixture(t)
	tx, err := f.db.BeginTx(t.Context(), nil)
	if err != nil {
		t.Fatalf("BeginTx: %v", err)
	}
	if _, _, err := CreateAccount(t.Context(), store.New(tx), testAccount()); err != nil {
		t.Fatalf("CreateAccount: %v", err)
	}
	if err := tx.Rollback(); err != nil {
		t.Fatalf("Rollback: %v", err)
	}
	for _, table := range []string{"users", "credentials", "avatars", "profiles", "homes", "wallets", "wallet_transactions"} {
		if n := f.count(t, `SELECT COUNT(*) FROM `+table); n != 0 {
			t.Errorf("%d rows left in %s after the rollback", n, table)
		}
	}
}
