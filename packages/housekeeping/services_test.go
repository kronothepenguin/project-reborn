package housekeeping

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
	h := New(openDB(t), WithResolver(printPage), WithStatic(printPath("static")))
	if got := h.deps().Habbos; got != nil {
		t.Errorf("before Inject the router got the Habbos service %v, want none", got)
	}

	habbos := &recordingHabbos{}
	h.Inject(Services{Habbos: habbos})
	if got := h.deps().Habbos; got != habbos {
		t.Errorf("after Inject the router got the Habbos service %v, want %v", got, habbos)
	}

	h.Mount(http.NewServeMux())
	if len(habbos.sent) != 0 {
		t.Errorf("the game was told of the habbos %v, want none", habbos.sent)
	}
}
