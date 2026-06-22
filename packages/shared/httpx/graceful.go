package httpx

import (
	"context"
	"errors"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"golang.org/x/sync/errgroup"
)

func ListenAndServeWithGracefulShutdown(server *http.Server) (err error) {
	g := new(errgroup.Group)
	g.Go(func() error {
		err := server.ListenAndServe()
		if errors.Is(err, http.ErrServerClosed) {
			return nil
		}
		return err
	})

	sigchan := make(chan os.Signal, 1)
	signal.Notify(sigchan, syscall.SIGINT, syscall.SIGTERM)
	<-sigchan

	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()

	return errors.Join(
		server.Shutdown(ctx),
		g.Wait(),
	)
}
