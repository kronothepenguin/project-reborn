package installer

import (
	"encoding/json"
	"html/template"
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"strings"
	"testing"

	"github.com/kronothepenguin/project-reborn/packages/config"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// printData stands in for the built pages: it prints the page data, so the
// test can read what a handler passed to its template.
func printData(name string) (*template.Template, error) {
	return template.New(name).Delims("[[", "]]").Parse(`[[ printf "%+v" . ]]`)
}

func TestInstallation(t *testing.T) {
	t.Chdir(t.TempDir())
	i, err := New(t.Context(), WithResolver(printData), WithStatic(http.NotFoundHandler()))
	if err != nil {
		t.Fatalf("New: %v", err)
	}
	t.Cleanup(func() {
		if installation, ok := i.setup.Current(); ok {
			installation.DB.Close()
		}
	})
	mux := http.NewServeMux()
	i.Mount(mux)

	site := url.Values{
		"name":            {"Reborn Hotel"},
		"shortName":       {"Reborn"},
		"url":             {"https://hotel.example.com"},
		"housekeepingUrl": {"http://localhost:18400/housekeeping"},
		"startCredits":    {"750"},
	}
	admin := url.Values{
		"name":            {"Admin-1"},
		"email":           {"admin@example.com"},
		"bornOn":          {"1990-05-01"},
		"password":        {"secret123"},
		"passwordConfirm": {"secret123"},
	}
	with := func(form url.Values, key, value string) url.Values {
		changed := url.Values{}
		for k, v := range form {
			changed[k] = v
		}
		changed.Set(key, value)
		return changed
	}

	for _, c := range []struct {
		name     string
		method   string
		path     string
		form     url.Values
		status   int
		location string
		body     string
	}{
		{"status before configuring", "GET", "/", nil, 200, "", "Configured:false Installed:false"},
		{"status links nowhere before installing", "GET", "/", nil, 200, "", "SiteURL:}"},
		{"site before configuring", "GET", "/site", nil, 303, "/config", ""},
		{"admin before configuring", "POST", "/admin", admin, 303, "/config", ""},
		{"done before installing", "GET", "/done", nil, 303, "/", ""},
		{"config form", "GET", "/config", nil, 200, "", "Path:habbo.db Port:17387 HousekeepingPort:18465"},
		{"port that is not a number", "POST", "/config", url.Values{"path": {"habbo.db"}, "port": {"abc"}, "housekeepingPort": {"18400"}}, 422, "", "The hotel port must be a number."},
		{"housekeeping port that is not a number", "POST", "/config", url.Values{"path": {"habbo.db"}, "port": {"17400"}, "housekeepingPort": {"abc"}}, 422, "", "The housekeeping port must be a number."},
		{"port out of range", "POST", "/config", url.Values{"path": {"habbo.db"}, "port": {"70000"}, "housekeepingPort": {"18400"}}, 422, "", "cms.port: must be between 1 and 65535"},
		{"housekeeping port out of range", "POST", "/config", url.Values{"path": {"habbo.db"}, "port": {"17400"}, "housekeepingPort": {"70000"}}, 422, "", "housekeeping.port: must be between 1 and 65535"},
		{"write config", "POST", "/config", url.Values{"path": {"habbo.db"}, "port": {"17400"}, "housekeepingPort": {"18400"}}, 303, "/site", ""},
		{"config written", "GET", "/config", nil, 200, "", "Written:true"},
		{"config shows the ports", "GET", "/config", nil, 200, "", "Port:17400 HousekeepingPort:18400"},
		{"config again", "POST", "/config", url.Values{"path": {"other.db"}, "port": {"17401"}, "housekeepingPort": {"18401"}}, 303, "/config", ""},
		{"site form", "GET", "/site", nil, 200, "", "Name:Holo Hotel ShortName:Holo URL:http://localhost:17387 HousekeepingURL:http://localhost:18400/housekeeping StartCredits:500 SecureCookies:true"},
		{"a bad housekeeping address", "POST", "/site", with(site, "housekeepingUrl", "nowhere"), 422, "", "Housekeeping address: must be a path or an http or https URL"},
		{"site URL with a path", "POST", "/site", with(site, "url", "https://hotel.example.com/cms"), 422, "", "Site URL: must be an http or https origin"},
		{"start credits out of range", "POST", "/site", with(site, "startCredits", "-1"), 422, "", "Start credits: must be between 0 and 1000000"},
		{"save site", "POST", "/site", site, 303, "/admin", ""},
		{"admin form", "GET", "/admin", nil, 200, "", "PasswordHelp:6 to 25 characters"},
		{"passwords differ", "POST", "/admin", with(admin, "passwordConfirm", "secret124"), 422, "", "The passwords do not match."},
		{"missing birth date", "POST", "/admin", with(admin, "bornOn", ""), 422, "", "Enter the birth date."},
		{"habbo name with a space", "POST", "/admin", with(admin, "name", "Admin One"), 422, "", "Habbo names are 1 to 24 letters"},
		{"short password", "POST", "/admin", with(with(admin, "password", "short"), "passwordConfirm", "short"), 422, "", "Passwords are 6 to 25 characters."},
		{"create administrator", "POST", "/admin", admin, 303, "/done", ""},
		{"done", "GET", "/done", nil, 200, "", "habbo.db"},
		{"done links to the hotel", "GET", "/done", nil, 200, "", "SiteURL:https://hotel.example.com}"},
		{"status after installing", "GET", "/", nil, 200, "", "Installed:true ConfigPath:"},
		{"status links to the hotel", "GET", "/", nil, 200, "", "SiteURL:https://hotel.example.com}"},
		{"config after installing", "GET", "/config", nil, 303, "/", ""},
		{"site after installing", "POST", "/site", site, 303, "/", ""},
		{"admin after installing", "POST", "/admin", admin, 303, "/", ""},
	} {
		var body io.Reader
		if c.form != nil {
			body = strings.NewReader(c.form.Encode())
		}
		r := httptest.NewRequest(c.method, c.path, body)
		if c.form != nil {
			r.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		}
		rec := httptest.NewRecorder()
		mux.ServeHTTP(rec, r)

		if rec.Code != c.status || rec.Header().Get("Location") != c.location {
			t.Fatalf("%s: %d to %q, want %d to %q\n%s", c.name, rec.Code, rec.Header().Get("Location"), c.status, c.location, rec.Body)
		}
		if !strings.Contains(rec.Body.String(), c.body) {
			t.Fatalf("%s: body %q lacks %q", c.name, rec.Body, c.body)
		}
	}

	if settings.GetString("site.name") != "Reborn Hotel" || settings.GetString("site.url") != "https://hotel.example.com" ||
		settings.GetInt("registration.startCredits") != 750 || settings.GetBool("auth.secureCookies") {
		t.Errorf("settings after the site step: name %q, url %q, start credits %d, secure cookies %t",
			settings.GetString("site.name"), settings.GetString("site.url"), settings.GetInt("registration.startCredits"), settings.GetBool("auth.secureCookies"))
	}

	data, err := os.ReadFile(config.Filename)
	if err != nil {
		t.Fatalf("read %s: %v", config.Filename, err)
	}
	var written config.Config
	if err := json.Unmarshal(data, &written); err != nil {
		t.Fatalf("decode %s: %v", config.Filename, err)
	}
	if written.Housekeeping.Host != "localhost" || written.Housekeeping.Port != 18400 {
		t.Errorf("%s holds housekeeping %+v, want the default host and the form's port", config.Filename, written.Housekeeping)
	}
}
