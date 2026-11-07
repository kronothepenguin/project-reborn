package router

import (
	"crypto/rand"
	"database/sql"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

// Holo's texts. It checked only for blank fields and could not delete a voucher,
// so the other answers follow the words of its page.
const (
	voucherCreated        = "The voucher has been created successfully."
	voucherBlank          = "Please do not leave any fields blank."
	voucherCodeTooLong    = "The redemption code must be at most 20 characters."
	voucherCreditsInvalid = "The amount must be a number from 1 to 2147483647."
	voucherCodeTaken      = "A voucher with this redemption code already exists."
	voucherDeleted        = "The voucher has been deleted successfully."
	voucherMissing        = "Unable to delete voucher; this voucher does not exist or has been redeemed!"
)

const (
	// voucherLength is the length of Holo's random code.
	voucherLength = 8
	// maxVoucherCode is the length of Holo's column.
	maxVoucherCode = 20
)

// voucherCharacters are Holo's, which leave out c and repeat the digits, so that a
// digit comes up twice as often as a letter.
const voucherCharacters = "1234567890abdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ"

// randomVoucher draws Holo's code from crypto/rand, because a code is worth credits
// to whoever types it. A byte from 213 up is drawn again: 213 is the largest
// multiple of the 71 characters that a byte reaches, so every place in the string
// stays as likely as the others.
func randomVoucher() string {
	const limit = 256 / len(voucherCharacters) * len(voucherCharacters)
	code := make([]byte, 0, voucherLength)
	draw := make([]byte, 1)
	for len(code) < voucherLength {
		rand.Read(draw)
		if int(draw[0]) < limit {
			code = append(code, voucherCharacters[int(draw[0])%len(voucherCharacters)])
		}
	}
	return string(code)
}

// voucherCredits takes what Give Credits takes, above zero, because a redemption
// adds the credits to a wallet.
func voucherCredits(posted string) (int64, bool) {
	credits, err := strconv.ParseInt(posted, 10, 64)
	return credits, err == nil && credits >= 1 && credits <= maxWalletAmount
}

// voucherForm is Create Voucher as it was typed.
type voucherForm struct {
	Code    string
	Credits string
}

type vouchersPage struct {
	chrome
	Form     voucherForm
	Vouchers []voucherRow
	Message  string
	Error    string
}

// voucherRow is an unused voucher. Path is its code as one segment of an address,
// because a code may hold a slash, a question mark or a space.
type voucherRow struct {
	Code    string
	Credits int64
	Path    string
}

func (r *Router) newVouchersPage(req *http.Request, form voucherForm) (vouchersPage, error) {
	page := vouchersPage{chrome: r.chrome(req), Form: form}
	vouchers, err := r.deps.Queries.ListUnusedVouchers(req.Context())
	if err != nil {
		return page, err
	}
	for _, voucher := range vouchers {
		page.Vouchers = append(page.Vouchers, voucherRow{
			Code:    voucher.Code,
			Credits: voucher.Credits,
			Path:    url.PathEscape(voucher.Code),
		})
	}
	return page, nil
}

// HandleVouchersView renders GET /housekeeping/vouchers, Holo's Vouchers page:
// Create Voucher with a new random code, then the vouchers not redeemed yet.
func (r *Router) HandleVouchersView(w http.ResponseWriter, req *http.Request) {
	page, err := r.newVouchersPage(req, voucherForm{Code: randomVoucher()})
	if err != nil {
		r.fail(w, err)
		return
	}
	switch query := req.URL.Query(); {
	case query.Has("created"):
		page.Message = voucherCreated
	case query.Has("deleted"):
		page.Message = voucherDeleted
	}
	astro.WriteTemplate(w, r.deps.Resolver, "vouchers.html", page)
}

func (r *Router) refuseVoucher(w http.ResponseWriter, req *http.Request, status int, form voucherForm, message string) {
	page, err := r.newVouchersPage(req, form)
	if err != nil {
		r.fail(w, err)
		return
	}
	page.Error = message
	w.WriteHeader(status)
	astro.WriteTemplate(w, r.deps.Resolver, "vouchers.html", page)
}

// HandleVouchersCreate handles POST /housekeeping/vouchers, Holo's Create Voucher,
// whose vouchers give credits alone. Holo took any amount, and a taken code stopped
// the page with MySQL's error.
func (r *Router) HandleVouchersCreate(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	form := voucherForm{
		Code:    strings.TrimSpace(req.PostFormValue("voucher")),
		Credits: req.PostFormValue("credits"),
	}
	refuse := func(message string) {
		r.refuseVoucher(w, req, http.StatusUnprocessableEntity, form, message)
	}
	if form.Code == "" || form.Credits == "" {
		refuse(voucherBlank)
		return
	}
	if utf8.RuneCountInString(form.Code) > maxVoucherCode {
		refuse(voucherCodeTooLong)
		return
	}
	credits, ok := voucherCredits(form.Credits)
	if !ok {
		refuse(voucherCreditsInvalid)
		return
	}

	session, _ := auth.FromContext(ctx)
	err := r.inTx(ctx, func(q *store.Queries) error {
		err := q.CreateVoucher(ctx, store.CreateVoucherParams{
			Code:            form.Code,
			Credits:         credits,
			CreatedByUserID: sql.NullInt64{Int64: session.UserID, Valid: true},
			CreatedAt:       time.Now().UTC(),
		})
		if err != nil {
			return err
		}
		return writeLog(req, q, staffLog{
			action: actionVouchersCreate,
			detail: fmt.Sprintf("Created voucher %s worth %d credits", form.Code, credits),
		})
	})
	switch {
	case store.IsConflict(err):
		refuse(voucherCodeTaken)
	case err != nil:
		r.fail(w, err)
	default:
		http.Redirect(w, req, "/housekeeping/vouchers?created=1", http.StatusSeeOther)
	}
}

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
		r.refuseVoucher(w, req, http.StatusNotFound, voucherForm{Code: randomVoucher()}, voucherMissing)
	default:
		http.Redirect(w, req, "/housekeeping/vouchers?deleted=1", http.StatusSeeOther)
	}
}
