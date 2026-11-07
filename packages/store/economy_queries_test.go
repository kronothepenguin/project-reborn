package store

import (
	"database/sql"
	"slices"
	"testing"
	"time"
)

func makeVoucher(t *testing.T, q *Queries, code string, credits int64, at time.Time) {
	t.Helper()
	if err := q.CreateVoucher(t.Context(), CreateVoucherParams{Code: code, Credits: credits, CreatedAt: at}); err != nil {
		t.Fatalf("CreateVoucher %s: %v", code, err)
	}
}

func voucherCodes(vouchers []Voucher) []string {
	codes := make([]string, 0, len(vouchers))
	for _, v := range vouchers {
		codes = append(codes, v.Code)
	}
	return codes
}

func TestAVoucherRedeemsOnceIgnoringCase(t *testing.T) {
	db := openTestDB(t)
	q := New(db)
	ctx := t.Context()
	user, habbo := createUserWithHabbo(t, q, "krono@example.com", "Krono")
	if err := q.CreateWallet(ctx, CreateWalletParams{UserID: user.ID, Credits: 100, UpdatedAt: testNow}); err != nil {
		t.Fatal(err)
	}
	makeVoucher(t, q, "AbCd1234", 50, testNow)
	makeVoucher(t, q, "Other", 10, testNow)

	// redeem claims the code and fills the purse in one transaction, as the CMS does.
	redeem := func(code string, at time.Time) (int64, error) {
		t.Helper()
		tx, err := db.BeginTx(ctx, nil)
		if err != nil {
			t.Fatal(err)
		}
		defer tx.Rollback()
		qtx := q.WithTx(tx)
		credits, err := qtx.RedeemVoucher(ctx, RedeemVoucherParams{
			RedeemedByAvatarID: habbo.ID, RedeemedAt: sql.NullTime{Time: at, Valid: true}, Code: code,
		})
		if err != nil {
			return 0, err
		}
		if err := qtx.AddWalletCredits(ctx, AddWalletCreditsParams{Credits: credits, UpdatedAt: at, UserID: user.ID}); err != nil {
			t.Fatal(err)
		}
		return credits, tx.Commit()
	}

	if credits, err := redeem("abcd1234", testNow.Add(time.Minute)); err != nil || credits != 50 {
		t.Fatalf("the first redemption = %d, %v; want 50 credits", credits, err)
	}
	if credits, err := redeem("ABCD1234", testNow.Add(2*time.Minute)); !IsNotFound(err) {
		t.Errorf("the second redemption = %d, %v; want not found", credits, err)
	}
	if credits, err := redeem("Unknown", testNow.Add(2*time.Minute)); !IsNotFound(err) {
		t.Errorf("an unknown code = %d, %v; want not found", credits, err)
	}
	if wallet := must(q.GetWallet(ctx, user.ID)); wallet.Credits != 150 {
		t.Errorf("the purse holds %d credits, want 150", wallet.Credits)
	}

	var by sql.NullInt64
	var at sql.NullTime
	if err := db.QueryRowContext(ctx, `SELECT redeemed_by_avatar_id, redeemed_at FROM vouchers WHERE code = 'AbCd1234'`).Scan(&by, &at); err != nil {
		t.Fatalf("the redeemed voucher: %v", err)
	}
	if by.Int64 != habbo.ID || !at.Time.Equal(testNow.Add(time.Minute)) {
		t.Errorf("the voucher was redeemed by %v at %v, want Krono at the first redemption", by, at)
	}
	if got := voucherCodes(must(q.ListUnusedVouchers(ctx))); !slices.Equal(got, []string{"Other"}) {
		t.Errorf("unused vouchers = %v, want the other one only", got)
	}
}

