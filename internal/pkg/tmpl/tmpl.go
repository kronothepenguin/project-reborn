package tmpl

import (
	"embed"
	"fmt"
	"html/template"
	"io/fs"
)

//go:embed components/*.html pages/*.html
var tmplFS embed.FS

var tmpl = template.Must(template.New("").ParseFS(tmplFS, "components/*.html", "pages/*.html"))

func init() {
	fmt.Println(tmpl.DefinedTemplates())
}

func ReloadFS(fsys fs.FS) error {
	parsed, err := template.New("").ParseFS(fsys, "components/*.html", "pages/*.html")
	if err != nil {
		return err
	}
	tmpl = parsed
	return nil
}

func Lookup(name string) *template.Template {
	return tmpl.Lookup(name)
}
