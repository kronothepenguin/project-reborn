package cms

import (
	"database/sql"
	"maps"
	"net/http"
	"net/http/httptest"
	"slices"
	"testing"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/store"
)

type clubAnswer struct {
	Months    int    `json:"months"`
	Error     string `json:"error"`
	MaxMonths int    `json:"maxMonths"`
	Days      int    `json:"days"`
	Credits   int64  `json:"credits"`
}

func buyClub(mux *http.ServeMux, cookie *http.Cookie, months any) *httptest.ResponseRecorder {
	return edit(mux, cookie, "/club/subscriptions", map[string]any{"months": months})
}

func bought(t *testing.T, rec *httptest.ResponseRecorder) clubAnswer {
	t.Helper()
	if rec.Code != http.StatusOK {
		t.Fatalf("POST /club/subscriptions = %d %s", rec.Code, rec.Body)
	}
	return decode[clubAnswer](t, rec)
}

func clubPeriod(t *testing.T, db *sql.DB, userID int64, start, end time.Time) {
	t.Helper()
	err := store.New(db).CreateClubSubscription(t.Context(), store.CreateClubSubscriptionParams{UserID: userID, StartsAt: start, EndsAt: end, CreatedAt: start})
	if err != nil {
		t.Fatalf("CreateClubSubscription: %v", err)
	}
}

func clubPeriods(t *testing.T, db *sql.DB, userID int64) [][2]time.Time {
	t.Helper()
	rows, err := db.QueryContext(t.Context(), `SELECT starts_at, ends_at FROM club_subscriptions WHERE user_id = ? ORDER BY starts_at`, userID)
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
	return periods
}

// wears gives a habbo a badge to wear.
func wears(t *testing.T, db *sql.DB, avatarID int64, code string) {
	t.Helper()
	if _, err := store.New(db).GrantAvatarBadge(t.Context(), store.GrantAvatarBadgeParams{AvatarID: avatarID, Code: code, GrantedAt: testNow}); err != nil {
		t.Fatalf("GrantAvatarBadge: %v", err)
	}
}

// badgesOf maps a habbo's badges to whether it wears them.
func badgesOf(t *testing.T, db *sql.DB, avatarID int64) map[string]bool {
	t.Helper()
	rows, err := store.New(db).ListAvatarBadges(t.Context(), avatarID)
	if err != nil {
		t.Fatal(err)
	}
	badges := map[string]bool{}
	for _, b := range rows {
		badges[b.Code] = b.Slot > 0
	}
	return badges
}

func TestGuestsReadTheClubPage(t *testing.T) {
	_, mux := newSite(t)
	wantPage(t, serve(mux, "GET", "/club", nil, nil), http.StatusOK, "club.html", "SignedIn:false", "ShortName:Holo",
		"Price1Month:20 Price3Months:50 Price6Months:80 DaysPerMonth:31")
}

func TestTheClubPageShowsTheMembership(t *testing.T) {
	db, mux, cookie, userID := buyer(t, 35)
	wantPage(t, serve(mux, "GET", "/club", cookie, nil), http.StatusOK, "club.html", "SignedIn:true", "ClubDays:0 Credits:35")

	now := time.Now().UTC()
	clubPeriod(t, db, userID, now.Add(-time.Hour), now.AddDate(0, 0, 10))
	setSetting(t, db, "club.price1Month", 5)
	setSetting(t, db, "club.price3Months", 12)
	setSetting(t, db, "club.price6Months", 21)
	setSetting(t, db, "club.daysPerMonth", 30)
	wantPage(t, serve(mux, "GET", "/club", cookie, nil), http.StatusOK,
		"ClubDays:10 Credits:35 Price1Month:5 Price3Months:12 Price6Months:21 DaysPerMonth:30")
}