func TestOnlyUnusedVouchersAreListedAndDeleted(t *testing.T) {
	db := openTestDB(t)
	q := New(db)
	ctx := t.Context()
	_, habbo := createUserWithHabbo(t, q, "krono@example.com", "Krono")
	makeVoucher(t, q, "Zulu", 30, testNow)
	makeVoucher(t, q, "Alpha", 10, testNow.Add(time.Minute))
	makeVoucher(t, q, "Mike", 20, testNow.Add(2*time.Minute))
	makeVoucher(t, q, "Used", 40, testNow.Add(3*time.Minute))
	if err := q.CreateVoucher(ctx, CreateVoucherParams{Code: "ALPHA", Credits: 5, CreatedAt: testNow}); !IsConflict(err) {
		t.Errorf("a second Alpha = %v, want a conflict", err)
	}
	if _, err := q.RedeemVoucher(ctx, RedeemVoucherParams{RedeemedByAvatarID: habbo.ID, RedeemedAt: sql.NullTime{Time: testNow, Valid: true}, Code: "Used"}); err != nil {
		t.Fatal(err)
	}

	if got := voucherCodes(must(q.ListUnusedVouchers(ctx))); !slices.Equal(got, []string{"Zulu", "Alpha", "Mike"}) {
		t.Errorf("unused vouchers = %v, want the unused ones in the order they were made", got)
	}
	if n := must(q.DeleteUnusedVoucher(ctx, "Used")); n != 0 {
		t.Errorf("deleting the redeemed voucher touched %d rows", n)
	}
	var redeemed int
	if err := db.QueryRowContext(ctx, `SELECT COUNT(*) FROM vouchers WHERE code = 'Used' AND redeemed_at IS NOT NULL`).Scan(&redeemed); err != nil || redeemed != 1 {
		t.Errorf("the redeemed voucher: %d rows, %v; want it kept", redeemed, err)
	}
	if n := must(q.DeleteUnusedVoucher(ctx, "alpha")); n != 1 {
		t.Errorf("deleting an unused voucher touched %d rows, want 1", n)
	}
	if got := voucherCodes(must(q.ListUnusedVouchers(ctx))); !slices.Equal(got, []string{"Zulu", "Mike"}) {
		t.Errorf("after the delete, unused vouchers = %v", got)
	}
}

// subscribe adds a period of days to the user's club as the CMS does: from the later
// of now and the end of the user's last period.
func subscribe(t *testing.T, q *Queries, userID int64, now time.Time, days int) {
	t.Helper()
	start := now
	end, err := q.GetLatestClubEnd(t.Context(), userID)
	switch {
	case err == nil && end.After(now):
		start = end
	case err != nil && !IsNotFound(err):
		t.Fatal(err)
	}
	err = q.CreateClubSubscription(t.Context(), CreateClubSubscriptionParams{
		UserID: userID, StartsAt: start, EndsAt: start.AddDate(0, 0, days), CreatedAt: now,
	})
	if err != nil {
		t.Fatalf("CreateClubSubscription: %v", err)
	}
}

func TestAClubPeriodStartsAtTheEndOfTheCurrentOne(t *testing.T) {
	db := openTestDB(t)
	q := New(db)
	ctx := t.Context()
	user, _ := createUserWithHabbo(t, q, "krono@example.com", "Krono")
	other, _ := createUserWithHabbo(t, q, "other@example.com", "Other")

	if _, err := q.GetLatestClubEnd(ctx, user.ID); !IsNotFound(err) {
		t.Errorf("the end of no period: %v, want not found", err)
	}
	if must(q.HasClubSubscription(ctx, user.ID)) {
		t.Error("a user without periods has one")
	}

	subscribe(t, q, user.ID, testNow, 31)
	subscribe(t, q, user.ID, testNow.AddDate(0, 0, 10), 93)
	if got := must(q.GetLatestClubEnd(ctx, user.ID)); !got.Equal(testNow.AddDate(0, 0, 124)) {
		t.Errorf("the club ends at %v, want 124 days after the first purchase", got)
	}

	ended := testNow.AddDate(0, 0, 200)
	subscribe(t, q, user.ID, ended, 31)
	rows, err := db.QueryContext(ctx, `SELECT starts_at, ends_at FROM club_subscriptions WHERE user_id = ? ORDER BY starts_at`, user.ID)
	if err != nil {
		t.Fatal(err)
	}
	defer rows.Close()
	var periods [][2]time.Time
	for rows.Next() {
		var period [2]time.Time
		if err := rows.Scan(&period[0], &period[1]); err != nil {
			t.Fatal(err)
		}
		periods = append(periods, period)
	}
	if err := rows.Err(); err != nil {
		t.Fatal(err)
	}
	want := [][2]time.Time{
		{testNow, testNow.AddDate(0, 0, 31)},
		{testNow.AddDate(0, 0, 31), testNow.AddDate(0, 0, 124)},
		{ended, ended.AddDate(0, 0, 31)},
	}
	if !slices.EqualFunc(periods, want, func(a, b [2]time.Time) bool { return a[0].Equal(b[0]) && a[1].Equal(b[1]) }) {
		t.Errorf("periods = %v, want %v", periods, want)
	}

	if !must(q.HasClubSubscription(ctx, user.ID)) {
		t.Error("a user with periods has none")
	}
	if must(q.HasClubSubscription(ctx, other.ID)) {
		t.Error("another user's periods count for a user without any")
	}
	if _, err := q.GetLatestClubEnd(ctx, other.ID); !IsNotFound(err) {
		t.Errorf("another user's club end: %v, want not found", err)
	}
}

