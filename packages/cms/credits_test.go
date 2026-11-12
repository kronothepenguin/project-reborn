package cms

import (
	"database/sql"
	"fmt"
	"html"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

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

func ledgerRow(t *testing.T, db *sql.DB, userID int64, habbo string, credits int64, reason, detail string, at time.Time) {
	t.Helper()
	var avatar sql.NullInt64
	if habbo != "" {
		avatar = sql.NullInt64{Int64: avatarID(t, db, habbo), Valid: true}
	}
	err := store.New(db).CreateWalletTransaction(t.Context(), store.CreateWalletTransactionParams{
		UserID: userID, AvatarID: avatar, Credits: credits, Reason: reason, Detail: detail, CreatedAt: at,
	})
	if err != nil {
		t.Fatalf("CreateWalletTransaction: %v", err)
	}
}

func TestTheTransactionsListTheSharedLedger(t *testing.T) {
	db, mux, cookie, userID := buyer(t, 75)
	secondHabbo(t, db, userID, "FrankToo")
	other := habbo(t, db, "dora@example.com", "Dora")
	ledgerRow(t, db, userID, "Frank", 500, "registration", "Welcome to Holo Hotel!", testNow)
	ledgerRow(t, db, other, "Dora", 30, "staff", "Housekeeping transfer/refund", testNow.Add(time.Minute))
	ledgerRow(t, db, userID, "FrankToo", -20, "group", "Group purchase", testNow.Add(time.Hour+2*time.Second))
	ledgerRow(t, db, userID, "", 50, "staff", "", testNow.Add(24*time.Hour))
	if _, err := db.ExecContext(t.Context(), `UPDATE avatars SET archived_at = ? WHERE name = 'FrankToo'`, testNow); err != nil {
		t.Fatal(err)
	}

	wantPage(t, serve(mux, "GET", "/credits/transactions", cookie, nil), http.StatusOK,
		"credits/transactions.html {", "Habbo:Frank", "Credits:75 ",
		"Transactions:[{Date:28-10-2026 21:00:00 Activity:50 Description:staff Habbo: Odd:true}"+
			" {Date:27-10-2026 22:00:02 Activity:-20 Description:Group purchase Habbo:FrankToo Odd:false}"+
			" {Date:27-10-2026 21:00:00 Activity:500 Description:Welcome to Holo Hotel! Habbo:Frank Odd:true}]}")
}

func TestTheTransactionsShowTheFiftyNewest(t *testing.T) {
	db, mux, cookie, userID := buyer(t, 0)
	for i := range 51 {
		ledgerRow(t, db, userID, "Frank", 1, "staff", fmt.Sprintf("Row %02d", i), testNow)
	}
	rec := serve(mux, "GET", "/credits/transactions", cookie, nil)
	wantPage(t, rec, http.StatusOK, "Transactions:[{Date:27-10-2026 21:00:00 Activity:1 Description:Row 50 ", "Description:Row 01 ")
	if n := strings.Count(rec.Body.String(), "Description:Row "); n != 50 || strings.Contains(rec.Body.String(), "Row 00") {
		t.Errorf("the page lists %d rows, want the 50 newest", n)
	}
}

func TestTheTransactionsWaitForASignIn(t *testing.T) {
	_, mux := newSite(t)
	wantRedirect(t, serve(mux, "GET", "/credits/transactions", nil, nil), "/")
}

// An item voucher puts its furni in the active habbo's hand, as a purchase gives it: a teleport as a pair that name
// each other, a pad of post-its with its 20 notes. The purse keeps its credits, and the ledger gets a row of 0
// (plans/server decisions 0121 and 0125).
func TestRedeemingAnItemVoucherFillsTheHand(t *testing.T) {
	db, mux, _, userID := buyer(t, 10)
	secondHabbo(t, db, userID, "FrankToo")
	q := store.New(db)
	for code, sprite := range map[string]string{"throne": "throne", "beam": "door", "notes": "post.it", "box": "present_gen1"} {
		item, err := q.GetFurniDefinitionBySprite(t.Context(), sprite)
		if err != nil {
			t.Fatal(err)
		}
		err = q.CreateVoucher(t.Context(), store.CreateVoucherParams{Code: code, FurniDefinitionID: sql.NullInt64{Int64: item.ID, Valid: true}, CreatedAt: testNow})
		if err != nil {
			t.Fatal(err)
		}
	}
	cookie := login(t, db, "FrankToo")
	for _, code := range []string{"throne", "BEAM", "notes", "box"} {
		wantRedeemed(t, redeem(mux, cookie, code), http.StatusOK, 10, "You have redeemed this item of furniture successfully.")
	}
	wantRedeemed(t, redeem(mux, cookie, "throne"), http.StatusUnprocessableEntity, 10, "Your redeem code could not be found. Please try again.")

	hand, err := q.ListHandFurni(t.Context(), store.ListHandFurniParams{AvatarID: avatarID(t, db, "FrankToo"), PageSize: 10})
	if err != nil {
		t.Fatal(err)
	}
	if len(hand) != 5 {
		t.Fatalf("the hand holds %d furni, want a throne, two teleports, a pad and a box: %+v", len(hand), hand)
	}
	throne, first, second, pad := hand[0], hand[1], hand[2], hand[3]
	if throne.FurniDefinitionID != 1152 || throne.UserID != userID || throne.State != "" {
		t.Errorf("the throne = %+v, want the furni 1152 of the user", throne)
	}
	if first.PartnerFurniID.Int64 != second.ID || second.PartnerFurniID.Int64 != first.ID || first.FurniDefinitionID != second.FurniDefinitionID {
		t.Errorf("the teleports %+v and %+v do not name each other", first, second)
	}
	if pad.State != "20" {
		t.Errorf("the pad of post-its holds %q notes, want 20", pad.State)
	}
	if got := walletOf(t, db, userID); got != 10 {
		t.Errorf("the purse holds %d, want its 10 untouched", got)
	}
	ledger, err := q.ListWalletTransactions(t.Context(), store.ListWalletTransactionsParams{UserID: userID, RowLimit: 10})
	if err != nil {
		t.Fatal(err)
	}
	details := map[string]bool{}
	for _, row := range ledger {
		if row.Credits != 0 || row.Reason != "voucher" || row.Habbo.String != "FrankToo" {
			t.Errorf("the ledger row %+v, want 0 credits by the active habbo", row)
		}
		details[row.Detail] = true
	}
	// A present box is sold by no item, so it goes by its sprite.
	for _, want := range []string{"Item voucher redeem (Throne)", "Item voucher redeem (Telephone Box)", "Item voucher redeem (present_gen1)"} {
		if !details[want] {
			t.Errorf("the ledger lacks %q: %+v", want, ledger)
		}
	}
	if len(ledger) != 4 {
		t.Errorf("the ledger holds %d rows, want one for each voucher", len(ledger))
	}
}