func TestBuyingClubWritesItAllTogether(t *testing.T) {
	db, mux, cookie, userID := buyer(t, 100)
	q := store.New(db)
	frank := avatarID(t, db, "Frank")
	secondHabbo(t, db, userID, "FrankToo")
	secondHabbo(t, db, userID, "FrankGone")
	too, gone := avatarID(t, db, "FrankToo"), avatarID(t, db, "FrankGone")
	if _, err := q.ArchiveAvatar(t.Context(), store.ArchiveAvatarParams{ID: gone, UserID: userID, ArchivedAt: sql.NullTime{Time: testNow, Valid: true}, UpdatedAt: testNow}); err != nil {
		t.Fatal(err)
	}
	habbo(t, db, "other@example.com", "Other")
	wears(t, db, frank, "ADM")
	wears(t, db, too, "NWB")

	before := time.Now().UTC()
	answer := bought(t, buyClub(mux, cookie, 1))
	after := time.Now().UTC()
	if answer != (clubAnswer{Months: 1, Days: 31, Credits: 80}) {
		t.Errorf("the answer = %+v", answer)
	}
	periods := clubPeriods(t, db, userID)
	if len(periods) != 1 || periods[0][0].Before(before) || periods[0][0].After(after) || !periods[0][1].Equal(periods[0][0].AddDate(0, 0, 31)) {
		t.Errorf("the periods = %v, want one of 31 days from the purchase", periods)
	}
	if got := walletOf(t, db, userID); got != 80 {
		t.Errorf("the wallet holds %d, want 100 - 20", got)
	}
	ledger, err := q.ListWalletTransactions(t.Context(), store.ListWalletTransactionsParams{UserID: userID, RowLimit: 10})
	if err != nil {
		t.Fatal(err)
	}
	if len(ledger) != 1 || ledger[0].Credits != -20 || ledger[0].Reason != "club" || ledger[0].Detail != "Club subscription (1 month(s))" || ledger[0].Habbo.String != "Frank" {
		t.Errorf("the ledger = %+v", ledger)
	}
	for name, want := range map[string]struct {
		id     int64
		badges map[string]bool
	}{
		"the buyer, who wears HC1 in place of ADM": {frank, map[string]bool{"ADM": false, "HC1": true}},
		"another habbo, which keeps its badge on":  {too, map[string]bool{"NWB": true, "HC1": false}},
		"an archived habbo":                        {gone, map[string]bool{"HC1": false}},
		"another user's habbo":                     {avatarID(t, db, "Other"), map[string]bool{}},
	} {
		if got := badgesOf(t, db, want.id); !maps.Equal(got, want.badges) {
			t.Errorf("%s has %v, want %v", name, got, want.badges)
		}
	}
}

// Holo's GiveHC put HC1 on only when it gave it.
func TestTheBuyerWearsHC1OnlyWhenItIsGiven(t *testing.T) {
	db, mux, cookie, userID := buyer(t, 100)
	frank := avatarID(t, db, "Frank")
	wears(t, db, frank, "ADM")
	if _, err := store.New(db).GrantBadgeToUserAvatars(t.Context(), store.GrantBadgeToUserAvatarsParams{Code: "HC1", GrantedAt: testNow, UserID: userID}); err != nil {
		t.Fatal(err)
	}
	secondHabbo(t, db, userID, "FrankToo")

	bought(t, buyClub(mux, cookie, 1))
	if got := badgesOf(t, db, frank); !maps.Equal(got, map[string]bool{"HC1": false, "ADM": true}) {
		t.Errorf("the buyer, who held HC1, has %v, want ADM still on", got)
	}
	if got := badgesOf(t, db, avatarID(t, db, "FrankToo")); !maps.Equal(got, map[string]bool{"HC1": false}) {
		t.Errorf("the other habbo has %v, want HC1 off", got)
	}
}

func TestAPeriodBoughtDuringTheClubFollowsIt(t *testing.T) {
	db, mux, cookie, userID := buyer(t, 200)
	bought(t, buyClub(mux, cookie, 1))
	if answer := bought(t, buyClub(mux, cookie, 3)); answer != (clubAnswer{Months: 3, Days: 124, Credits: 130}) {
		t.Errorf("the answer = %+v", answer)
	}
	periods := clubPeriods(t, db, userID)
	if len(periods) != 2 || !periods[1][0].Equal(periods[0][1]) || !periods[1][1].Equal(periods[0][1].AddDate(0, 0, 93)) {
		t.Errorf("the periods = %v, want three months from the end of the first", periods)
	}
	ledger, err := store.New(db).ListWalletTransactions(t.Context(), store.ListWalletTransactionsParams{UserID: userID, RowLimit: 10})
	if err != nil {
		t.Fatal(err)
	}
	if len(ledger) != 2 || ledger[0].Credits != -50 || ledger[0].Detail != "Club subscription (3 month(s))" {
		t.Errorf("the ledger = %+v", ledger)
	}
	wantPage(t, serve(mux, "GET", "/club", cookie, nil), http.StatusOK, "ClubDays:124 Credits:130")
	wantPage(t, serve(mux, "GET", "/me", cookie, nil), http.StatusOK, "ClubDays:124")
}

func TestAnyOtherNumberOfMonthsBuysOne(t *testing.T) {
	db, mux, cookie, userID := buyer(t, 100)
	for i, months := range []any{0, 2, 7, -3, nil} {
		answer := bought(t, buyClub(mux, cookie, months))
		if want := (clubAnswer{Months: 1, Days: 31 * (i + 1), Credits: 100 - 20*int64(i+1)}); answer != want {
			t.Errorf("%v months: the answer = %+v, want %+v", months, answer, want)
		}
	}
	if n := len(clubPeriods(t, db, userID)); n != 5 {
		t.Errorf("%d periods, want 5", n)
	}
	if rec := edit(mux, cookie, "/club/subscriptions", map[string]any{"months": "three"}); rec.Code != http.StatusBadRequest {
		t.Errorf("months that are no number = %d, want 400", rec.Code)
	}
}

