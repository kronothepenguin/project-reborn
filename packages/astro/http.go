package astro

import (
	"net/http"
)

func WriteTemplate(w http.ResponseWriter, resolve Resolver, name string, data any) {
	t, err := resolve(name)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := t.Execute(w, data); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}
