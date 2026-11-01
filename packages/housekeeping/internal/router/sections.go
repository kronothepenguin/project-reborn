package router

import (
	"slices"
	"strconv"
	"strings"

	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

const (
	kindText     = "text"
	kindNumber   = "number"
	kindToggle   = "toggle"
	kindPassword = "password"
)

// section is one settings form. Forms have Holo's texts where Holo had the form.
type section struct {
	ID     string
	Menu   string
	Title  string
	Button string
	// Content puts the form in the menu's Content Management box.
	Content bool
	Fields  []field
}

type field struct {
	Key      string
	Label    string
	Help     string
	Kind     string
	Value    string
	On       bool
	OnLabel  string
	OffLabel string
	Required bool
}

// hiddenSettings have no form: cms.refresh has no reader until the IPC design
// decides its fate, and the note belongs to the dashboard.
var hiddenSettings = []string{"cms.refresh", noteKey}

const defaultButton = "Save Settings"

var forms = []section{
	{
		ID: "site", Menu: "General Configuration", Title: "Project Reborn Configuration", Button: "Save Configuration",
		Fields: []field{
			{Key: "site.name", Label: "Sitename", Help: "This is the full name of your site, eg. 'Holo Hotel'.", Required: true},
			{Key: "site.shortName", Label: "Shortname", Help: "This is the 'shortname' of your site, eg. 'Holo'.", Required: true},
			{Key: "site.url", Label: "Site Address", Help: "This is the address of your site, eg. 'https://hotel.example.com'. Reset mails link to it, and Housekeeping sends guests there to sign in.", Required: true},
		},
	},
	{
		ID: "maintenance", Menu: "Turn your site on/off", Title: "Turn your site on/off", Button: "Apply",
		Fields: []field{
			{Key: "site.maintenance", Label: "Close Site", Help: "If enabled, your site will be closed and show a maintenance page to regular users. Administrators can still login on that page.", OnLabel: "Site Closed", OffLabel: "Site Open"},
		},
	},
	{
		ID: "auth", Menu: "Sign-in and Sessions", Title: "Sign-in and Sessions", Button: defaultButton,
		Fields: []field{
			{Key: "auth.secureCookies", Label: "Secure Cookies", Help: "This sends the session cookie over HTTPS only. Disable it only for a hotel without HTTPS."},
			{Key: "auth.sessionIdleMinutes", Label: "Session Length", Help: "The minutes without a request after which a session ends."},
			{Key: "auth.rememberDays", Label: "Remember Me", Help: "The days a session lasts when the visitor asks to be remembered."},
			{Key: "auth.loginMaxFailures", Label: "Failed Sign-ins", Help: "The failed sign-ins after which an address or a user has to wait."},
			{Key: "auth.loginWindowMinutes", Label: "Failed Sign-in Window", Help: "The minutes during which failed sign-ins count."},
			{Key: "auth.passwordMinLength", Label: "Shortest Password", Help: "The fewest characters in a new password."},
			{Key: "auth.passwordMaxLength", Label: "Longest Password", Help: "The most characters in a new password."},
			{Key: "auth.resetTokenMinutes", Label: "Reset Link Lifetime", Help: "The minutes a password reset link works."},
			{Key: "auth.resetMaxActive", Label: "Reset Links Per Account", Help: "The most unexpired reset links an account can hold."},
		},
	},
	{
		ID: "registration", Menu: "Registration", Title: "Registration", Button: defaultButton,
		Fields: []field{
			{Key: "registration.startCredits", Label: "Start Credits", Help: "The credits a new habbo starts with."},
			{Key: "registration.maxPerIp", Label: "Habbos Per Address", Help: "The most habbos one address can register."},
			{Key: "registration.ipWindowHours", Label: "Address Window", Help: "The hours during which that limit counts."},
			{Key: "registration.defaultFigure", Label: "Default Figure", Help: "The look of a habbo registered without one."},
			{Key: "registration.defaultGender", Label: "Default Gender", Help: "M or F, for a habbo registered without one."},
		},
	},
	{
		ID: "referral", Menu: "Referrals", Title: "Referrals", Button: defaultButton,
		Fields: []field{
			{Key: "referral.enabled", Label: "Referrals Enabled", Help: "This determines whether a referral pays the habbo who referred."},
			{Key: "referral.reward", Label: "Referral Reward", Help: "The credits a referral pays."},
		},
	},
	{
		ID: "mail", Menu: "Mail", Title: "Mail", Button: defaultButton,
		Fields: []field{
			{Key: "mail.host", Label: "Mail Host", Help: "The host of the mail server. Without one, no mail goes out."},
			{Key: "mail.port", Label: "Mail Port", Help: "The port of the mail server."},
			{Key: "mail.username", Label: "Mail Username", Help: "The name to sign in to the mail server with."},
			{Key: "mail.password", Label: "Mail Password", Help: "The password to sign in to the mail server with. Leave it blank to keep the current one."},
			{Key: "mail.from", Label: "Mail Sender", Help: "The address mails come from."},
		},
	},
	{
		ID: "imaging", Menu: "Avatar Imaging", Title: "Avatar Imaging", Button: defaultButton,
		Fields: []field{
			{Key: "imaging.avatarUrl", Label: "Avatar Imager", Help: "The address that draws habbos, without a query."},
		},
	},
	{
		ID: "features", Menu: "Manage Site Content", Title: "Manage Content Options", Button: defaultButton, Content: true,
		Fields: []field{
			{Key: "features.landingPromo", Label: "Landing Promo Enabled", Help: "This determines whether the promo on the login page will be displayed. If disabled, the join button is shown."},
		},
	},
}

// sectionsOver lays out declared as forms. A setting the list above does not name
// still gets a form, with its key as its label, so that one declared later
// can be edited at once. Its Kind comes from its declaration, which is also how a
// secret stays masked: nothing here can show its value.
func sectionsOver(declared []settings.Setting) []section {
	byKey := make(map[string]settings.Setting, len(declared))
	for _, setting := range declared {
		byKey[setting.Key] = setting
	}

	sections := make([]section, 0, len(forms))
	listed := make(map[string]bool)
	for _, s := range forms {
		fields := make([]field, 0, len(s.Fields))
		for _, f := range s.Fields {
			if setting, ok := byKey[f.Key]; ok {
				listed[f.Key] = true
				fields = append(fields, filled(f, setting))
			}
		}
		s.Fields = fields
		sections = append(sections, s)
	}

	for _, setting := range declared {
		if listed[setting.Key] || slices.Contains(hiddenSettings, setting.Key) {
			continue
		}
		id, _, _ := strings.Cut(setting.Key, ".")
		at := slices.IndexFunc(sections, func(s section) bool { return s.ID == id })
		if at < 0 {
			sections = append(sections, section{ID: id, Menu: id, Title: id, Button: defaultButton})
			at = len(sections) - 1
		}
		sections[at].Fields = append(sections[at].Fields, filled(field{Key: setting.Key, Label: setting.Key}, setting))
	}
	return sections
}

func filled(f field, setting settings.Setting) field {
	if setting.Secret {
		f.Kind = kindPassword
		return f
	}
	switch value := setting.Value.(type) {
	case bool:
		f.Kind, f.On = kindToggle, value
		if f.OnLabel == "" {
			f.OnLabel, f.OffLabel = "Enabled", "Disabled"
		}
	case int:
		f.Kind, f.Value = kindNumber, strconv.Itoa(value)
	case string:
		f.Kind, f.Value = kindText, value
	}
	return f
}

func findSection(sections []section, id string) (section, bool) {
	at := slices.IndexFunc(sections, func(s section) bool { return s.ID == id })
	if at < 0 {
		return section{}, false
	}
	return sections[at], true
}