func TestAClubPurchaseRefusedWritesNothing(t *testing.T) {
	for _, c := range []struct {
		name    string
		credits int64
		before  func(t *testing.T, db *sql.DB, userID int64)
		months  int
		want    clubAnswer
	}{
		{name: "a purse short of a month", credits: 19, months: 1, want: clubAnswer{Error: "credits", Credits: 19}},
		{name: "a purse short of six months", credits: 79, months: 6, want: clubAnswer{Error: "credits", Credits: 79}},
		{name: "short of the price before the limit", credits: 49, before: func(t *testing.T, db *sql.DB, userID int64) {
			now := time.Now().UTC()
			clubPeriod(t, db, userID, now.Add(-time.Hour), now.AddDate(0, 0, 150))
		}, months: 3, want: clubAnswer{Error: "credits", Days: 150, Credits: 49}},
		{name: "past the six months", credits: 100, before: func(t *testing.T, db *sql.DB, userID int64) {
			now := time.Now().UTC()
			clubPeriod(t, db, userID, now.AddDate(0, 0, -10), now.AddDate(0, 0, 21))
		}, months: 6, want: clubAnswer{Error: "limit", MaxMonths: 6, Days: 21, Credits: 100}},
		{name: "past a lower limit", credits: 100, before: func(t *testing.T, db *sql.DB, _ int64) {
			setSetting(t, db, "club.maxMonths", 3)
		}, months: 6, want: clubAnswer{Error: "limit", MaxMonths: 3, Credits: 100}},
	} {
		t.Run(c.name, func(t *testing.T) {
			db, mux, cookie, userID := buyer(t, c.credits)
			if c.before != nil {
				c.before(t, db, userID)
			}
			periods := len(clubPeriods(t, db, userID))
			rec := buyClub(mux, cookie, c.months)
			if rec.Code != http.StatusUnprocessableEntity {
				t.Fatalf("POST /club/subscriptions = %d %s, want 422", rec.Code, rec.Body)
			}
			if got := decode[clubAnswer](t, rec); got != c.want {
				t.Errorf("the refusal = %+v, want %+v", got, c.want)
			}
			if got := walletOf(t, db, userID); got != c.credits {
				t.Errorf("the wallet holds %d, want %d", got, c.credits)
			}
			if n := countRows(t, db, "SELECT COUNT(*) FROM wallet_transactions"); n != 0 {
				t.Errorf("%d ledger rows", n)
			}
			if n := len(clubPeriods(t, db, userID)); n != periods {
				t.Errorf("%d periods, want %d", n, periods)
			}
			if n := countRows(t, db, "SELECT COUNT(*) FROM avatar_badges"); n != 0 {
				t.Errorf("%d badges given", n)
			}
		})
	}
}

// Holo's months_left counted the month under way as a whole one, and the months
// left with those bought may reach club.maxMonths, unless it is 0.
func TestTheMonthLimitCountsTheMonthUnderWay(t *testing.T) {
	for _, c := range []struct {
		name   string
		left   int
		months int
		limit  int
		ok     bool
	}{
		{name: "six months from none", months: 6, limit: 6, ok: true},
		{name: "a seventh month", left: 186, months: 1, limit: 6},
		{name: "three months on exactly three", left: 93, months: 3, limit: 6, ok: true},
		{name: "three months on three and a day", left: 94, months: 3, limit: 6},
		{name: "one month on four under way", left: 114, months: 1, limit: 6, ok: true},
		{name: "three months on four under way", left: 114, months: 3, limit: 6},
		{name: "no limit", left: 186, months: 6, limit: 0, ok: true},
	} {
		t.Run(c.name, func(t *testing.T) {
			db, mux, cookie, userID := buyer(t, 100)
			setSetting(t, db, "club.maxMonths", c.limit)
			if c.left > 0 {
				now := time.Now().UTC()
				clubPeriod(t, db, userID, now.Add(-time.Hour), now.AddDate(0, 0, c.left))
			}
			rec := buyClub(mux, cookie, c.months)
			answer := decode[clubAnswer](t, rec)
			if c.ok && (rec.Code != http.StatusOK || answer.Months != c.months) {
				t.Errorf("got %d %+v, want the purchase", rec.Code, answer)
			}
			if !c.ok && (rec.Code != http.StatusUnprocessableEntity || answer.Error != "limit" || answer.MaxMonths != c.limit) {
				t.Errorf("got %d %+v, want the limit of %d", rec.Code, answer, c.limit)
			}
		})
	}
}

