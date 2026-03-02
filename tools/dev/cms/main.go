package main

import (
	"log"
	"net/http"

	"github.com/kronothepenguin/project-reborn/internal/app/cms"
)

func main() {
	tmplpath := "./internal/pkg/tmpl"
	go watch(tmplpath)

	log.Println("CMS dev server starting...")
	log.Println("Watching:", tmplpath)

	server := http.Server{
		Addr:    "localhost:31337",
		Handler: cms.ServeMux(),
	}
	start(&server)
}
