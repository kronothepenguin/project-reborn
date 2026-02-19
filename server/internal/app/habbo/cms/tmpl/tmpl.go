package tmpl

import (
	"embed"
	"fmt"
	"html/template"
)

//go:embed components/*.html pages/*.html
var tmplFS embed.FS

var tmpl = template.Must(template.New("").ParseFS(tmplFS, "components/*.html", "pages/*.html"))

func init() {
	fmt.Println(tmpl.DefinedTemplates())
}

func Lookup(name string) *template.Template {
	return tmpl.Lookup(name)
}
