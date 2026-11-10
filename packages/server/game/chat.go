package game

import (
	"context"
	"database/sql"
	"fmt"
	"log/slog"
	"slices"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/kronothepenguin/project-reborn/packages/auth"
	"github.com/kronothepenguin/project-reborn/packages/store"
	"github.com/kronothepenguin/project-reborn/packages/virtual/habbo"
	"github.com/kronothepenguin/project-reborn/packages/virtual/room"
	"github.com/kronothepenguin/project-reborn/packages/virtual/settings"
)

// ChatKind is how a line is said.
type ChatKind int

const (
	ChatSay ChatKind = iota
	ChatWhisper
	ChatShout
)

// Chat tells a habbo a line said in its room: the speaker's index and the text, empty for a chat too far away to
// read (plans/server decision 0074).
type Chat struct {
	Index int
	Kind  ChatKind
	Text  string
}

// Typing tells the habbos in a room that the habbo of that index starts or stops typing.
type Typing struct {
	Index int
	On    bool
}

// The timed statuses of plans/server decision 0075.
const (
	gestureTime = 5 * time.Second
	waveTime    = 1500 * time.Millisecond
)

// gestures are the faces smileys show, in the order Holo's checkEmotion looked for them: the first face with a smiley
// in the line wins.
var gestures = []struct {
	face    string
	smileys []string
}{
	{"sml", []string{":)", ":D"}},
	{"agr", []string{">:(", ":@", ":/"}},
	{"sad", []string{":(", ":'("}},
	{"srp", []string{":o", ":O", ":0"}},
}

// Say says text in the habbo's room (CHAT): those within game.chatRange tiles each way read it, and the others see a
// bubble without the words (plans/server decision 0074).
func Say(ctx context.Context, db *sql.DB, viewer habbo.Habbo, text string) error {
	return speak(ctx, db, viewer, ChatSay, "", text)
}

// Shout shouts text to everyone in the habbo's room (SHOUT).
func Shout(ctx context.Context, db *sql.DB, viewer habbo.Habbo, text string) error {
	return speak(ctx, db, viewer, ChatShout, "", text)
}

// Whisper whispers text to the habbo named to in the same room (WHISPER): only the two read it, and nobody when to is
// not in the room, as Holo had it.
func Whisper(ctx context.Context, db *sql.DB, viewer habbo.Habbo, to, text string) error {
	return speak(ctx, db, viewer, ChatWhisper, to, text)
}

// speak cuts the line at game.chatMaxLength characters (plans/server decision 0078), saves it for staff (plans/server
// decision 0066), shows the speaker talking, and a smiley's face for a chat or a shout (plans/server decision 0075),
// ends its typing, and sends the line to those who read it. A habbo never gets the lines of a habbo it ignores.
func speak(ctx context.Context, db *sql.DB, viewer habbo.Habbo, kind ChatKind, to, text string) error {
	r, ok := room.In(viewer.ID)
	if !ok {
		return nil
	}
	text = cut(text, settings.GetIntOr("game.chatMaxLength", 100))
	occupants := r.Occupants()
	var target *room.Occupant
	if kind == ChatWhisper {
		for i, o := range occupants {
			if h, ok := habbo.Get(o.AvatarID); ok && strings.EqualFold(h.Name, to) {
				target = &occupants[i]
				break
			}
		}
	}
	if err := saveChat(ctx, db, viewer, r.Ref(), kind, target, text); err != nil {
		return err
	}

	now := time.Now()
	var me room.Occupant
	wasTyping := false
	if !r.Update(viewer.ID, func(o *room.Occupant) {
		talk := time.Duration(utf8.RuneCountInString(text)+50) * 30 * time.Millisecond
		o.Statuses = setStatus(o.Statuses, room.Status{Action: "talk", Until: now.Add(talk)})
		if face := gestureOf(text); face != "" && kind != ChatWhisper {
			o.Statuses = setStatus(o.Statuses, room.Status{Action: "gest", Parameters: face, Until: now.Add(gestureTime)})
		}
		wasTyping, o.Typing, o.Changed = o.Typing, false, true
		me = *o
	}) {
		return nil
	}
	if wasTyping {
		broadcast(r, Typing{Index: me.Index})
	}

	reach := settings.GetIntOr("game.chatRange", 5)
	for _, o := range occupants {
		listener, ok := habbo.Get(o.AvatarID)
		if !ok || slices.Contains(listener.Ignored, viewer.ID) {
			continue
		}
		line := Chat{Index: me.Index, Kind: kind, Text: text}
		switch kind {
		case ChatSay:
			if abs(o.X-me.X) > reach || abs(o.Y-me.Y) > reach {
				line.Text = ""
			}
		case ChatWhisper:
			if target == nil || (o.AvatarID != viewer.ID && o.AvatarID != target.AvatarID) {
				continue
			}
		}
		o.Session.Notify(line)
	}
	// Spectators watch the whole room, so they read every chat and shout (plans/server decision 0089).
	if kind != ChatWhisper {
		for _, w := range r.Waiting(room.Spectators) {
			if listener, ok := habbo.Get(w.AvatarID); ok && !slices.Contains(listener.Ignored, viewer.ID) {
				w.Session.Notify(Chat{Index: me.Index, Kind: kind, Text: text})
			}
		}
	}
	return nil
}

