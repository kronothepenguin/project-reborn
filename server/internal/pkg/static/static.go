package static

import (
	"embed"
)

//go:embed images/*
var StaticFS embed.FS
