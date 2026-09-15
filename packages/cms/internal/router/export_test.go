package router

import (
	"html/template"

	"github.com/kronothepenguin/project-reborn/packages/astro"
)

// testTemplates are the minimal built pages used by handler tests. Every
// runtime value the handlers pass appears as an unrendered [[ ]] placeholder.
var testTemplates = map[string]string{
	"index.html": `<!doctype html><html><body>
<main>
  <p id="online">[[ .Online ]]</p>
  <p id="status">[[ if .IsUp ]]online[[ else ]]offline[[ end ]]</p>
  <p id="terms">[[ .TermsURL ]]</p>
  <p id="privacy">[[ .PrivacyURL ]]</p>
  <form method="post">
    <input id="username" name="username" value="[[ .Values.Username ]]">
    <p id="username-error">[[ .Errors.Username ]]</p>
    <p id="password-error">[[ .Errors.Password ]]</p>
    <p id="general-error">[[ .Errors.General ]]</p>
  </form>
</main>
</body></html>`,
	"me.html": `<!doctype html><html><body><h1 id="username">[[ .Username ]]</h1></body></html>`,
}

// NewTestResolver returns a resolver that serves the inline test templates so
// handler tests exercise the data shape without a frontend build.
func NewTestResolver() astro.Resolver {
	return func(name string) (*template.Template, error) {
		source, ok := testTemplates[name]
		if !ok {
			source = "<!doctype html><html><body></body></html>"
		}
		return template.New(name).Delims("[[", "]]").Parse(source)
	}
}