func saveChat(ctx context.Context, db *sql.DB, viewer habbo.Habbo, ref room.Ref, kind ChatKind, target *room.Occupant, text string) error {
	line := store.AddChatMessageParams{AvatarID: viewer.ID, Kind: [...]string{"chat", "whisper", "shout"}[kind], Text: text, SaidAt: time.Now().UTC()}
	id := sql.NullInt64{Int64: ref.ID, Valid: true}
	if ref.Public {
		line.PublicRoomID = id
	} else {
		line.RoomID = id
	}
	if target != nil {
		line.ToAvatarID = sql.NullInt64{Int64: target.AvatarID, Valid: true}
	}
	if err := store.New(db).AddChatMessage(ctx, line); err != nil {
		return fmt.Errorf("game: chat: %w", err)
	}
	return nil
}

// cut keeps the first n characters of text.
func cut(text string, n int) string {
	if utf8.RuneCountInString(text) <= n {
		return text
	}
	return string([]rune(text)[:n])
}

func gestureOf(text string) string {
	for _, g := range gestures {
		for _, smiley := range g.smileys {
			if strings.Contains(text, smiley) {
				return g.face
			}
		}
	}
	return ""
}

// setStatus puts s in place of the status of the same action.
func setStatus(statuses []room.Status, s room.Status) []room.Status {
	return append(without(statuses, s.Action), s)
}

// expire drops the statuses whose end is at or before now, and reports whether it dropped any.
func expire(statuses []room.Status, now time.Time) ([]room.Status, bool) {
	n := len(statuses)
	statuses = slices.DeleteFunc(statuses, func(s room.Status) bool { return !s.Until.IsZero() && !now.Before(s.Until) })
	return statuses, len(statuses) != n
}

// SetTyping tells the habbo's room that it starts or stops typing (USER_START_TYPING, USER_CANCEL_TYPING).
func SetTyping(viewer habbo.Habbo, on bool) {
	r, ok := room.In(viewer.ID)
	if !ok {
		return
	}
	var index int
	if !r.Update(viewer.ID, func(o *room.Occupant) { o.Typing, index = on, o.Index }) {
		return
	}
	broadcast(r, Typing{Index: index, On: on})
}

// Dance starts the habbo's dance (DANCE): the normal one, 0, for anyone, and the club dances 1 to 4 for the holders of
// fuse_use_club_dance, as Holo had it; never while it sits or lies.
func Dance(viewer habbo.Habbo, dance int) {
	if dance < 0 || dance > 4 || (dance > 0 && !hasFuse(viewer, auth.FuseUseClubDance)) {
		return
	}
	changeStatuses(viewer, func(o *room.Occupant) {
		if hasStatus(o, "sit") || hasStatus(o, "lay") {
			return
		}
		params := ""
		if dance > 0 {
			params = strconv.Itoa(dance)
		}
		o.Statuses, o.Changed = setStatus(o.Statuses, room.Status{Action: "dance", Parameters: params}), true
	})
}

// StopDancing ends the habbo's dance (STOP Dance).
func StopDancing(viewer habbo.Habbo) {
	changeStatuses(viewer, func(o *room.Occupant) {
		if hasStatus(o, "dance") {
			o.Statuses, o.Changed = without(o.Statuses, "dance"), true
		}
	})
}

// Wave makes the habbo wave for 1.5 s, which stops its dance (WAVE), unless it waves already (plans/server decision
// 0075).
func Wave(viewer habbo.Habbo) {
	until := time.Now().Add(waveTime)
	changeStatuses(viewer, func(o *room.Occupant) {
		if hasStatus(o, "wave") {
			return
		}
		o.Statuses = setStatus(without(o.Statuses, "dance"), room.Status{Action: "wave", Until: until})
		o.Changed = true
	})
}

func changeStatuses(viewer habbo.Habbo, change func(o *room.Occupant)) {
	if r, ok := room.In(viewer.ID); ok {
		r.Update(viewer.ID, change)
	}
}

func hasStatus(o *room.Occupant, action string) bool {
	return slices.ContainsFunc(o.Statuses, func(s room.Status) bool { return s.Action == action })
}

