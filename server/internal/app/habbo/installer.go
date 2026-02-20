package habbo

import (
	"io"
	"net/http"
)

func createInstallationHandler(done chan struct{}) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /", handleIndex)

	return mux
}

func handleIndex(w http.ResponseWriter, r *http.Request) {
	io.WriteString(w, "Hello there!")
}
