package router

import (
	"encoding/xml"
	"io"
	"net/http"
	"net/url"

	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

const promoHabboCount = 10

type promoHabbos struct {
	XMLName xml.Name     `xml:"habbos"`
	Habbos  []promoHabbo `xml:"habbo"`
}

// promoHabbo carries figure and gender because the widget passes them on to the
// register page.
type promoHabbo struct {
	Image  string `xml:"image,attr"`
	Figure string `xml:"figure,attr"`
	Gender string `xml:"gender,attr"`
}

// HandleXMLPromoHabbos renders GET /xml/promo-habbos.xml, the random habbos of the
// landing widget.
func (r *Router) HandleXMLPromoHabbos(w http.ResponseWriter, req *http.Request) {
	if !settings.GetBool("features.landingPromo") {
		http.NotFound(w, req)
		return
	}
	avatars, err := r.deps.Queries.ListRandomAvatars(req.Context(), promoHabboCount)
	if err != nil {
		r.fail(w, err)
		return
	}

	imager := settings.GetString("imaging.avatarUrl")
	promo := promoHabbos{Habbos: make([]promoHabbo, len(avatars))}
	for i, avatar := range avatars {
		query := url.Values{
			"figure":         {avatar.Figure},
			"size":           {"b"},
			"direction":      {"4"},
			"head_direction": {"3"},
			"gesture":        {"sml"},
		}
		promo.Habbos[i] = promoHabbo{Image: imager + "?" + query.Encode(), Figure: avatar.Figure, Gender: avatar.Gender}
	}

	w.Header().Set("Content-Type", "application/xml; charset=utf-8")
	if _, err := io.WriteString(w, xml.Header); err != nil {
		r.fail(w, err)
		return
	}
	if err := xml.NewEncoder(w).Encode(promo); err != nil {
		r.fail(w, err)
	}
}
