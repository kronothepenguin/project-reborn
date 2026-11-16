package cms

import (
	"context"
	"database/sql"
	"embed"
	"fmt"
	"log/slog"
	"net/http"

	"github.com/kronothepenguin/project-reborn/packages/astro"
	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/cms/internal/router"
	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/scheduler"
	"github.com/kronothepenguin/project-reborn/packages/services"
	"github.com/kronothepenguin/project-reborn/packages/store"
)

//go:embed dist/*
var DistFS embed.FS

type CMS struct {
	db       *sql.DB
	updates  *store.UpdateCheck
	static   http.Handler
	resolve  astro.Resolver
	services Services
	// protect wraps every CMS route with RealIP, cross-origin protection and
	// the session, so that the CMS stays protected on a mux it shares.
	protect func(http.Handler) http.Handler
}

// Services tell the game server of the changes it must show live. A service
// left nil is absent, and the CMS skips its calls.
type Services struct {
	Habbos services.Habbos
}

type Option func(*CMS)

// New applies the automatic updates and schedules the clean-up of expired
// resets and sessions. It panics when the list of updates or the proxy section
// of config.json is broken: the CMS cannot serve without them.
func New(db *sql.DB, opts ...Option) *CMS {
	cfg := config.Get()
	list, err := store.Updates()
	if err != nil {
		panic(fmt.Errorf("cms: %w", err))
	}
	updates := store.NewUpdateCheck(db, list)
	if err := updates.ApplyAutomatic(context.Background()); err != nil {
		slog.Error("cms: the database could not be updated", "err", err)
	}
	realIP, err := auth.RealIP(cfg.Proxy)
	if err != nil {
		panic(fmt.Errorf("cms: %w", err))
	}
	crossOrigin := http.NewCrossOriginProtection()
	sessions := auth.Sessions(db)

	c := &CMS{
		db:      db,
		updates: updates,
		protect: func(h http.Handler) http.Handler {
			return realIP(crossOrigin.Handler(sessions(h)))
		},
	}
	for _, opt := range opts {
		opt(c)
	}
	scheduler.Every(1, scheduler.Minute, updates.WhenCurrent(func(ctx context.Context) error {
		return auth.DeleteExpiredResets(ctx, db)
	}))
	scheduler.Every(1, scheduler.Minute, updates.WhenCurrent(func(ctx context.Context) error {
		return auth.DeleteExpiredSessions(ctx, db)
	}))
	return c
}

// Inject hands the CMS its services, once, after New and before Mount: Mount
// gives the router the services the CMS holds then.
func (c *CMS) Inject(s Services) {
	c.services = s
}

func (c *CMS) deps() router.Deps {
	return router.Deps{Resolver: c.resolve, DB: c.db, Queries: store.New(c.db), Updates: c.updates, Habbos: c.services.Habbos}
}

