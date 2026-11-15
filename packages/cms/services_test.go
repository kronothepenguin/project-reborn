package cms

import (
	"context"
	"net/http"
	"testing"
)

// recordingHabbos stands in for the game: it records the habbos it is told of.
type recordingHabbos struct {
	sent []int64
}

func (h *recordingHabbos) SendLook(_ context.Context, avatarID int64) error {
	h.sent = append(h.sent, avatarID)
	return nil
}

func TestInjectHandsTheServicesToTheRouter(t *testing.T) {
	c := New(openDB(t), WithResolver(printPage), WithStatic(http.NotFoundHandler()))
	if got := c.deps().Habbos; got != nil {
		t.Errorf("before Inject the router got the Habbos service %v, want none", got)
	}

	habbos := &recordingHabbos{}
	c.Inject(Services{Habbos: habbos})
	if got := c.deps().Habbos; got != habbos {
		t.Errorf("after Inject the router got the Habbos service %v, want %v", got, habbos)
	}

	c.Mount(http.NewServeMux())
	if len(habbos.sent) != 0 {
		t.Errorf("the game was told of the habbos %v, want none", habbos.sent)
	}
}
