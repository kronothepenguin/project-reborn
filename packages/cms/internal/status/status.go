// Package status reports the game server's availability and online count for
// the public hotel header.
package status

import "context"

// Status is the game server snapshot shown on the public header.
type Status struct {
	Up     bool
	Online int
}

// Provider yields the current status; implementations may query a game server
// or return sample values.
type Provider interface {
	Snapshot(ctx context.Context) (Status, error)
}

// Sample reports a fixed online snapshot until the game-server integration
// exists (research R9).
type Sample struct{}

// Snapshot returns the sample up/online values.
func (Sample) Snapshot(context.Context) (Status, error) {
	return Status{Up: true, Online: 12345}, nil
}
