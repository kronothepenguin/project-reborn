package tmpl

import (
	"context"
	"html/template"
)

type ctxKey struct{}

var key ctxKey = ctxKey{}

func From(ctx context.Context) *template.Template {
	return ctx.Value(key).(*template.Template)
}
