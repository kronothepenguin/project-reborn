package cms

import (
	"database/sql"
	"html"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

type redeemed struct {
	Credits int64  `json:"credits"`
	Message string `json:"message"`
}

func makeVoucher(t *testing.T, db *sql.DB, code string, credits int64) {
	t.Helper()
	if err := store.New(db).CreateVoucher(t.Context(), store.CreateVoucherParams{Code: code, Credits: credits, CreatedAt: testNow}); err != nil {
		t.Fatalf("CreateVoucher %s: %v", code, err)
	}
}

func redeem(mux *http.ServeMux, cookie *http.Cookie, code string) *httptest.ResponseRecorder {
	return edit(mux, cookie, "/credits/vouchers", map[string]string{"code": code})
}

func wantRedeemed(t *testing.T, rec *httptest.ResponseRecorder, status int, credits int64, message string) {
	t.Helper()
	if rec.Code != status {
		t.Fatalf("POST /credits/vouchers = %d, want %d: %s", rec.Code, status, rec.Body)
	}
	if got := decode[redeemed](t, rec); got != (redeemed{Credits: credits, Message: message}) {
		t.Errorf("the answer = %+v, want %d credits and %q", got, credits, message)
	}
}

func TestTheCreditsPageShowsHolosBoxesToGuests(t *testing.T) {
	db, mux := newSite(t)
	wantPage(t, serve(mux, "GET", "/credits", nil, nil), http.StatusOK,
		"credits.html {", "SignedIn:false", "Credits:0",
		html.EscapeString("Box1Heading:What are credits? Box1Body:Credits are the hotel&#39;s currency."),
		html.EscapeString("Box2Heading:Get credits! Box2Body:To buy furniture or play games, you need <strong>credits</strong>."),
		html.EscapeString("earn more credits:<br />\n* Refer a friend to the hotel and earn credits<br />\n* Ask a staff member ingame"),
	)

	setSetting(t, db, "creditsPage.box1Heading", "Money")
	setSetting(t, db, "creditsPage.box1Body", "[i]Coins[/i] :)\n<b>")
	setSetting(t, db, "creditsPage.box2Heading", "Earn <them>")
	wantPage(t, serve(mux, "GET", "/credits", nil, nil), http.StatusOK,
		html.EscapeString("Box1Heading:Money Box1Body:<em>Coins</em> :)<br />\n&lt;b&gt; Box2Heading:Earn <them> Box2Body:"))
}

func TestTheCreditsPageShowsTheSharedPurse(t *testing.T) {
	db, mux, cookie, userID := buyer(t, 120)
	secondHabbo(t, db, userID, "FrankToo")
	wantPage(t, serve(mux, "GET", "/credits", cookie, nil), http.StatusOK, "credits.html {", "SignedIn:true", "Habbo:Frank", "Credits:120 ")
	wantPage(t, serve(mux, "GET", "/credits", login(t, db, "FrankToo"), nil), http.StatusOK, "Habbo:FrankToo", "Credits:120 ")
}

func TestTheCreditsPageClosesForMaintenance(t *testing.T) {
	db, mux := newSite(t)
	setMaintenance(t, db, true)
	wantPage(t, serve(mux, "GET", "/credits", nil, nil), http.StatusServiceUnavailable, "maintenance.html")
}

func TestRedeemingAVoucherFillsThePurseAndTheLedger(t *testing.T) {
	db, mux, _, userID := buyer(t, 10)
	secondHabbo(t, db, userID, "FrankToo")
	makeVoucher(t, db, "abcd1234", 50)

	wantRedeemed(t, redeem(mux, login(t, db, "FrankToo"), "abcd1234"), http.StatusOK, 60, "You have redeemed 50 credits successfully.")
	if got := walletOf(t, db, userID); got != 60 {
		t.Errorf("the purse holds %d, want 10 + 50", got)
	}
	q := store.New(db)
	ledger, err := q.ListWalletTransactions(t.Context(), store.ListWalletTransactionsParams{UserID: userID, RowLimit: 10})
	if err != nil {
		t.Fatal(err)
	}
	if len(ledger) != 1 || ledger[0].Credits != 50 || ledger[0].Reason != "voucher" || ledger[0].Detail != "Credit voucher redeem" || ledger[0].Habbo.String != "FrankToo" {
		t.Errorf("the ledger = %+v, want one row of 50 for the active habbo", ledger)
	}
	var by sql.NullInt64
	var at sql.NullTime
	if err := db.QueryRowContext(t.Context(), `SELECT redeemed_by_avatar_id, redeemed_at FROM vouchers WHERE code = 'abcd1234'`).Scan(&by, &at); err != nil {
		t.Fatal(err)
	}
	if by.Int64 != avatarID(t, db, "FrankToo") || !at.Valid {
		t.Errorf("the voucher was redeemed by %v at %v, want the active habbo, now", by, at)
	}
	if n := countRows(t, db, `SELECT COUNT(*) FROM vouchers`); n != 1 {
		t.Errorf("%d vouchers are left, want the redeemed one kept", n)
	}
}

func TestAVoucherRedeemsOnce(t *testing.T) {
	db, mux, cookie, userID := buyer(t, 10)
	makeVoucher(t, db, "abcd1234", 50)

	wantRedeemed(t, redeem(mux, cookie, "abcd1234"), http.StatusOK, 60, "You have redeemed 50 credits successfully.")
	wantRedeemed(t, redeem(mux, cookie, "abcd1234"), http.StatusUnprocessableEntity, 60, "Your redeem code could not be found. Please try again.")
	if got := walletOf(t, db, userID); got != 60 {
		t.Errorf("the purse holds %d, want the voucher's 50 once", got)
	}
	if n := countRows(t, db, `SELECT COUNT(*) FROM wallet_transactions WHERE user_id = ?`, userID); n != 1 {
		t.Errorf("%d ledger rows, want 1", n)
	}
}

func TestAVoucherIsFoundAsMySQLFoundHolos(t *testing.T) {
	for _, c := range []struct {
		name, typed string
		found       bool
	}{
		{"in other case", "ABCD1234", true},
		{"with spaces after it", "AbCd1234  ", true},
		{"with a space before it", " abcd1234", false},
		{"with a tab after it", "abcd1234\t", false},
		{"blank", "", false},
		{"unknown", "wxyz9876", false},
	} {
		t.Run(c.name, func(t *testing.T) {
			db, mux, cookie, userID := buyer(t, 10)
			makeVoucher(t, db, "abcd1234", 50)

			if c.found {
				wantRedeemed(t, redeem(mux, cookie, c.typed), http.StatusOK, 60, "You have redeemed 50 credits successfully.")
				return
			}
			wantRedeemed(t, redeem(mux, cookie, c.typed), http.StatusUnprocessableEntity, 10, "Your redeem code could not be found. Please try again.")
			if n := countRows(t, db, `SELECT COUNT(*) FROM wallet_transactions WHERE user_id = ?`, userID); n != 0 {
				t.Errorf("%d ledger rows, want none", n)
			}
			if n := countRows(t, db, `SELECT COUNT(*) FROM vouchers WHERE redeemed_at IS NULL`); n != 1 {
				t.Error("the voucher was redeemed")
			}
		})
	}
}

func TestOnlyASignedInHabboRedeems(t *testing.T) {
	db, mux, cookie, userID := buyer(t, 10)
	makeVoucher(t, db, "abcd1234", 50)

	if rec := redeem(mux, nil, "abcd1234"); rec.Code != http.StatusUnauthorized {
		t.Errorf("a guest's redemption = %d, want 401", rec.Code)
	}
	r := httptest.NewRequest("POST", "/credits/vouchers", strings.NewReader(`{"code":"abcd1234"}`))
	r.Header.Set("Content-Type", "application/json")
	r.Header.Set("Accept", "application/json")
	r.Header.Set("Sec-Fetch-Site", "cross-site")
	r.AddCookie(cookie)
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, r)
	if rec.Code != http.StatusForbidden {
		t.Errorf("a cross-site redemption = %d, want 403", rec.Code)
	}
	if got := walletOf(t, db, userID); got != 10 {
		t.Errorf("the purse holds %d, want 10", got)
	}
	if n := countRows(t, db, `SELECT COUNT(*) FROM vouchers WHERE redeemed_at IS NULL`); n != 1 {
		t.Error("the voucher was redeemed")
	}
}
