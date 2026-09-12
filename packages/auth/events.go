package auth

import (
	"context"
	"log/slog"
	"time"
)

// EventKind classifies a session lifecycle audit event.
type EventKind string

// Session lifecycle event kinds.
const (
	EventCreated   EventKind = "created"
	EventRotated   EventKind = "rotated"
	EventRevoked   EventKind = "revoked"
	EventLoggedOut EventKind = "logged_out"
	EventExpired   EventKind = "expired"
)

// Outcome is the result attached to an audit event.
type Outcome string

// Audit outcomes.
const (
	OutcomeOK     Outcome = "ok"
	OutcomeDenied Outcome = "denied"
)

// Event is a session lifecycle audit record. It never carries passwords,
// secrets, or raw credentials: SessionID is the lookup digest.
type Event struct {
	At        time.Time
	Kind      EventKind
	AccountID AccountID
	SessionID string
	Outcome   Outcome
	Address   string
	UserAgent string
}

// EventSink receives audit events. Sink failures never change the
// authentication outcome; the library logs them and continues.
type EventSink interface {
	Record(ctx context.Context, event Event) error
}

// slogDefaultSink is the default EventSink: structured records through
// log/slog.Default().
type slogDefaultSink struct{}

// Record writes the event through the default slog logger.
func (slogDefaultSink) Record(ctx context.Context, event Event) error {
	slog.Default().InfoContext(ctx, "auth event",
		slog.String("kind", string(event.Kind)),
		slog.Time("at", event.At),
		slog.Int64("account_id", int64(event.AccountID)),
		slog.String("session_id", event.SessionID),
		slog.String("outcome", string(event.Outcome)),
		slog.String("address", event.Address),
		slog.String("user_agent", event.UserAgent),
	)
	return nil
}

// emit fills in the event timestamp from the configured clock and hands the
// event to the sink. A failing sink is logged and never surfaced.
func emit(ctx context.Context, s settings, event Event) {
	if event.At.IsZero() {
		event.At = s.now()
	}
	if err := s.eventSink.Record(ctx, event); err != nil {
		slog.Default().ErrorContext(ctx, "auth: event sink failed",
			slog.String("kind", string(event.Kind)),
			slog.String("error", err.Error()),
		)
	}
}
