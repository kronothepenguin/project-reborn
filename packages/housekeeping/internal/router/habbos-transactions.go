package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

const transactionsPerPage = 100

type transactionsPage struct {
	chrome
	HabboID      int64
	Transactions []transactionRow
	Older        int
	Newer        int
}

type transactionRow struct {
	Date        string
	Habbo       string
	Description string
	Activity    int64
}

// HandleHabboTransactionsView renders GET /housekeeping/habbos/{id}/transactions,
// Holo's Transaction Logs. The wallet is shared, so this is the ledger of the
// owner, and the rows of all their habbos.
func (r *Router) HandleHabboTransactionsView(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	avatar, ok := r.habboFromPath(w, req)
	if !ok {
		return
	}
	total, err := r.deps.Queries.CountWalletTransactions(ctx, avatar.UserID)
	if err != nil {
		r.fail(w, err)
		return
	}
	paged := pageOf(req, total, transactionsPerPage)
	rows, err := r.deps.Queries.ListWalletTransactions(ctx, store.ListWalletTransactionsParams{
		UserID:    avatar.UserID,
		RowLimit:  transactionsPerPage,
		RowOffset: paged.offset,
	})
	if err != nil {
		r.fail(w, err)
		return
	}

	page := transactionsPage{chrome: r.chrome(req), HabboID: avatar.ID, Older: paged.older, Newer: paged.newer}
	for _, row := range rows {
		page.Transactions = append(page.Transactions, transactionRow{
			Date:        row.CreatedAt.UTC().Format(dateFormat),
			Habbo:       row.Habbo.String,
			Description: keep(row.Detail, row.Reason),
			Activity:    row.Credits,
		})
	}
	astro.WriteTemplate(w, r.deps.Resolver, "habbos/id/transactions.html", page)
}
