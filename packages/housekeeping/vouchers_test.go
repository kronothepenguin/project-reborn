package housekeeping

import (
	"database/sql"
	"maps"
	"net/http"
	"net/url"
	"regexp"
	"slices"
	"strings"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

const (
	voucherCreated        = "The voucher has been created successfully."
	voucherBlank          = "Please do not leave any fields blank."
	voucherCodeTooLong    = "The redemption code must be at most 20 characters."
	voucherCodeDots       = "The redemption code cannot be . or .."
	voucherCreditsInvalid = "The amount must be a number from 1 to 2147483647."
	voucherCodeTaken      = "A voucher with this redemption code already exists."
	voucherDeleted        = "The voucher has been deleted successfully."
	voucherMissing        = "Unable to delete voucher; this voucher does not exist or has been redeemed!"
	voucherItemUnknown    = "Unable to create voucher; this item does not exist!"
	voucherItemDecoration = "Unable to create voucher; wallpapers, floors and landscapes cannot be given by a voucher!"
)

// randomCode reads the code that Create Voucher offers: 8 of Holo's characters,
// which leave out c.
var randomCode = regexp.MustCompile(`Form:\{Code:([0-9abd-zA-Z]{8}) Credits: Type:credits\}`)

func treasurer(t *testing.T, db *sql.DB) (int64, *http.Cookie) {
	t.Helper()
	return staff(t, db, "Treasurer", auth.HousekeepingAccess, auth.HousekeepingVouchers)
}

func voucherForm(code, credits string) url.Values {
	return url.Values{"voucher": {code}, "credits": {credits}}
}

func voucherDeleteURL(code string) string {
	return "/housekeeping/vouchers/" + url.PathEscape(code) + "/delete"
}

func addVoucher(t *testing.T, db *sql.DB, code string, credits int64, at time.Time) {
	t.Helper()
	err := store.New(db).CreateVoucher(t.Context(), store.CreateVoucherParams{Code: code, Credits: credits, CreatedAt: at})
	if err != nil {
		t.Fatalf("CreateVoucher %s: %v", code, err)
	}
}

// redeemVoucher redeems code for a new habbo, as the credits page will.
func redeemVoucher(t *testing.T, db *sql.DB, code string) {
	t.Helper()
	habbo(t, db, "redeemer@example.com", "Redeemer")
	_, err := store.New(db).RedeemVoucher(t.Context(), store.RedeemVoucherParams{
		RedeemedByAvatarID: habboOf(t, db, "Redeemer").ID,
		RedeemedAt:         sql.NullTime{Time: testNow, Valid: true},
		Code:               code,
	})
	if err != nil {
		t.Fatalf("RedeemVoucher %s: %v", code, err)
	}
}

// allVouchers reads every voucher, redeemed ones too, in the order they were made.
func allVouchers(t *testing.T, db *sql.DB) []store.Voucher {
	t.Helper()
	rows, err := db.QueryContext(t.Context(), `SELECT code, credits, furni_definition_id, created_by_user_id, created_at,
		redeemed_by_avatar_id, redeemed_at FROM vouchers ORDER BY created_at, code`)
	if err != nil {
		t.Fatalf("read vouchers: %v", err)
	}
	defer rows.Close()
	var vouchers []store.Voucher
	for rows.Next() {
		var v store.Voucher
		if err := rows.Scan(&v.Code, &v.Credits, &v.FurniDefinitionID, &v.CreatedByUserID, &v.CreatedAt, &v.RedeemedByAvatarID, &v.RedeemedAt); err != nil {
			t.Fatalf("scan voucher: %v", err)
		}
		vouchers = append(vouchers, v)
	}
	if err := rows.Err(); err != nil {
		t.Fatalf("read vouchers: %v", err)
	}
	return vouchers
}

func codesOf(vouchers []store.Voucher) []string {
	codes := make([]string, len(vouchers))
	for i, v := range vouchers {
		codes[i] = v.Code
	}
	return codes
}

func TestTheVouchersTakeTheAttribute(t *testing.T) {
	db, mux := newSite(t)
	addVoucher(t, db, "Kept", 10, testNow)
	_, cookie := staff(t, db, "Cashier", auth.HousekeepingAccess, auth.HousekeepingCredits, auth.HousekeepingUsers,
		auth.HousekeepingUsersEdit, auth.HousekeepingBanners, auth.HousekeepingSettings, auth.HousekeepingLogs)

	for _, c := range []struct {
		method string
		path   string
		form   url.Values
	}{
		{"GET", "/housekeeping/vouchers", nil},
		{"POST", "/housekeeping/vouchers", voucherForm("New", "5")},
		{"POST", voucherDeleteURL("Kept"), url.Values{}},
	} {
		wantPage(t, serve(mux, c.method, c.path, cookie, c.form), http.StatusForbidden, "access-denied.html")
	}
	if got := codesOf(allVouchers(t, db)); !slices.Equal(got, []string{"Kept"}) {
		t.Errorf("vouchers = %v, want Kept alone", got)
	}
	if rows := staffLogs(t, db); len(rows) != 0 {
		t.Errorf("%d log rows", len(rows))
	}
}

// The installer's Moderator group holds the vouchers, as Holo's rank 6 reached them.
func TestModeratorsManageVouchers(t *testing.T) {
	db, mux := newSite(t)
	userID := habbo(t, db, "mod@example.com", "Mod")
	if err := store.New(db).AddAccessGroupMember(t.Context(), store.AddAccessGroupMemberParams{AccessGroupID: 2, UserID: userID, GrantedAt: testNow}); err != nil {
		t.Fatalf("AddAccessGroupMember: %v", err)
	}
	wantPage(t, serve(mux, "GET", "/housekeeping/vouchers", login(t, db, "Mod"), nil), http.StatusOK, "vouchers.html")
}

func TestTheVouchersPageIsHolos(t *testing.T) {
	db, mux := newSite(t)
	addVoucher(t, db, "Zulu", 30, testNow)
	addVoucher(t, db, "Alpha", 10, testNow.Add(time.Minute))
	addVoucher(t, db, "Used", 40, testNow.Add(2*time.Minute))
	addVoucher(t, db, "Mike", 20, testNow.Add(3*time.Minute))
	redeemVoucher(t, db, "Used")
	_, cookie := treasurer(t, db)

	rec := serve(mux, "GET", "/housekeeping/vouchers", cookie, nil)
	wantPage(t, rec, http.StatusOK, "vouchers.html",
		"Vouchers:[{Code:Zulu Credits:30 Path:Zulu} {Code:Alpha Credits:10 Path:Alpha} {Code:Mike Credits:20 Path:Mike}] Message: Error:}")
	first := randomCode.FindStringSubmatch(rec.Body.String())
	if first == nil {
		t.Fatalf("the form offers no code of Holo's characters: %s", rec.Body)
	}
	second := randomCode.FindStringSubmatch(serve(mux, "GET", "/housekeeping/vouchers", cookie, nil).Body.String())
	if second == nil || second[1] == first[1] {
		t.Errorf("two loads offered %q and %v, want two random codes", first[1], second)
	}
}

func TestCreatingAVoucher(t *testing.T) {
	db, mux := newSite(t)
	actor, cookie := treasurer(t, db)
	before := time.Now().UTC().Add(-time.Second)

	wantRedirect(t, serve(mux, "POST", "/housekeeping/vouchers", cookie, voucherForm("AbC123xy", "50")), "/housekeeping/vouchers?created=1")

	vouchers := allVouchers(t, db)
	if len(vouchers) != 1 {
		t.Fatalf("vouchers = %+v, want one", vouchers)
	}
	got := vouchers[0]
	if got.Code != "AbC123xy" || got.Credits != 50 || got.CreatedByUserID.Int64 != actor || got.CreatedAt.Before(before) ||
		got.RedeemedByAvatarID.Valid || got.RedeemedAt.Valid {
		t.Errorf("voucher = %+v, want AbC123xy worth 50, made now by user %d and unused", got, actor)
	}
	wantOneLog(t, db, "vouchers.create", "Created voucher AbC123xy worth 50 credits", 0, 0)
	wantActor(t, db, "vouchers.create", actor)
	wantPage(t, serve(mux, "GET", "/housekeeping/vouchers?created=1", cookie, nil), http.StatusOK,
		"Vouchers:[{Code:AbC123xy Credits:50 Path:AbC123xy}] Message:"+voucherCreated+" Error:}")
}

// The code is trimmed as other names are, and Holo's empty took a code of 0 for a
// blank one.
func TestACodeIsTrimmedAndTheLimitsHold(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := treasurer(t, db)
	longest := strings.Repeat("é", 20)

	for _, c := range []struct{ code, credits string }{
		{" Spring 2026 \t", "1"},
		{longest, "2147483647"},
		{"0", "5"},
	} {
		wantRedirect(t, serve(mux, "POST", "/housekeeping/vouchers", cookie, voucherForm(c.code, c.credits)), "/housekeeping/vouchers?created=1")
	}
	saved := map[string]int64{}
	for _, v := range allVouchers(t, db) {
		saved[v.Code] = v.Credits
	}
	if want := map[string]int64{"Spring 2026": 1, longest: 2147483647, "0": 5}; !maps.Equal(saved, want) {
		t.Errorf("vouchers = %v, want %v", saved, want)
	}
	var logged []string
	for _, row := range logsOf(t, db, "vouchers.create") {
		logged = append(logged, row.Detail)
	}
	want := []string{"Created voucher 0 worth 5 credits", "Created voucher " + longest + " worth 2147483647 credits", "Created voucher Spring 2026 worth 1 credits"}
	if !slices.Equal(logged, want) {
		t.Errorf("logged %q, want %q", logged, want)
	}
}

func TestABadVoucherIsRefused(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := treasurer(t, db)

	for _, c := range []struct {
		name    string
		code    string
		credits string
		want    string
	}{
		{"no code", "", "5", voucherBlank},
		{"a code of spaces", "   ", "5", voucherBlank},
		{"no amount", "SPRING", "", voucherBlank},
		{"a code of 21 characters", strings.Repeat("é", 21), "5", voucherCodeTooLong},
		{"the code .", ".", "5", voucherCodeDots},
		{"the code ..", "..", "5", voucherCodeDots},
		{"the code .. between spaces", " .. ", "5", voucherCodeDots},
		{"an amount of 0", "SPRING", "0", voucherCreditsInvalid},
		{"a negative amount", "SPRING", "-5", voucherCreditsInvalid},
		{"an amount too high", "SPRING", "2147483648", voucherCreditsInvalid},
		{"an amount with decimals", "SPRING", "1.5", voucherCreditsInvalid},
		{"an amount in Holo's numbers", "SPRING", "1e3", voucherCreditsInvalid},
		{"an amount in words", "SPRING", "ten", voucherCreditsInvalid},
		{"an amount with a space", "SPRING", " 5", voucherCreditsInvalid},
	} {
		t.Run(c.name, func(t *testing.T) {
			rec := serve(mux, "POST", "/housekeeping/vouchers", cookie, voucherForm(c.code, c.credits))
			wantPage(t, rec, http.StatusUnprocessableEntity, "vouchers.html", "Error:"+c.want+"}")
		})
	}
	if got := allVouchers(t, db); len(got) != 0 {
		t.Errorf("vouchers = %+v, want none", got)
	}
	if rows := staffLogs(t, db); len(rows) != 0 {
		t.Errorf("%d log rows", len(rows))
	}
}

func TestARefusedVoucherKeepsWhatWasTyped(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := treasurer(t, db)

	rec := serve(mux, "POST", "/housekeeping/vouchers", cookie, voucherForm(" Typed ", "ten"))
	wantPage(t, rec, http.StatusUnprocessableEntity, "Form:{Code:Typed Credits:ten Type:credits}", "Error:"+voucherCreditsInvalid)

	rec = serve(mux, "POST", "/housekeeping/vouchers", cookie, voucherForm(" .. ", "5"))
	wantPage(t, rec, http.StatusUnprocessableEntity, "Form:{Code:.. Credits:5 Type:credits}", "Error:"+voucherCodeDots)
}

// A browser reads only . and .. in an address as folders (0106), so every other code
// of dots is created and then deleted through its address.
func TestOtherCodesOfDotsAreCreatedAndDeleted(t *testing.T) {
	db, mux := newSite(t)
	_, cookie := treasurer(t, db)
	codes := []string{"...", "..a", "a..", ". .", "./..", "%2E", "%2E%2E", ".%2e"}

	for _, code := range codes {
		wantRedirect(t, serve(mux, "POST", "/housekeeping/vouchers", cookie, voucherForm(code, "5")), "/housekeeping/vouchers?created=1")
	}
	if got := codesOf(allVouchers(t, db)); !slices.Equal(slices.Sorted(slices.Values(got)), slices.Sorted(slices.Values(codes))) {
		t.Fatalf("vouchers = %q, want %q", got, codes)
	}
	for _, code := range codes {
		wantRedirect(t, serve(mux, "POST", voucherDeleteURL(code), cookie, url.Values{}), "/housekeeping/vouchers?deleted=1")
	}
	if got := allVouchers(t, db); len(got) != 0 {
		t.Errorf("vouchers = %+v, want none", got)
	}
}

// Codes match ignoring case, as Holo's column did, and a redeemed voucher keeps its
// code.
func TestATakenCodeIsRefused(t *testing.T) {
	db, mux := newSite(t)
	addVoucher(t, db, "SUMMER08", 100, testNow)
	addVoucher(t, db, "USED", 40, testNow.Add(time.Minute))
	redeemVoucher(t, db, "USED")
	_, cookie := treasurer(t, db)

	for _, code := range []string{"summer08", "used"} {
		rec := serve(mux, "POST", "/housekeeping/vouchers", cookie, voucherForm(code, "5"))
		wantPage(t, rec, http.StatusUnprocessableEntity, "Form:{Code:"+code+" Credits:5}", "Error:"+voucherCodeTaken+"}")
	}
	vouchers := allVouchers(t, db)
	if got := codesOf(vouchers); !slices.Equal(got, []string{"SUMMER08", "USED"}) || vouchers[0].Credits != 100 {
		t.Errorf("vouchers = %+v, want SUMMER08 worth 100 and USED", vouchers)
	}
	if rows := staffLogs(t, db); len(rows) != 0 {
		t.Errorf("%d log rows", len(rows))
	}
}

func TestDeletingAVoucher(t *testing.T) {
	db, mux := newSite(t)
	addVoucher(t, db, "Mistake", 500, testNow)
	addVoucher(t, db, "Kept", 5, testNow.Add(time.Minute))
	actor, cookie := treasurer(t, db)

	wantRedirect(t, serve(mux, "POST", voucherDeleteURL("Mistake"), cookie, url.Values{}), "/housekeeping/vouchers?deleted=1")
	if got := codesOf(allVouchers(t, db)); !slices.Equal(got, []string{"Kept"}) {
		t.Errorf("vouchers = %v, want Kept alone", got)
	}
	wantOneLog(t, db, "vouchers.delete", "Deleted voucher Mistake", 0, 0)
	wantActor(t, db, "vouchers.delete", actor)
	wantPage(t, serve(mux, "GET", "/housekeeping/vouchers?deleted=1", cookie, nil), http.StatusOK,
		"Vouchers:[{Code:Kept Credits:5 Path:Kept}] Message:"+voucherDeleted+" Error:}")
}

// A redeemed voucher stays for audit (0063), and the answer is the page's, as for a
// code that no voucher has.
func TestARedeemedVoucherStays(t *testing.T) {
	db, mux := newSite(t)
	addVoucher(t, db, "Used", 40, testNow)
	redeemVoucher(t, db, "Used")
	_, cookie := treasurer(t, db)

	for _, code := range []string{"Used", "Unknown"} {
		rec := serve(mux, "POST", voucherDeleteURL(code), cookie, url.Values{})
		wantPage(t, rec, http.StatusNotFound, "vouchers.html", "Message: Error:"+voucherMissing+"}")
		if randomCode.FindString(rec.Body.String()) == "" {
			t.Errorf("the answer to %s offers no new code: %s", code, rec.Body)
		}
	}
	vouchers := allVouchers(t, db)
	if len(vouchers) != 1 || !vouchers[0].RedeemedAt.Valid {
		t.Errorf("vouchers = %+v, want the redeemed one kept", vouchers)
	}
	if rows := staffLogs(t, db); len(rows) != 0 {
		t.Errorf("%d log rows", len(rows))
	}
}

// A code is one segment of the delete's address, whatever it holds.
func TestAnyCodeCanBeDeleted(t *testing.T) {
	db, mux := newSite(t)
	codes := []string{"a/b", "50% off", "why?#not", "é ü", `back\slash`, ".a"}
	for i, code := range codes {
		addVoucher(t, db, code, 5, testNow.Add(time.Duration(i)*time.Minute))
	}
	_, cookie := treasurer(t, db)

	wantPage(t, serve(mux, "GET", "/housekeeping/vouchers", cookie, nil), http.StatusOK,
		"{Code:a/b Credits:5 Path:a%2Fb}", "{Code:50% off Credits:5 Path:50%25%20off}", "{Code:why?#not Credits:5 Path:why%3F%23not}",
		"{Code:é ü Credits:5 Path:%C3%A9%20%C3%BC}", `{Code:back\slash Credits:5 Path:back%5Cslash}`, "{Code:.a Credits:5 Path:.a}")
	for _, code := range codes {
		wantRedirect(t, serve(mux, "POST", voucherDeleteURL(code), cookie, url.Values{}), "/housekeeping/vouchers?deleted=1")
		if rows := logsOf(t, db, "vouchers.delete"); len(rows) == 0 || rows[0].Detail != "Deleted voucher "+code {
			t.Errorf("deleting %q logged %+v", code, rows)
		}
	}
	if got := allVouchers(t, db); len(got) != 0 {
		t.Errorf("vouchers = %+v, want none", got)
	}
}

// A voucher of the type Item gives the furni whose sprite the amount names, the first of several that share it
// (plans/server decision 0120), and is listed with the sprite where the credits go, as Holo's column showed it.
func TestCreatingAnItemVoucher(t *testing.T) {
	db, mux := newSite(t)
	actor, cookie := treasurer(t, db)
	item := func(code, sprite string) url.Values {
		return url.Values{"voucher": {code}, "type": {"item"}, "credits": {sprite}}
	}

	wantRedirect(t, serve(mux, "POST", "/housekeeping/vouchers", cookie, item("Beds", " bed_budgetb ")), "/housekeeping/vouchers?created=1")
	vouchers := allVouchers(t, db)
	if len(vouchers) != 1 || vouchers[0].Credits != 0 || vouchers[0].FurniDefinitionID.Int64 != 444 || vouchers[0].CreatedByUserID.Int64 != actor {
		t.Fatalf("vouchers = %+v, want one for the furni 444, the first bed_budgetb, with no credits", vouchers)
	}
	wantOneLog(t, db, "vouchers.create", "Created voucher Beds for the item bed_budgetb", 0, 0)
	wantPage(t, serve(mux, "GET", "/housekeeping/vouchers", cookie, nil), http.StatusOK, "Vouchers:[{Code:Beds Credits:bed_budgetb Path:Beds}]")

	for sprite, want := range map[string]string{
		"no_such_furni": voucherItemUnknown,
		"50":            voucherItemUnknown,
		"wallpaper":     voucherItemDecoration,
		"floor":         voucherItemDecoration,
		"landscape":     voucherItemDecoration,
	} {
		rec := serve(mux, "POST", "/housekeeping/vouchers", cookie, item("Other", sprite))
		wantPage(t, rec, http.StatusUnprocessableEntity, "vouchers.html", "Form:{Code:Other Credits:"+sprite+" Type:item}", "Error:"+want+"}")
	}
	wantPage(t, serve(mux, "POST", "/housekeeping/vouchers", cookie, item("Other", "")), http.StatusUnprocessableEntity, "Error:"+voucherBlank+"}")
	if got := allVouchers(t, db); len(got) != 1 {
		t.Errorf("vouchers = %+v, want the bed's alone", got)
	}
}
