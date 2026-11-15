package router

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

// HandleVoucherDelete handles POST /housekeeping/vouchers/{code}/delete, which Holo
// did not have: an unused voucher goes, and a redeemed one stays for audit.
func (r *Router) HandleVoucherDelete(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	code := req.PathValue("code")
	deleted := false
	err := r.inTx(ctx, func(q *store.Queries) error {
		removed, err := q.DeleteUnusedVoucher(ctx, code)
		if err != nil || removed == 0 {
			return err
		}
		deleted = true
		return writeLog(req, q, staffLog{action: actionVouchersDelete, detail: "Deleted voucher " + code})
	})
	switch {
	case err != nil:
		r.fail(w, err)
	case !deleted:
		r.refuseVoucher(w, req, http.StatusNotFound, voucherForm{Code: randomVoucher(), Type: voucherTypeCredits}, voucherMissing)
	default:
		http.Redirect(w, req, "/housekeeping/vouchers?deleted=1", http.StatusSeeOther)
	}
}
