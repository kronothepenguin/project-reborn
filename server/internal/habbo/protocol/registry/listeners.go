package registry

import (
	"errors"
	"sync"

	"github.com/kronothepenguin/project-reborn/internal/habbo/protocol"
)

var ErrListenerNotFound = errors.New("listener not found")

type MessageRegistry struct {
	lookup map[int16]protocol.Listener
	mu     sync.Mutex
}

func (r *MessageRegistry) Register(msg int16, fn protocol.Listener) {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.lookup[msg] = fn
}

func (r *MessageRegistry) Unregister(msg int16) {
	r.mu.Lock()
	defer r.mu.Unlock()

	delete(r.lookup, msg)
}

func (r *MessageRegistry) Handle(ctx protocol.Context, packet *protocol.Packet) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	handle, ok := r.lookup[packet.Cmd]
	if !ok {
		return ErrListenerNotFound
	}

	return handle(ctx, packet)
}