func TestThePricesAndDaysComeFromTheSettings(t *testing.T) {
	db, mux, cookie, userID := buyer(t, 10)
	setSetting(t, db, "club.price3Months", 7)
	setSetting(t, db, "club.daysPerMonth", 30)
	if answer := bought(t, buyClub(mux, cookie, 3)); answer != (clubAnswer{Months: 3, Days: 90, Credits: 3}) {
		t.Errorf("the answer = %+v", answer)
	}
	if periods := clubPeriods(t, db, userID); len(periods) != 1 || !periods[0][1].Equal(periods[0][0].AddDate(0, 0, 90)) {
		t.Errorf("the periods = %v, want one of 90 days", periods)
	}
}

func TestGuestsCannotBuyClub(t *testing.T) {
	db, mux := newSite(t)
	if rec := buyClub(mux, nil, 1); rec.Code != http.StatusUnauthorized {
		t.Errorf("a guest's POST /club/subscriptions = %d, want 401", rec.Code)
	}
	if n := countRows(t, db, "SELECT COUNT(*) FROM club_subscriptions"); n != 0 {
		t.Errorf("%d periods", n)
	}
}

// Holo's IsHCMember took the badge once the club was over, wherever the site read
// the club; a user with no period keeps the HC1 staff gave.
func TestHC1LeavesWhenTheClubEnds(t *testing.T) {
	db, mux, cookie, userID := buyer(t, 100)
	frank := avatarID(t, db, "Frank")
	secondHabbo(t, db, userID, "FrankToo")
	too := avatarID(t, db, "FrankToo")
	habbo(t, db, "gifted@example.com", "Gifted")
	gifted := avatarID(t, db, "Gifted")
	memberUser := habbo(t, db, "member@example.com", "Member")
	member := avatarID(t, db, "Member")
	now := time.Now().UTC()
	clubPeriod(t, db, userID, now.AddDate(0, 0, -31), now.Add(-time.Hour))
	clubPeriod(t, db, memberUser, now.Add(-time.Hour), now.AddDate(0, 0, 3))
	wears(t, db, frank, "HC1")
	wears(t, db, too, "NWB")
	if _, err := store.New(db).GrantBadgeToUserAvatars(t.Context(), store.GrantBadgeToUserAvatarsParams{Code: "HC1", GrantedAt: testNow, UserID: userID}); err != nil {
		t.Fatal(err)
	}
	wears(t, db, gifted, "HC1")
	wears(t, db, member, "HC1")

	wantPage(t, serve(mux, "GET", "/club", cookie, nil), http.StatusOK, "ClubDays:0")
	if got := badgesOf(t, db, frank); len(got) != 0 {
		t.Errorf("the habbo whose club ended has %v", got)
	}
	if got := badgesOf(t, db, too); !maps.Equal(got, map[string]bool{"NWB": true}) {
		t.Errorf("the user's other habbo has %v, want its own badge alone", got)
	}
	gift := login(t, db, "Gifted")
	for _, path := range []string{"/me", "/club", "/home/Gifted", "/home/Member"} {
		wantPage(t, serve(mux, "GET", path, gift, nil), http.StatusOK)
	}
	if got := badgesOf(t, db, gifted); !maps.Equal(got, map[string]bool{"HC1": true}) {
		t.Errorf("a user with no period has %v, want the HC1 staff gave", got)
	}
	if got := badgesOf(t, db, member); !maps.Equal(got, map[string]bool{"HC1": true}) {
		t.Errorf("a member has %v, want HC1", got)
	}

	bought(t, buyClub(mux, cookie, 1))
	if got := badgesOf(t, db, frank); !maps.Equal(got, map[string]bool{"HC1": true}) {
		t.Errorf("buying again gives the buyer %v, want HC1 on", got)
	}
}

// The home page reads its owner's club, as Holo's did.
func TestHC1LeavesWhenTheHomeOfAnEndedClubIsRead(t *testing.T) {
	db, mux, _, userID := buyer(t, 0)
	frank := avatarID(t, db, "Frank")
	now := time.Now().UTC()
	clubPeriod(t, db, userID, now.AddDate(0, 0, -31), now.Add(-time.Minute))
	wears(t, db, frank, "HC1")
	wantPage(t, serve(mux, "GET", "/home/Frank", nil, nil), http.StatusOK, "Wide:false")
	if got := slices.Collect(maps.Keys(badgesOf(t, db, frank))); len(got) != 0 {
		t.Errorf("the owner whose club ended has %v", got)
	}
}