// The periods are bought in order, each read at or after its purchase, as the site
// reads them.
func TestTheClubEndsWithItsLastPeriod(t *testing.T) {
	db := openTestDB(t)
	q := New(db)
	ctx := t.Context()
	user, _ := createUserWithHabbo(t, q, "krono@example.com", "Krono")
	other, _ := createUserWithHabbo(t, q, "other@example.com", "Other")
	day := func(n int) time.Time { return testNow.AddDate(0, 0, n) }
	wantEnd := func(name string, now, want time.Time) {
		t.Helper()
		if got, err := q.GetClubEnd(ctx, GetClubEndParams{UserID: user.ID, Now: now}); err != nil || !got.Equal(want) {
			t.Errorf("%s: the club ends at %v, %v; want %v", name, got, err, want)
		}
	}
	wantNone := func(name string, now time.Time) {
		t.Helper()
		if got, err := q.GetClubEnd(ctx, GetClubEndParams{UserID: user.ID, Now: now}); !IsNotFound(err) {
			t.Errorf("%s: the club ends at %v, %v; want not found", name, got, err)
		}
	}

	subscribe(t, q, user.ID, day(0), 31)
	wantEnd("one period", day(0), day(31))
	subscribe(t, q, other.ID, day(5), 186)
	subscribe(t, q, user.ID, day(10), 93)
	wantEnd("a period bought during the first", day(10), day(124))
	wantEnd("in the second period", day(50), day(124))
	wantNone("before the first period", day(-1))
	wantNone("at the end of the last period", day(124))
	wantNone("after the club, while another user's runs", day(150))
	subscribe(t, q, user.ID, day(200), 31)
	wantEnd("a period bought after the club ended", day(210), day(231))
}

func badgesOf(t *testing.T, q *Queries, avatarID int64) map[string]AvatarBadge {
	t.Helper()
	badges := map[string]AvatarBadge{}
	for _, b := range must(q.ListAvatarBadges(t.Context(), avatarID)) {
		badges[b.Code] = b
	}
	return badges
}

func TestTheClubBadgeReachesEveryHabboOfTheUserOnly(t *testing.T) {
	db := openTestDB(t)
	q := New(db)
	ctx := t.Context()
	user, buyer := createUserWithHabbo(t, q, "krono@example.com", "Krono")
	_, stranger := createUserWithHabbo(t, q, "other@example.com", "Other")
	habbo := func(name string) int64 {
		return must(q.CreateAvatar(ctx, CreateAvatarParams{UserID: user.ID, Name: name, Figure: "hd-180-1", Gender: "M", CreatedAt: testNow, UpdatedAt: testNow})).ID
	}
	plain := habbo("KronoToo")
	archived := habbo("KronoGone")
	holder := habbo("KronoHolder")
	if _, err := q.ArchiveAvatar(ctx, ArchiveAvatarParams{ID: archived, UserID: user.ID, ArchivedAt: sql.NullTime{Time: testNow, Valid: true}, UpdatedAt: testNow}); err != nil {
		t.Fatal(err)
	}
	for _, grant := range []GrantAvatarBadgeParams{
		{AvatarID: buyer.ID, Code: "ADM", GrantedAt: testNow},
		{AvatarID: holder, Code: "HC1", GrantedAt: testNow},
	} {
		if _, err := q.GrantAvatarBadge(ctx, grant); err != nil {
			t.Fatal(err)
		}
	}

	later := testNow.Add(time.Hour)
	if n := must(q.GrantBadgeToUserAvatars(ctx, GrantBadgeToUserAvatarsParams{Code: "HC1", GrantedAt: later, UserID: user.ID})); n != 3 {
		t.Errorf("HC1 went to %d habbos, want the 3 that lacked it", n)
	}
	for name, id := range map[string]int64{"Krono": buyer.ID, "KronoToo": plain, "KronoGone": archived} {
		if b, ok := badgesOf(t, q, id)["HC1"]; !ok || b.Worn || !b.GrantedAt.Equal(later) {
			t.Errorf("%s's HC1 = %+v, %t; want it given unworn", name, b, ok)
		}
	}
	if b := badgesOf(t, q, holder)["HC1"]; !b.Worn || !b.GrantedAt.Equal(testNow) {
		t.Errorf("the habbo that held HC1 has %+v, want it as it was", b)
	}
	if b := badgesOf(t, q, buyer.ID)["ADM"]; !b.Worn {
		t.Errorf("the buyer's ADM = %+v, want it still worn until the buyer wears HC1", b)
	}
	if badges := badgesOf(t, q, stranger.ID); len(badges) != 0 {
		t.Errorf("another user's habbo got %v", badges)
	}

	if err := q.TakeOffAvatarBadge(ctx, buyer.ID); err != nil {
		t.Fatal(err)
	}
	if err := q.WearAvatarBadge(ctx, WearAvatarBadgeParams{AvatarID: buyer.ID, Code: "HC1"}); err != nil {
		t.Fatal(err)
	}
	if worn := must(q.GetWornAvatarBadge(ctx, buyer.ID)); worn.Code != "HC1" {
		t.Errorf("the buyer wears %s, want HC1", worn.Code)
	}
	if n := must(q.GrantBadgeToUserAvatars(ctx, GrantBadgeToUserAvatarsParams{Code: "HC1", GrantedAt: later, UserID: user.ID})); n != 0 {
		t.Errorf("a second purchase gave HC1 to %d habbos that held it", n)
	}

	if _, err := q.GrantAvatarBadge(ctx, GrantAvatarBadgeParams{AvatarID: stranger.ID, Code: "HC1", GrantedAt: testNow}); err != nil {
		t.Fatal(err)
	}
	if n := must(q.DeleteBadgeFromUserAvatars(ctx, DeleteBadgeFromUserAvatarsParams{Code: "HC1", UserID: user.ID})); n != 4 {
		t.Errorf("HC1 left %d habbos, want all 4 of the user's", n)
	}
	for _, id := range []int64{buyer.ID, plain, archived, holder} {
		if _, ok := badgesOf(t, q, id)["HC1"]; ok {
			t.Errorf("habbo %d kept HC1", id)
		}
	}
	if _, ok := badgesOf(t, q, buyer.ID)["ADM"]; !ok {
		t.Error("the buyer lost ADM with HC1")
	}
	if _, ok := badgesOf(t, q, stranger.ID)["HC1"]; !ok {
		t.Error("another user's habbo lost its HC1")
	}
}

