package router

import (
	"net/http"
	"net/url"

	"github.com/kronothepenguin/project-reborn/packages/settings"
)

type referralPage struct {
	accountPage
	ReferralLink string
	Reward       int
}

// HandleAccountReferralView renders GET /account/referral.
func (r *Router) HandleAccountReferralView(w http.ResponseWriter, req *http.Request) {
	ctx := req.Context()
	account, err := r.newAccountPage(ctx)
	if err != nil {
		r.fail(w, err)
		return
	}
	r.answer(w, "account/referral.html", false, referralPage{
		accountPage:  account,
		ReferralLink: settings.String(ctx, r.deps.Queries, "site.url") + "/register?refer=" + url.QueryEscape(account.Habbo),
		Reward:       settings.Int(ctx, r.deps.Queries, "referral.reward"),
	})
}
