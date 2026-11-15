package router

import (
	"net/http"
	"net/url"

	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

type referralPage struct {
	accountPage
	ReferralLink string
	Reward       int
}

// HandleAccountReferralView renders GET /account/referral.
func (r *Router) HandleAccountReferralView(w http.ResponseWriter, req *http.Request) {
	account, err := r.newAccountPage(req.Context())
	if err != nil {
		r.fail(w, err)
		return
	}
	r.answer(w, "account/referral.html", false, referralPage{
		accountPage:  account,
		ReferralLink: settings.GetString("site.url") + "/register?refer=" + url.QueryEscape(account.Habbo),
		Reward:       settings.GetInt("referral.reward"),
	})
}