func TestAnOutfitReplacesItsSlots(t *testing.T) {
	db := openTestDB(t)
	q := New(db)
	ctx := t.Context()
	user, habbo := createUserWithHabbo(t, q, "krono@example.com", "Krono")
	sibling := must(q.CreateAvatar(ctx, CreateAvatarParams{UserID: user.ID, Name: "KronoToo", Figure: "hd-180-1", Gender: "M", CreatedAt: testNow, UpdatedAt: testNow}))

	for _, outfit := range []UpsertWardrobeOutfitParams{
		{AvatarID: habbo.ID, Slot: 3, Figure: "hd-180-1.ch-215-82", Gender: "M", UpdatedAt: testNow},
		{AvatarID: habbo.ID, Slot: 1, Figure: "hd-600-1.ch-630-62", Gender: "F", UpdatedAt: testNow},
		{AvatarID: sibling.ID, Slot: 3, Figure: "hd-190-1.ch-210-66", Gender: "M", UpdatedAt: testNow},
		{AvatarID: habbo.ID, Slot: 3, Figure: "hd-605-2.ch-635-70", Gender: "F", UpdatedAt: testNow.Add(time.Hour)},
	} {
		if err := q.UpsertWardrobeOutfit(ctx, outfit); err != nil {
			t.Fatalf("UpsertWardrobeOutfit %+v: %v", outfit, err)
		}
	}

	got := must(q.ListWardrobeOutfits(ctx, habbo.ID))
	want := []WardrobeOutfit{
		{AvatarID: habbo.ID, Slot: 1, Figure: "hd-600-1.ch-630-62", Gender: "F", UpdatedAt: testNow},
		{AvatarID: habbo.ID, Slot: 3, Figure: "hd-605-2.ch-635-70", Gender: "F", UpdatedAt: testNow.Add(time.Hour)},
	}
	if !slices.EqualFunc(got, want, func(a, b WardrobeOutfit) bool {
		return a.AvatarID == b.AvatarID && a.Slot == b.Slot && a.Figure == b.Figure && a.Gender == b.Gender && a.UpdatedAt.Equal(b.UpdatedAt)
	}) {
		t.Errorf("outfits = %+v, want slot 1 and the newer outfit of slot 3", got)
	}
	if outfits := must(q.ListWardrobeOutfits(ctx, sibling.ID)); len(outfits) != 1 || outfits[0].Figure != "hd-190-1.ch-210-66" {
		t.Errorf("the other habbo's outfits = %+v, want its own", outfits)
	}
	if err := q.UpsertWardrobeOutfit(ctx, UpsertWardrobeOutfitParams{AvatarID: habbo.ID, Slot: 0, Figure: "hd-180-1", Gender: "M", UpdatedAt: testNow}); err == nil {
		t.Error("slot 0 was accepted")
	}
}
