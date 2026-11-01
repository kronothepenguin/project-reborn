package router

import (
	"context"
	"database/sql"
	"fmt"
	"net/http"
	"net/url"
	"slices"
	"strconv"
	"strings"
	"time"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

const firstBirthYear = 1900

type dateOption struct {
	Value    int
	Label    string
	Selected bool
}

// registerPage's Errors are keyed by the part of the form they belong to: form,
// name, look, password, bornOn, email and terms.
type registerPage struct {
	hotelStatus
	Habbo       string
	Email       string
	Newsletter  bool
	Terms       bool
	Figure      string
	Gender      string
	EditorState string
	Refer       string
	Days        []dateOption
	Months      []dateOption
	Years       []dateOption
	Errors      map[string]string
}

func (p *registerPage) setBornOn(day, month, year int) {
	label := strconv.Itoa
	p.Days = dateOptions(1, 31, day, label)
	p.Months = dateOptions(1, 12, month, func(value int) string { return time.Month(value).String() })
	p.Years = dateOptions(firstBirthYear, time.Now().Year(), year, label)
	slices.Reverse(p.Years)
}

func dateOptions(first, last, selected int, label func(int) string) []dateOption {
	options := make([]dateOption, 0, last-first+1)
	for value := first; value <= last; value++ {
		options = append(options, dateOption{Value: value, Label: label(value), Selected: value == selected})
	}
	return options
}

// HandleRegisterView renders GET /register. The landing widget links here with
// the look of the habbo the visitor picked.
func (r *Router) HandleRegisterView(w http.ResponseWriter, req *http.Request) {
	query := req.URL.Query()
	page := registerPage{hotelStatus: r.hotelStatus(req.Context()), Refer: strings.TrimSpace(query.Get("refer"))}
	page.setBornOn(0, 0, 0)
	figure, gender := query.Get("figure"), strings.ToUpper(query.Get("gender"))
	if auth.ValidateLook(figure, gender) == nil {
		page.Figure, page.Gender = figure, gender
	}
	astro.WriteTemplate(w, r.deps.Resolver, "register.html", page)
}

// HandleRegister handles the POST /register action: it creates the account and
// signs the visitor in.
func (r *Router) HandleRegister(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	if err := req.ParseForm(); err != nil {
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		return
	}
	form := req.PostForm
	password := form.Get("password")
	page := registerPage{
		hotelStatus: r.hotelStatus(ctx),
		Habbo:       strings.TrimSpace(form.Get("name")),
		Email:       strings.TrimSpace(form.Get("email")),
		Newsletter:  form.Get("newsletter") != "",
		Terms:       form.Get("terms") != "",
		Figure:      form.Get("figure"),
		Gender:      form.Get("gender"),
		EditorState: form.Get("editorState"),
		Refer:       strings.TrimSpace(form.Get("refer")),
		Errors:      map[string]string{},
	}
	if page.Figure == "" {
		page.Figure = settings.GetString("registration.defaultFigure")
		page.Gender = settings.GetString("registration.defaultGender")
	}
	bornOn := page.readBornOn(form)

	ip := auth.ClientIP(req)
	allowed, err := r.registrationAllowed(ctx, ip)
	if err != nil {
		r.fail(w, err)
		return
	}
	if !allowed {
		page.Errors["form"] = "Too many habbos were registered from your connection. Please try again later."
		r.invalid(w, "register.html", page)
		return
	}

	page.validate(form)
	if err := r.checkTaken(ctx, &page); err != nil {
		r.fail(w, err)
		return
	}
	if len(page.Errors) > 0 {
		r.invalid(w, "register.html", page)
		return
	}

	err = r.createAccount(ctx, page, bornOn, auth.HashPassword(password), ip)
	if store.IsConflict(err) {
		// Someone took the name or the email since checkTaken.
		if err := r.checkTaken(ctx, &page); err != nil {
			r.fail(w, err)
			return
		}
		r.invalid(w, "register.html", page)
		return
	}
	if err != nil {
		r.fail(w, err)
		return
	}
	r.signIn(w, req, page.Habbo, password, false)
}

// readBornOn fills in the page's date selects from the form. An impossible date
// such as 31 February is reported as an error.
func (p *registerPage) readBornOn(form url.Values) time.Time {
	day, _ := strconv.Atoi(form.Get("day"))
	month, _ := strconv.Atoi(form.Get("month"))
	year, _ := strconv.Atoi(form.Get("year"))
	p.setBornOn(day, month, year)

	bornOn := time.Date(year, time.Month(month), day, 0, 0, 0, 0, time.UTC)
	if bornOn.Day() != day || int(bornOn.Month()) != month || auth.ValidateBornOn(bornOn) != nil {
		p.Errors["bornOn"] = "Please supply a valid date of birth."
	}
	return bornOn
}

// validate checks everything but what needs the database, with Holo's texts.
func (p *registerPage) validate(form url.Values) {
	if form.Get("password") != form.Get("passwordConfirm") {
		p.Errors["password"] = "The passwords do not match. Please try again."
	} else if auth.ValidatePassword(form.Get("password")) != nil {
		p.Errors["password"] = passwordLengthMessage()
	}
	if auth.ValidateEmail(p.Email) != nil {
		p.Errors["email"] = "Please supply a valid e-mail address."
	} else if p.Email != strings.TrimSpace(form.Get("emailConfirm")) {
		p.Errors["email"] = "The e-mail addresses don't match."
	}
	if !p.Terms {
		p.Errors["terms"] = "Please read and accept the Terms of Service to register."
	}
	if auth.ValidateLook(p.Figure, p.Gender) != nil {
		p.Errors["look"] = "An unknown error occurred. Please wait for the figure editor to load next time, or refresh if it doesn't."
	}
}

func passwordLengthMessage() string {
	return fmt.Sprintf("Your password must be %d to %d characters long.",
		settings.GetInt("auth.passwordMinLength"), settings.GetInt("auth.passwordMaxLength"))
}

func (r *Router) registrationAllowed(ctx context.Context, ip string) (bool, error) {
	window := time.Duration(settings.GetInt("registration.ipWindowHours")) * time.Hour
	count, err := r.deps.Queries.CountUsersCreatedFromIP(ctx, store.CountUsersCreatedFromIPParams{
		CreatedIP: ip,
		Since:     time.Now().UTC().Add(-window),
	})
	if err != nil {
		return false, err
	}
	return count < int64(settings.GetInt("registration.maxPerIp")), nil
}

// checkTaken reports a name that cannot be used or an email that has an account.
func (r *Router) checkTaken(ctx context.Context, page *registerPage) error {
	problem, err := r.nameProblem(ctx, page.Habbo)
	if err != nil {
		return err
	}
	if problem != "" {
		page.Errors["name"] = problem
	}
	switch _, err := r.deps.Queries.GetUserByEmail(ctx, page.Email); {
	case err == nil:
		page.Errors["email"] = "This e-mail address already has an account. Please sign in and add a habbo there."
	case !store.IsNotFound(err):
		return err
	}
	return nil
}

func (r *Router) createAccount(ctx context.Context, page registerPage, bornOn time.Time, hash, ip string) error {
	tx, err := r.deps.DB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	q := r.deps.Queries.WithTx(tx)

	userID, _, err := auth.CreateAccount(ctx, q, auth.Account{
		Email:        page.Email,
		BornOn:       bornOn,
		Newsletter:   page.Newsletter,
		IP:           ip,
		PasswordHash: hash,
		Habbo: auth.Habbo{
			Name:    page.Habbo,
			Figure:  page.Figure,
			Gender:  page.Gender,
			Credits: int64(settings.GetInt("registration.startCredits")),
			Detail:  "Welcome to " + settings.GetString("site.name") + "!",
		},
	})
	if err != nil {
		return err
	}
	if err := recordReferral(ctx, q, page.Refer, userID, page.Habbo); err != nil {
		return err
	}
	return tx.Commit()
}

// recordReferral writes the referral of a new user when the link named a habbo,
// and pays the referrer while referrals are enabled. Any other link is ignored,
// since a stale link must not stop the registration.
func recordReferral(ctx context.Context, q *store.Queries, refer string, userID int64, name string) error {
	if refer == "" {
		return nil
	}
	referrer, err := q.GetAvatarByName(ctx, refer)
	if store.IsNotFound(err) {
		return nil
	}
	if err != nil {
		return err
	}

	now := time.Now().UTC()
	var rewardedAt sql.NullTime
	if settings.GetBool("referral.enabled") {
		rewardedAt = sql.NullTime{Time: now, Valid: true}
		reward := int64(settings.GetInt("referral.reward"))
		err := q.AddWalletCredits(ctx, store.AddWalletCreditsParams{Credits: reward, UpdatedAt: now, AvatarID: referrer.ID})
		if err != nil {
			return err
		}
		err = q.CreateWalletTransaction(ctx, store.CreateWalletTransactionParams{
			AvatarID:  referrer.ID,
			Credits:   reward,
			Reason:    "referral",
			Detail:    name,
			CreatedAt: now,
		})
		if err != nil {
			return err
		}
	}
	return q.CreateReferral(ctx, store.CreateReferralParams{
		ReferredUserID:   userID,
		ReferrerAvatarID: referrer.ID,
		CreatedAt:        now,
		RewardedAt:       rewardedAt,
	})
}
