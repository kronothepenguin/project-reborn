package habbo

import (
	"net/http"

	"github.com/kronothepenguin/project-reborn/internal/app/habbo/game"
	"github.com/kronothepenguin/project-reborn/internal/app/habbo/storage"
	"github.com/kronothepenguin/project-reborn/internal/app/habbo/virtual"
)

type Habbo struct {
	httpServer *http.Server
	Server     *game.Server
	Storage    *storage.Storage
	Hotel      *virtual.Hotel
}

func New() *Habbo {
	return nil
}

func (h *Habbo) Run() error {
	return nil
}

func (h *Habbo) startHTTPServer() {

}

func (h *Habbo) startTCPServer() {

}
