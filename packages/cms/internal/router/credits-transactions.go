package router

import (
	"cmp"
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// transactionsShown is the limit of transactions.php, which had no pages.
const transactionsShown = 50

// transactionsPage is transactions.php: the ledger's table, and the purse in the
// second column.
type transactionsPage struct {
	community
	Credits      int64
	Transactions []transactionRow
}

// transactionRow is a row of Holo's table, with the habbo that acted, blank when
// none did (0104). Odd is Holo's grey row, the first and every other.
type transactionRow struct {
	Date        string
	Activity    int64
	Description string
	Habbo       string
	Odd         bool
}

// HandleCreditsTransactionsView handles GET /credits/transactions,
// transactions.php: the newest rows of the ledger of the purse that all the
// user's habbos share. A row reads as housekeeping's transaction log reads it,
// its detail or else its reason.
func (r *Router) HandleCreditsTransactionsView(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	shared, err := r.community(ctx)
	if err != nil {
		r.fail(w, err)
		return
	}
	session, _ := auth.FromContext(ctx)
	wallet, err := r.deps.Queries.GetWallet(ctx, session.UserID)
	if err != nil {
		r.fail(w, err)
		return
	}
	rows, err := r.deps.Queries.ListWalletTransactions(ctx, store.ListWalletTransactionsParams{UserID: session.UserID, RowLimit: transactionsShown})
	if err != nil {
		r.fail(w, err)
		return
	}
	page := transactionsPage{community: shared, Credits: wallet.Credits}
	for i, row := range rows {
		page.Transactions = append(page.Transactions, transactionRow{
			Date:        row.CreatedAt.UTC().Format(dateFull),
			Activity:    row.Credits,
			Description: cmp.Or(row.Detail, row.Reason),
			Habbo:       row.Habbo.String,
			Odd:         i%2 == 0,
		})
	}
	astro.WriteTemplate(w, r.deps.Resolver, "credits/transactions.html", page)
}