func (c *CMS) Mount(mux *http.ServeMux) {
	r := router.New(c.deps())
	guard := func(h http.Handler) http.Handler { return r.UpdateFailed(c.protect(h)) }
	page := func(h http.Handler) http.Handler { return guard(r.Banned(r.Maintenance(h))) }
	guestPage := func(h http.HandlerFunc) http.Handler { return page(router.Guest(h)) }

	mux.Handle("GET /{$}", guestPage(r.HandleIndexView))
	mux.Handle("GET /xml/promo-habbos.xml", page(http.HandlerFunc(r.HandlePromoHabbosXML)))
	// Signing in and out stays open during maintenance, for staff.
	mux.Handle("POST /{$}", guard(router.Guest(http.HandlerFunc(r.HandleIndexLogin))))
	mux.Handle("POST /logout", guard(r.Banned(http.HandlerFunc(r.HandleLogout))))
	mux.Handle("GET /logout", page(http.HandlerFunc(r.HandleLogoutView)))

	mux.Handle("GET /me", page(auth.RequireSession(http.HandlerFunc(r.HandleMeView))))
	mux.Handle("GET /me/groups", page(auth.RequireSession(http.HandlerFunc(r.HandleMeGroupsJSON))))
	mux.Handle("POST /me/motto", page(auth.RequireSession(http.HandlerFunc(r.HandleMeMotto))))
	mux.Handle("POST /me/alerts/{id}/dismiss", page(auth.RequireSession(http.HandlerFunc(r.HandleMeAlertsDismiss))))

	account := func(h http.HandlerFunc) http.Handler { return page(auth.RequireSession(h)) }
	mux.Handle("GET /account", account(r.HandleAccountRedirect))
	mux.Handle("GET /account/looks", account(r.HandleAccountLooksView))
	mux.Handle("POST /account/looks", account(r.HandleAccountLooksSave))
	mux.Handle("POST /account/looks/wardrobe/{slot}", account(r.HandleAccountLooksWardrobeStore))
	mux.Handle("GET /account/profile", account(r.HandleAccountProfileView))
	mux.Handle("POST /account/profile", account(r.HandleAccountProfileSave))
	mux.Handle("GET /account/email", account(r.HandleAccountEmailView))
	mux.Handle("POST /account/email", account(r.HandleAccountEmailSave))
	mux.Handle("GET /account/password", account(r.HandleAccountPasswordView))
	mux.Handle("POST /account/password", account(r.HandleAccountPasswordSave))
	mux.Handle("GET /account/referral", account(r.HandleAccountReferralView))
	mux.Handle("GET /account/habbos", account(r.HandleAccountHabbosView))
	mux.Handle("POST /account/habbos", account(r.HandleAccountHabbosAdd))
	mux.Handle("POST /account/habbos/{id}/switch", account(r.HandleAccountHabbosSwitch))
	mux.Handle("POST /account/habbos/{id}/archive", account(r.HandleAccountHabbosArchive))
	mux.Handle("GET /account/furni", account(r.HandleAccountFurniView))
	mux.Handle("POST /account/furni/take", account(r.HandleAccountFurniTake))

	mux.Handle("GET /home", page(http.HandlerFunc(r.HandleHomeSearchView)))
	mux.Handle("GET /home/{name}", page(http.HandlerFunc(r.HandleHomeView)))
	mux.Handle("GET /home/{name}/edit", page(auth.RequireSession(http.HandlerFunc(r.HandleHomeEditView))))
	mux.Handle("GET /home-store", page(auth.RequireSession(http.HandlerFunc(r.HandleHomeStoreJSON))))
	mux.Handle("GET /home-store/categories/{id}", page(auth.RequireSession(http.HandlerFunc(r.HandleHomeStoreCategoryJSON))))
	mux.Handle("POST /home-store/items/{id}/purchase", page(auth.RequireSession(http.HandlerFunc(r.HandleHomeStoreItemsPurchase))))
	mux.Handle("GET /me/inventory", page(auth.RequireSession(http.HandlerFunc(r.HandleMeInventoryJSON))))
	mux.Handle("POST /bbcode/preview", page(auth.RequireSession(http.HandlerFunc(r.HandleBBCodePreview))))
	mux.Handle("POST /me/tags", page(auth.RequireSession(http.HandlerFunc(r.HandleMeTagsAdd))))
	mux.Handle("POST /me/tags/{tag}/delete", page(auth.RequireSession(http.HandlerFunc(r.HandleMeTagsDelete))))
	mux.Handle("POST /homes/{id}/layout", page(auth.RequireSession(http.HandlerFunc(r.HandleHomesLayoutSave))))
	mux.Handle("POST /homes/{id}/items", page(auth.RequireSession(http.HandlerFunc(r.HandleHomesItemsPlace))))
	mux.Handle("POST /homes/{id}/items/{item}/skin", page(auth.RequireSession(http.HandlerFunc(r.HandleHomesItemsSkin))))
	mux.Handle("POST /homes/{id}/items/{item}/delete", page(auth.RequireSession(http.HandlerFunc(r.HandleHomesItemsDelete))))

	mux.Handle("GET /forum", page(http.HandlerFunc(r.HandleForumView)))
	mux.Handle("GET /forum/threads/{id}", page(http.HandlerFunc(r.HandleForumThreadsView)))
	mux.Handle("POST /forum/threads", page(auth.RequireSession(http.HandlerFunc(r.HandleForumThreadsCreate))))
	mux.Handle("POST /forum/threads/{id}/posts", page(auth.RequireSession(http.HandlerFunc(r.HandleForumThreadsPostsCreate))))
	mux.Handle("GET /forum/threads/{id}/settings", page(auth.RequireSession(http.HandlerFunc(r.HandleForumThreadsSettingsJSON))))
	mux.Handle("POST /forum/threads/{id}/settings", page(auth.RequireSession(http.HandlerFunc(r.HandleForumThreadsSettingsSave))))
	mux.Handle("POST /forum/threads/{id}/delete", page(auth.RequireSession(http.HandlerFunc(r.HandleForumThreadsDelete))))
	mux.Handle("POST /forum/posts/{id}", page(auth.RequireSession(http.HandlerFunc(r.HandleForumPostsEdit))))
	mux.Handle("POST /forum/posts/{id}/delete", page(auth.RequireSession(http.HandlerFunc(r.HandleForumPostsDelete))))
	mux.Handle("GET /forum/posts/{id}/report", page(auth.RequireSession(http.HandlerFunc(r.HandleForumPostsReportView))))
	mux.Handle("POST /forum/posts/{id}/report", page(auth.RequireSession(http.HandlerFunc(r.HandleForumPostsReport))))
	mux.Handle("GET /help", page(auth.RequireSession(http.HandlerFunc(r.HandleHelpView))))
	mux.Handle("POST /help", page(auth.RequireSession(http.HandlerFunc(r.HandleHelpSend))))

	mux.Handle("GET /credits", page(http.HandlerFunc(r.HandleCreditsView)))
	mux.Handle("POST /credits/vouchers", page(auth.RequireSession(http.HandlerFunc(r.HandleCreditsVouchersRedeem))))
	mux.Handle("GET /credits/transactions", page(auth.RequireSession(http.HandlerFunc(r.HandleCreditsTransactionsView))))

	mux.Handle("GET /register", guestPage(r.HandleRegisterView))
	mux.Handle("POST /register", guestPage(r.HandleRegister))
	mux.Handle("POST /register/check-name", page(http.HandlerFunc(r.HandleRegisterCheckName)))

	mux.Handle("GET /forgot", page(http.HandlerFunc(r.HandleForgotView)))
	mux.Handle("POST /forgot", page(http.HandlerFunc(r.HandleForgotSend)))
	mux.Handle("GET /reset/{token}", guestPage(r.HandleResetView))
	mux.Handle("POST /reset/{token}", guestPage(r.HandleResetSave))

	mux.Handle("GET /community", page(http.HandlerFunc(r.HandleCommunityView)))
	mux.Handle("GET /staff", page(http.HandlerFunc(r.HandleStaffView)))
	mux.Handle("GET /tags", page(http.HandlerFunc(r.HandleTagsView)))
	mux.Handle("POST /tags", page(auth.RequireSession(http.HandlerFunc(r.HandleTagsAdd))))
	mux.Handle("POST /tags/fight", page(http.HandlerFunc(r.HandleTagsFight)))

	mux.Handle("GET /news", page(http.HandlerFunc(r.HandleNewsView)))
	mux.Handle("GET /news/{id}", page(http.HandlerFunc(r.HandleNewsArticleView)))
	mux.Handle("GET /news/images/{file}", page(http.HandlerFunc(r.HandleNewsImagesImage)))

	mux.Handle("GET /habbo-imaging/badge/{code}", page(http.HandlerFunc(r.HandleHabboImagingBadgeImage)))
	mux.Handle("POST /groups", page(auth.RequireSession(http.HandlerFunc(r.HandleGroupsPurchase))))
	mux.Handle("GET /groups/random", page(http.HandlerFunc(r.HandleGroupsRandomJSON)))
	mux.Handle("GET /groups", page(http.HandlerFunc(r.HandleGroupsSearchView)))
	mux.Handle("GET /groups/{id}", page(http.HandlerFunc(r.HandleGroupsView)))
	mux.Handle("POST /groups/{id}/join", page(auth.RequireSession(http.HandlerFunc(r.HandleGroupsJoin))))
	mux.Handle("POST /groups/{id}/leave", page(auth.RequireSession(http.HandlerFunc(r.HandleGroupsLeave))))
	mux.Handle("POST /groups/{id}/favourite", page(auth.RequireSession(http.HandlerFunc(r.HandleGroupsFavourite))))
	mux.Handle("POST /groups/{id}/unfavourite", page(auth.RequireSession(http.HandlerFunc(r.HandleGroupsUnfavourite))))
	mux.Handle("POST /groups/{id}/settings", page(auth.RequireSession(http.HandlerFunc(r.HandleGroupsSettingsSave))))
	mux.Handle("POST /groups/{id}/delete", page(auth.RequireSession(http.HandlerFunc(r.HandleGroupsDelete))))
	mux.Handle("GET /groups/{id}/edit", page(auth.RequireSession(http.HandlerFunc(r.HandleGroupsEditView))))
	mux.Handle("GET /groups/{id}/info", page(http.HandlerFunc(r.HandleGroupsInfoJSON)))
	mux.Handle("POST /groups/{id}/badge", page(auth.RequireSession(http.HandlerFunc(r.HandleGroupsBadgeSave))))
	mux.Handle("GET /groups/{id}/members", page(auth.RequireSession(http.HandlerFunc(r.HandleGroupsMembersJSON))))
	mux.Handle("POST /groups/{id}/members/{member}/{action}", page(auth.RequireSession(http.HandlerFunc(r.HandleGroupsMembersAction))))

	mux.Handle("GET /club", page(http.HandlerFunc(r.HandleClubView)))
	mux.Handle("POST /club/subscriptions", page(auth.RequireSession(http.HandlerFunc(r.HandleClubSubscriptionsPurchase))))

	mux.Handle("GET /disclaimer", page(http.HandlerFunc(r.HandleDisclaimerView)))
	mux.Handle("GET /privacy", page(http.HandlerFunc(r.HandlePrivacyView)))

	mux.Handle("/", c.static)
}

func WithStatic(h http.Handler) Option {
	return func(c *CMS) {
		c.static = h
	}
}

func WithResolver(r astro.Resolver) Option {
	return func(c *CMS) {
		c.resolve = r
	}
}
