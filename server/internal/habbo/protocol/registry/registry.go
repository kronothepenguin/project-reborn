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

func (r *Registry) RegisterListener(msg int16, fn protocol.Listener) {

}

func (r *Registry) UnregisterListener(msg int16) {

}

func (r *Registry) RegisterCommand(cmd string, opcode int16) {}

func (r *Registry) UnregisterCommand(cmd string) {}