// IgnoreResult is what an ignore did, as the client's ignore list tells it.
type IgnoreResult int

const (
	IgnoreFailed IgnoreResult = iota
	IgnoreAdded
	IgnoreAddedOldestDropped
	IgnoreRemoved
)

// Ignore puts the habbo name on the viewer's ignore list (IGNOREUSER), whose lines the viewer no longer gets. A list
// that holds game.maxIgnoredHabbos habbos drops its oldest first (plans/server decision 0076). Nobody ignores itself,
// or a habbo that does not exist.
func Ignore(ctx context.Context, db *sql.DB, viewer habbo.Habbo, name string) (IgnoreResult, error) {
	q := store.New(db)
	target, err := q.GetAvatarByName(ctx, name)
	if store.IsNotFound(err) || (err == nil && target.ID == viewer.ID) {
		return IgnoreFailed, nil
	}
	if err != nil {
		return 0, fmt.Errorf("game: ignore: %w", err)
	}
	result, ignored, err := ignore(ctx, db, viewer.ID, target.ID)
	if err != nil {
		return 0, fmt.Errorf("game: ignore: %w", err)
	}
	habbo.Update(viewer.ID, viewer.Session, func(h *habbo.Habbo) { h.Ignored = ignored })
	return result, nil
}

func ignore(ctx context.Context, db *sql.DB, avatarID, targetID int64) (IgnoreResult, []int64, error) {
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		return 0, nil, err
	}
	defer tx.Rollback()
	q := store.New(tx)
	list, err := q.ListIgnoredHabbos(ctx, avatarID)
	if err != nil {
		return 0, nil, err
	}
	ids := make([]int64, 0, len(list)+1)
	for _, row := range list {
		ids = append(ids, row.IgnoredAvatarID)
	}
	result := IgnoreAdded
	if !slices.Contains(ids, targetID) {
		for most := settings.GetIntOr("game.maxIgnoredHabbos", 100); len(ids) >= most; ids = ids[1:] {
			if _, err := q.UnignoreHabbo(ctx, store.UnignoreHabboParams{AvatarID: avatarID, IgnoredAvatarID: ids[0]}); err != nil {
				return 0, nil, err
			}
			result = IgnoreAddedOldestDropped
		}
		if err := q.IgnoreHabbo(ctx, store.IgnoreHabboParams{AvatarID: avatarID, IgnoredAvatarID: targetID, CreatedAt: time.Now().UTC()}); err != nil {
			return 0, nil, err
		}
		ids = append(ids, targetID)
	}
	return result, ids, tx.Commit()
}

// Unignore takes the habbo name off the viewer's ignore list (UNIGNORE_USER).
func Unignore(ctx context.Context, db *sql.DB, viewer habbo.Habbo, name string) (IgnoreResult, error) {
	q := store.New(db)
	target, err := q.GetAvatarByName(ctx, name)
	if store.IsNotFound(err) {
		return IgnoreFailed, nil
	}
	if err != nil {
		return 0, fmt.Errorf("game: unignore: %w", err)
	}
	n, err := q.UnignoreHabbo(ctx, store.UnignoreHabboParams{AvatarID: viewer.ID, IgnoredAvatarID: target.ID})
	if err != nil {
		return 0, fmt.Errorf("game: unignore: %w", err)
	}
	if n == 0 {
		return IgnoreFailed, nil
	}
	habbo.Update(viewer.ID, viewer.Session, func(h *habbo.Habbo) {
		h.Ignored = slices.DeleteFunc(h.Ignored, func(id int64) bool { return id == target.ID })
	})
	return IgnoreRemoved, nil
}

// IgnoreList returns the names of the habbos the viewer ignores, oldest first (GET_IGNORE_LIST).
func IgnoreList(ctx context.Context, db *sql.DB, viewer habbo.Habbo) ([]string, error) {
	rows, err := store.New(db).ListIgnoredHabbos(ctx, viewer.ID)
	if err != nil {
		return nil, fmt.Errorf("game: ignore list: %w", err)
	}
	names := make([]string, len(rows))
	for i, row := range rows {
		names[i] = row.Name
	}
	return names, nil
}

// PruneChat deletes the lines of the chat history older than game.chatHistoryDays at now (plans/server decisions 0066
// and 0084), and logs how many went.
func PruneChat(ctx context.Context, db *sql.DB, now time.Time) error {
	days := settings.GetIntOr("game.chatHistoryDays", 30)
	n, err := store.New(db).DeleteChatMessagesBefore(ctx, now.UTC().AddDate(0, 0, -days))
	if err != nil {
		return fmt.Errorf("game: prune chat: %w", err)
	}
	if n > 0 {
		slog.Info(fmt.Sprintf("game: pruned %d chat lines older than %d days", n, days))
	}
	return nil
}
