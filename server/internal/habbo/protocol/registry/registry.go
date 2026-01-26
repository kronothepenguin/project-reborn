package registry

import "github.com/kronothepenguin/project-reborn/internal/habbo/protocol"

type Registry struct {
	Commands CommandRegistry
	Messages MessageRegistry
}

func New() *Registry {
	return &Registry{
		Commands: CommandRegistry{
			lookup: make(map[string]int16),
		},
		Messages: MessageRegistry{
			lookup: make(map[int16]protocol.Listener),
		},
	}
}

func (r *Registry) RegisterCommand(cmd string, opcode int16) {
	r.Commands.Register(cmd, opcode)
}

func (r *Registry) UnregisterCommand(cmd string) {
	r.Commands.Unregister(cmd)
}

func (r *Registry) RegisterListener(msg int16, fn protocol.Listener) {
	r.Messages.Register(msg, fn)
}

func (r *Registry) UnregisterListener(msg int16) {
	r.Messages.Unregister(msg)
}
