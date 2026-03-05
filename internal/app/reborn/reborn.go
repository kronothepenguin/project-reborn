package habbo

import (
	"net/http"
	"strconv"

	"github.com/kronothepenguin/project-reborn/internal/pkg/dotenv"
	"github.com/kronothepenguin/project-reborn/internal/pkg/storage"
	_ "github.com/mattn/go-sqlite3"
)

type Reborn struct {
	http *http.Server

	storage *storage.Storage
}

func New() *Reborn {
	dotenv.Load()

	host := dotenv.GetenvString("HABBO_APP_HOST", "localhost")
	port := dotenv.GetenvInt("HABBO_APP_PORT", 31337) // 42071, 50021
	addr := host + ":" + strconv.Itoa(port)

	httpServer := http.Server{
		Addr: addr,
	}

	return &Reborn{
		http: &httpServer,
	}
}
