package registry

import (
	"errors"
	"io"
	"sync"

	"github.com/kronothepenguin/project-reborn/internal/habbo/protocol"
)

var ErrCommandNotFound = errors.New("command not found")

type CommandRegistry struct {
	lookup map[string]int16
	mu     sync.Mutex
}

func (r *CommandRegistry) Register(cmd string, opcode int16) {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.lookup[cmd] = opcode
}

func (r *CommandRegistry) Unregister(cmd string) {
	r.mu.Lock()
	defer r.mu.Unlock()

	delete(r.lookup, cmd)
}

func (r *CommandRegistry) Dispatch(w io.Writer, cmd string, args ...protocol.Argument) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	opcode, ok := r.lookup[cmd]
	if !ok {
		return ErrCommandNotFound
	}

	message := protocol.NewMessage()
	if err := protocol.WriteArgumentsTo(message, args...); err != nil {
		return err
	}

	packet := protocol.NewPacket(opcode, message)

	return protocol.WritePacket(w, packet)
}
