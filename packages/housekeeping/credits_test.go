package housekeeping

import (
	"database/sql"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

func creditsURL(id int64) string {
	return fmt.Sprintf("/housekeeping/habbos/%d/credits", id)
}

func transactionsURL(id int64) string {
	return fmt.Sprintf("/housekeeping/habbos/%d/transactions", id)
}

func cashier(t *testing.T, db *sql.DB) (int64, *http.Cookie) {
	t.Helper()
	return ranked(t, db, "Cashier", 4, auth.HousekeepingAccess, auth.HousekeepingUsers, auth.HousekeepingCredits)
}

func creditsOf(t *testing.T, db *sql.DB, userID int64) int64 {
	t.Helper()
	wallet, err := store.New(db).GetWallet(t.Context(), userID)
	if err != nil {
		t.Fatalf("GetWallet: %v", err)
	}
	return wallet.Credits
}

func ledgerLength(t *testing.T, db *sql.DB, userID int64) int64 {
	t.Helper()
	n, err := store.New(db).CountWalletTransactions(t.Context(), userID)
	if err != nil {
		t.Fatalf("CountWalletTransactions: %v", err)
	}
	return n
}

func TestCreditsTakeTheAttribute(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := ranked(t, db, "Reader", 4, auth.HousekeepingAccess, auth.HousekeepingUsers)
	userID := habbo(t, db, "frank@example.com", "Frank")
	id := habboOf(t, db, "Frank").ID

	wantPage(t, serve(mux, "POST", creditsURL(id), cookie, url.Values{"amount": {"100"}}), http.StatusForbidden, "access-denied.html")
	wantPage(t, serve(mux, "GET", transactionsURL(id), cookie, nil), http.StatusForbidden, "access-denied.html")
	if got := creditsOf(t, db, userID); got != 0 {
		t.Errorf("credits = %d", got)
	}
}

func TestGivingCreditsWritesTheLedgerAndTheLog(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := cashier(t, db)
	userID := habbo(t, db, "frank@example.com", "Frank")
	id := habboOf(t, db, "Frank").ID

	wantRedirect(t, serve(mux, "POST", creditsURL(id), cookie, url.Values{"amount": {"100"}}), habboURL(id)+"?gave=100")
	wantPage(t, serve(mux, "GET", habboURL(id)+"?gave=100", cookie, nil), http.StatusOK, "Gave user Frank 100 credits.", "Credits:100")

	if got := creditsOf(t, db, userID); got != 100 {
		t.Errorf("credits = %d", got)
	}
	rows, err := store.New(db).ListWalletTransactions(t.Context(), store.ListWalletTransactionsParams{UserID: userID, RowLimit: 10})
	if err != nil {
		t.Fatalf("ListWalletTransactions: %v", err)
	}
	if len(rows) != 1 || rows[0].Credits != 100 || rows[0].Reason != "staff" || rows[0].Detail != "Housekeeping transfer/refund" || rows[0].Habbo.String != "Frank" {
		t.Errorf("ledger = %+v", rows)
	}
	wantOneLog(t, db, "credits.give", "100", userID, id)
}

func TestTakingCreditsStopsAtZero(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := cashier(t, db)
	userID := habbo(t, db, "frank@example.com", "Frank")
	id := habboOf(t, db, "Frank").ID
	serve(mux, "POST", creditsURL(id), cookie, url.Values{"amount": {"100"}})

	wantRedirect(t, serve(mux, "POST", creditsURL(id), cookie, url.Values{"amount": {"-30"}}), habboURL(id)+"?gave=-30")
	if got := creditsOf(t, db, userID); got != 70 {
		t.Errorf("credits = %d", got)
	}

	rec := serve(mux, "POST", creditsURL(id), cookie, url.Values{"amount": {"-71"}})
	wantPage(t, rec, http.StatusUnprocessableEntity, "habbos/id.html", "Amount is not valid or this user does not exist!")
	if got := creditsOf(t, db, userID); got != 70 {
		t.Errorf("credits = %d", got)
	}
	if got := ledgerLength(t, db, userID); got != 2 {
		t.Errorf("%d ledger rows, want 2", got)
	}
	if rows := logsOf(t, db, "credits.give"); len(rows) != 2 {
		t.Errorf("%d log rows, want 2", len(rows))
	}

	wantRedirect(t, serve(mux, "POST", creditsURL(id), cookie, url.Values{"amount": {"-70"}}), habboURL(id)+"?gave=-70")
	if got := creditsOf(t, db, userID); got != 0 {
		t.Errorf("credits = %d", got)
	}
}

func TestABadAmountIsRefused(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := cashier(t, db)
	userID := habbo(t, db, "frank@example.com", "Frank")
	id := habboOf(t, db, "Frank").ID

	for _, amount := range []string{"", "many", "1.5", "1e3", "0x10", "2147483648", "-2147483648", "9223372036854775807"} {
		rec := serve(mux, "POST", creditsURL(id), cookie, url.Values{"amount": {amount}})
		wantPage(t, rec, http.StatusUnprocessableEntity, "Amount is not valid or this user does not exist!")
	}
	if got := ledgerLength(t, db, userID); got != 0 {
		t.Errorf("%d ledger rows", got)
	}
	wantRedirect(t, serve(mux, "POST", creditsURL(id), cookie, url.Values{"amount": {"2147483647"}}), habboURL(id)+"?gave=2147483647")
	wantRedirect(t, serve(mux, "POST", creditsURL(id), cookie, url.Values{"amount": {"2147483647"}}), habboURL(id)+"?gave=2147483647")

	// The wallet could pay this, so only the limit refuses it.
	rec := serve(mux, "POST", creditsURL(id), cookie, url.Values{"amount": {"-2147483648"}})
	wantPage(t, rec, http.StatusUnprocessableEntity, "Amount is not valid or this user does not exist!")
	if got := creditsOf(t, db, userID); got != 2*2147483647 {
		t.Errorf("credits = %d", got)
	}
}

func TestStaffGiveCreditsOnlyToUsersBelowThem(t *testing.T) {
	db, mux := newSite(t)
	actor, cookie := cashier(t, db)
	peer, _ := ranked(t, db, "Peer", 4)
	lower, _ := ranked(t, db, "Lower", 3)

	rec := serve(mux, "POST", creditsURL(habboOf(t, db, "Peer").ID), cookie, url.Values{"amount": {"100"}})
	wantPage(t, rec, http.StatusUnprocessableEntity, "below your level")
	rec = serve(mux, "POST", creditsURL(habboOf(t, db, "Cashier").ID), cookie, url.Values{"amount": {"100"}})
	wantPage(t, rec, http.StatusUnprocessableEntity, "below your level")
	if creditsOf(t, db, peer) != 0 || creditsOf(t, db, actor) != 0 {
		t.Error("credits moved for someone not below the actor")
	}
	if rows := logsOf(t, db, "users.refused"); len(rows) != 2 {
		t.Errorf("%d refusals logged, want 2", len(rows))
	}

	id := habboOf(t, db, "Lower").ID
	wantRedirect(t, serve(mux, "POST", creditsURL(id), cookie, url.Values{"amount": {"100"}}), habboURL(id)+"?gave=100")
	if got := creditsOf(t, db, lower); got != 100 {
		t.Errorf("credits = %d", got)
	}
}

func TestTheLedgerIsTheUsersAndKeepsTheHabbo(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := cashier(t, db)
	userID := habbo(t, db, "frank@example.com", "Frank")
	first := habboOf(t, db, "Frank").ID
	second := secondHabbo(t, db, userID, "FrankToo").ID
	otherUser := habbo(t, db, "other@example.com", "Other")
	serve(mux, "POST", creditsURL(first), cookie, url.Values{"amount": {"10"}})
	serve(mux, "POST", creditsURL(second), cookie, url.Values{"amount": {"20"}})
	serve(mux, "POST", creditsURL(habboOf(t, db, "Other").ID), cookie, url.Values{"amount": {"40"}})

	if got := creditsOf(t, db, userID); got != 30 {
		t.Errorf("the shared wallet holds %d", got)
	}
	if got := creditsOf(t, db, otherUser); got != 40 {
		t.Errorf("the other wallet holds %d", got)
	}

	rec := serve(mux, "GET", transactionsURL(first), cookie, nil)
	wantPage(t, rec, http.StatusOK, "habbos/id/transactions.html", "Habbo:FrankToo Description:Housekeeping transfer/refund Activity:20", "Habbo:Frank Description:Housekeeping transfer/refund Activity:10")
	body := rec.Body.String()
	if strings.Contains(body, "Activity:40") {
		t.Error("the ledger shows another user's rows")
	}
	if strings.Index(body, "Activity:20") > strings.Index(body, "Activity:10") {
		t.Error("the newest row does not come first")
	}
}

func TestTheLedgerComesInPages(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := cashier(t, db)
	userID := habbo(t, db, "frank@example.com", "Frank")
	id := habboOf(t, db, "Frank").ID
	q := store.New(db)
	for i := range 101 {
		err := q.CreateWalletTransaction(t.Context(), store.CreateWalletTransactionParams{UserID: userID, Credits: int64(i + 1000), Reason: "staff", CreatedAt: testNow})
		if err != nil {
			t.Fatalf("CreateWalletTransaction: %v", err)
		}
	}

	wantPage(t, serve(mux, "GET", transactionsURL(id), cookie, nil), http.StatusOK, "Older:2 Newer:0", "Activity:1100")
	rec := serve(mux, "GET", transactionsURL(id)+"?page=2", cookie, nil)
	wantPage(t, rec, http.StatusOK, "Older:0 Newer:1", "Description:staff Activity:1000")
	if strings.Contains(rec.Body.String(), "Activity:1100") {
		t.Error("the second page repeats the first")
	}
}

func TestAHabboWithoutTransactionsHasAnEmptyLedger(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := cashier(t, db)
	habbo(t, db, "frank@example.com", "Frank")

	wantPage(t, serve(mux, "GET", transactionsURL(habboOf(t, db, "Frank").ID), cookie, nil), http.StatusOK, "Transactions:[]")
	wantPage(t, serve(mux, "GET", transactionsURL(999), cookie, nil), http.StatusNotFound)
}

func TestAMessageShowsOnlyAnAmount(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := cashier(t, db)
	habbo(t, db, "frank@example.com", "Frank")

	rec := serve(mux, "GET", habboURL(habboOf(t, db, "Frank").ID)+"?gave=lots", cookie, nil)
	wantPage(t, rec, http.StatusOK, "habbos/id.html")
	if strings.Contains(rec.Body.String(), "Gave user") {
		t.Error("the message accepts text that is no amount")
	}
}
