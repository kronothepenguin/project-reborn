package protocol

import (
	"errors"
	"sync"
)

type CommandRegistry interface {
	Register(cmd string, opcode int16)
	Unregister(cmd string)

	Build(cmd string, args ...Argument) (*Packet, error)
}

var ErrCommandNotFound = errors.New("command not found")

type commandRegistryImpl struct {
	lookup map[string]int16
	mu     sync.Mutex
}

func newCommandRegistryImpl() *commandRegistryImpl {
	return &commandRegistryImpl{
		lookup: make(map[string]int16),
	}
}

func (r *commandRegistryImpl) Register(cmd string, opcode int16) {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.lookup[cmd] = opcode
}

func (r *commandRegistryImpl) Unregister(cmd string) {
	r.mu.Lock()
	defer r.mu.Unlock()

	delete(r.lookup, cmd)
}

func (r *commandRegistryImpl) Build(cmd string, args ...Argument) (*Packet, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	opcode, ok := r.lookup[cmd]
	if !ok {
		return nil, ErrCommandNotFound
	}

	message := NewMessage()
	if err := WriteArgumentsTo(message, args...); err != nil {
		return nil, err
	}

	return NewPacket(opcode, message), nil
}

type Listener func(*Packet) error

type MessageRegistry interface {
	Register(msg int16, cb Listener)
	Unregister(msg int16)

	Handle(*Packet) error
}

var ErrListenerNotFound = errors.New("listener not found")

type messageRegistryImpl struct {
	lookup map[int16]Listener
	mu     sync.Mutex
}

func newMessageRegistryImpl() *messageRegistryImpl {
	return &messageRegistryImpl{
		lookup: make(map[int16]Listener),
	}
}

func (r *messageRegistryImpl) Register(msg int16, fn Listener) {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.lookup[msg] = fn
}

func (r *messageRegistryImpl) Unregister(msg int16) {
	r.mu.Lock()
	defer r.mu.Unlock()

	delete(r.lookup, msg)
}

func (r *messageRegistryImpl) Handle(packet *Packet) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	handle, ok := r.lookup[packet.Command]
	if !ok {
		return ErrListenerNotFound
	}

	return handle(packet)
}

type Registry interface {
	Commands() CommandRegistry

	Listeners() MessageRegistry
}

type registryImpl struct {
	commands  CommandRegistry
	listeners MessageRegistry
}

func (r *registryImpl) Commands() CommandRegistry {
	return r.commands
}

func (r *registryImpl) Listeners() MessageRegistry {
	return r.listeners
}

func NewRegistry() Registry {
	return &registryImpl{
		commands:  newCommandRegistryImpl(),
		listeners: newMessageRegistryImpl(),
	}
}
